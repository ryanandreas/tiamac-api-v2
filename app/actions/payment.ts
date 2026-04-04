"use server";

import { db } from "@/lib/db";
import { coreApi } from "@/lib/midtrans";
import { getCurrentUser } from "./session";
import { PaymentType } from "@prisma/client";

export type ActionResponse = {
  success: boolean;
  message: string;
  va_number?: string;
  qr_url?: string;
  bank?: string;
  expiry_time?: string;
};

export async function chargePayment(
  serviceId: string,
  paymentType: "DOWN_PAYMENT" | "FULL_PAYMENT",
  method: "bank_transfer" | "qris" | "gopay",
  bank?: string
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAuthenticated) {
      return { success: false, message: "Unauthorized" };
    }

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
    const payment = await db.servicePayment.create({
      data: {
        serviceId,
        type: paymentType,
        amount,
        status: "PENDING",
        metodePembayaran: method,
        bank: bank,
      },
    });

    // 2. Prepare Midtrans Request
    const parameter: any = {
      payment_type: method === "bank_transfer" ? "bank_transfer" : method,
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
      callbacks: {
        new_order_url: "https://actiam.vercel.app/customer-panel/pesanan/" + serviceId,
        finish_url: "https://actiam.vercel.app/customer-panel/pesanan/" + serviceId,
        error_url: "https://actiam.vercel.app/customer-panel/pesanan/" + serviceId,
        notification_url: "https://actiam.vercel.app/api/webhooks/midtrans",
      },
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
    let qrUrl = "";
    let expiryTime = response.expiry_time;

    if (method === "bank_transfer") {
      if (bank === "mandiri") {
          vaNumber = response.bill_key; // Mandiri uses bill_key
      } else if (response.va_numbers && response.va_numbers.length > 0) {
          vaNumber = response.va_numbers[0].va_number;
      }
    } else if (method === "qris" || method === "gopay") {
      // Find the QR action or URL
      const qrAction = response.actions?.find((a: any) => a.name === "generate-qr-code");
      qrUrl = qrAction?.url || "";
    }

    // 5. Update Payment Record with Instructions
    await db.servicePayment.update({
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
