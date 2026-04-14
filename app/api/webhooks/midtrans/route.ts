import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔔 Midtrans Webhook Received:", JSON.stringify(body, null, 2));

    // 1. Verify Signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    // Midtrans SHA512 Signature: order_id + status_code + gross_amount + ServerKey
    const signatureSource = body.order_id + body.status_code + body.gross_amount + serverKey;
    const expectedSignature = crypto.createHash("sha512").update(signatureSource).digest("hex");

    console.log("🔑 Signature Check:", {
      received: body.signature_key,
      calculated: expectedSignature,
      match: body.signature_key === expectedSignature
    });

    if (expectedSignature !== body.signature_key) {
      console.error("❌ Invalid Midtrans Signature");
      return NextResponse.json({ message: "Invalid Signature" }, { status: 403 });
    }

    // 2. Identify the order
    const paymentId = body.order_id;
    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;

    // 3. Find the Payment record
    const paymentRecord = await (db as any).servicePayment.findUnique({
      where: { id: paymentId },
      include: { service: true },
    });

    if (!paymentRecord) {
      console.error("❌ Payment Record Not Found:", paymentId);
      return NextResponse.json({ message: "Payment Not Found" }, { status: 404 });
    }

    // 4. Determine final status for ServicePayment
    let status = "PENDING";
    if (transactionStatus === "capture") {
      if (fraudStatus === "challenge") {
        status = "CHALLENGE";
      } else if (fraudStatus === "accept") {
        status = "SETTLEMENT";
      }
    } else if (transactionStatus === "settlement") {
      status = "SETTLEMENT";
    } else if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "expire") {
      status = "FAILURE";
    } else if (transactionStatus === "pending") {
      status = "PENDING";
    }

    // 4.1 Advanced Parsing of Payment Details
    let bank = body.bank || null;
    let vaNumber = body.va_numbers?.[0]?.va_number || body.permata_va_number || body.bill_key || body.payment_code || null;
    let qrUrl = null;
    let methodLabel = body.payment_type;

    // Specific logic per payment type
    if (body.payment_type === "bank_transfer") {
      bank = body.va_numbers?.[0]?.bank || (body.permata_va_number ? "permata" : null);
    } else if (body.payment_type === "echannel") {
      bank = "mandiri";
      vaNumber = body.bill_key; // For Mandiri Bill, Bill Key is treated as VA Number for UI
    } else if (body.payment_type === "cstore") {
      bank = body.store;
    } else if (body.payment_type === "credit_card") {
      bank = body.bank;
    }

    console.log(`ℹ️ Transaction Status: ${transactionStatus}, Final Status: ${status}, Method: ${methodLabel}, Bank: ${bank}`);

    // 5. Update the ServicePayment Record
    await (db as any).servicePayment.update({
      where: { id: paymentId },
      data: {
        status: status,
        metodePembayaran: methodLabel,
        bank: bank,
        vaNumber: vaNumber,
        waktuPembayaran: body.settlement_time ? new Date(body.settlement_time) : (status === "SETTLEMENT" ? new Date() : null),
        midtransTransactionId: body.transaction_id,
        paymentDetails: body, // Store the full callback body for reference
      },
    });

    // 6. Handle Service State Transition if Settlement
    if (status === "SETTLEMENT") {
      const serviceId = paymentRecord.serviceId;
      const paymentType = paymentRecord.type;
      
      console.log(`✅ Payment Settled for Service: ${serviceId}, Type: ${paymentType}`);

      if (paymentType === "DOWN_PAYMENT") {
        // Workflow: Booking -> Menunggu Jadwal
        await db.services.update({
          where: { id: serviceId },
          data: { status_servis: "Menunggu Jadwal" },
        });

        await db.serviceStatusHistory.create({
          data: {
            serviceId: serviceId,
            status: "Status",
            status_servis: "Menunggu Jadwal",
            notes: "Pembayaran DP Berhasil (Midtrans)",
          },
        });
        console.log("🚀 Service Status Updated: Menunggu Jadwal");
      } else if (paymentType === "FULL_PAYMENT") {
        // Workflow: ONLY change to Selesai if tech is already done (status is Menunggu Pembayaran or Pekerjaan Selesai)
        const currentService = paymentRecord.service;
        const allowedStatuses = ["Menunggu Pembayaran", "Pekerjaan Selesai"];
        const shouldUpdateStatus = allowedStatuses.includes(currentService.status_servis);

        if (shouldUpdateStatus) {
            await db.services.update({
              where: { id: serviceId },
              data: { status_servis: "Selesai (Garansi Aktif)" },
            });

            await db.serviceStatusHistory.create({
              data: {
                serviceId: serviceId,
                status: "Status",
                status_servis: "Selesai (Garansi Aktif)",
                notes: "Pembayaran Pelunasan Berhasil (Midtrans). Pekerjaan sudah selesai, status menjadi Selesai.",
              },
            });
            console.log("🚀 Service Status Updated: Selesai (Garansi Aktif)");
        } else {
            console.log(`ℹ️ Pelunasan Berhasil, but Service still in status: ${currentService.status_servis}. Waiting for tech completion.`);
            await db.serviceStatusHistory.create({
              data: {
                serviceId: serviceId,
                status: "Status",
                status_servis: currentService.status_servis,
                notes: "Pembayaran Pelunasan Berhasil (Midtrans). Menunggu teknisi menyelesaikan perbaikan.",
              },
            });
        }
      }
    }

    return NextResponse.json({ message: "OK" });
  } catch (error: any) {
    console.error("❌ Webhook Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
