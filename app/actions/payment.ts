'use server'

import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { coreApi } from "@/lib/midtrans"
import { randomUUID } from "crypto"

export async function chargePayment(serviceId: string, paymentType: "DOWN_PAYMENT" | "FULL_PAYMENT", method: string, bank?: string) {
  try {
    const service = await db.services.findUnique({
      where: { id: serviceId },
      include: { customer: true },
    });

    if (!service) {
      return { success: false, message: "Service not found" };
    }

    // Determine Amount
    const amount = paymentType === "DOWN_PAYMENT" ? (service.biaya_dasar ?? 50000) : (service.biaya ?? 0);

    // 1. Create a record in ServicePayment
    const payment = await (db as any).servicePayment.create({
      data: {
        serviceId,
        type: paymentType,
        amount,
        status: "PENDING",
        metodePembayaran: method,
        bank: bank,
      },
    });

    // 2. Prepare Midtrans Charge Parameters
    const parameter: any = {
      payment_type: method,
      transaction_details: {
        order_id: payment.id,
        gross_amount: amount,
      },
      customer_details: {
        first_name: service.customer.name,
        email: service.customer.email,
      },
      item_details: [
        {
          id: service.id,
          price: amount,
          quantity: 1,
          name: `${paymentType === "DOWN_PAYMENT" ? "DP Booking" : "Pelunasan"} - ${service.jenis_servis}`,
        },
      ],
      notification_url: "https://actiam.vercel.app/api/webhooks/midtrans",
    };

    if (method === "bank_transfer" && bank) {
      parameter.bank_transfer = {
        bank: bank,
      };
    }

    // 3. Call Core API Charge
    const response = await coreApi.charge(parameter);

    // 4. Extract Payment Instructions from Response
    let vaNumber = "";
    let expiryTime = "";
    let qrUrl = "";

    if (method === "bank_transfer") {
      const vaDetails = response.va_numbers?.[0];
      vaNumber = vaDetails?.va_number || "";
      expiryTime = response.expiry_time || "";
    } else if (method === "qris" || method === "gopay") {
      // Find the QR action or URL
      const qrAction = response.actions?.find((a: any) => a.name === "generate-qr-code");
      qrUrl = qrAction?.url || "";
    }

    // 5. Update Payment Record with Instructions
    await (db as any).servicePayment.update({
      where: { id: payment.id },
      data: {
        vaNumber,
        qrUrl,
        midtransTransactionId: response.transaction_id,
        expiryTime: expiryTime ? new Date(expiryTime) : null,
        paymentDetails: response as any,
      },
    });

    return {
      success: true,
      message: "Charge initiated",
      va_number: vaNumber,
      qr_url: qrUrl,
      bank: bank,
      expiry_time: expiryTime,
    };
  } catch (error: any) {
    console.error("Midtrans Core API Error:", error);
    return {
      success: false,
      message: error.message || "Failed to initiate payment",
    };
  }
}
