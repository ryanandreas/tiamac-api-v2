'use server'

import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { coreApi } from "@/lib/midtrans"
import { randomUUID } from "crypto"

export async function chargePayment(serviceId: string, paymentType: "DOWN_PAYMENT" | "FULL_PAYMENT", method: string, bank?: string) {
  try {
    const service = await db.services.findUnique({
      where: { id: serviceId },
      include: { 
        customer: true,
        acUnits: {
          include: {
            layanan: true,
          }
        }
      },
    });

    if (!service) {
      return { success: false, message: "Service not found" };
    }

    // Determine Amount logic matching frontend replacement strategy
    const biayaKunjungan = service.biaya_dasar ?? 50000;
    const layananTotal = service.acUnits?.reduce(
      (sum, unit) => sum + unit.layanan.reduce((inner, layanan) => inner + layanan.harga, 0),
      0
    ) ?? 0;
    
    const totalEstimasi = biayaKunjungan + layananTotal;
    const totalFinal = service.biaya ?? service.estimasi_biaya ?? totalEstimasi;

    let amount = 0;
    if (paymentType === "DOWN_PAYMENT") {
      amount = biayaKunjungan;
    } else {
      // For FULL_PAYMENT, we assume it's the remaining balance (Total - DP)
      amount = Math.max(0, totalFinal - biayaKunjungan);
      
      // If the result is 0 (maybe DP wasn't required or already paid?), 
      // and it's full payment, we use the totalFinal
      if (amount === 0) amount = totalFinal;
    }

    // Safety check for Midtrans
    if (amount <= 0) {
      return { success: false, message: "Nominal pembayaran tidak valid (0)." };
    }

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
    let expiryTime = response.expiry_time || "";
    let qrUrl = "";
    let bankName = bank || "";

    if (method === "bank_transfer") {
      const vaDetails = response.va_numbers?.[0];
      vaNumber = vaDetails?.va_number || response.permata_va_number || "";
      bankName = vaDetails?.bank || (response.permata_va_number ? "permata" : bankName);
    } else if (method === "echannel") {
      vaNumber = response.bill_key || ""; // Bill Key behaves like VA
      bankName = "mandiri";
    } else if (method === "cstore") {
      vaNumber = response.payment_code || ""; // Payment Code behaves like VA
      bankName = response.store || "";
    } else if (method === "qris" || method === "gopay") {
      const qrAction = response.actions?.find((a: any) => a.name === "generate-qr-code");
      qrUrl = qrAction?.url || "";
    }

    // 5. Update Payment Record with Instructions
    await (db as any).servicePayment.update({
      where: { id: payment.id },
      data: {
        vaNumber,
        qrUrl,
        bank: bankName,
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

export async function checkPaymentStatus(serviceId: string) {
  try {
    const payment = await (db as any).servicePayment.findFirst({
      where: {
        serviceId,
        status: "SETTLEMENT",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (payment) {
      return { success: true, status: "SETTLEMENT" };
    }

    return { success: false, status: "PENDING" };
  } catch (error: any) {
    console.error("Check Payment Status Error:", error);
    return { success: false, error: error.message };
  }
}
