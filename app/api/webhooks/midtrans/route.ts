import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Verify Signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const signatureSource = body.order_id + body.status_code + body.gross_amount + serverKey;
    const expectedSignature = crypto.createHash("sha512").update(signatureSource).digest("hex");

    if (expectedSignature !== body.signature_key) {
      return NextResponse.json({ message: "Invalid Signature" }, { status: 403 });
    }

    // 2. Identify the order
    const paymentId = body.order_id;
    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;

    // 3. Find the Payment record
    const paymentRecord = await db.servicePayment.findUnique({
      where: { id: paymentId },
      include: { service: true },
    });

    if (!paymentRecord) {
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

    // 5. Update the ServicePayment Record
    await db.servicePayment.update({
      where: { id: paymentId },
      data: {
        status: status,
        metodePembayaran: body.payment_type,
        waktuPembayaran: body.settlement_time ? new Date(body.settlement_time) : null,
        midtransTransactionId: body.transaction_id,
        paymentDetails: body, // Store the full callback body for reference
      },
    });

    // 6. Handle Service State Transition if Settlement
    if (status === "SETTLEMENT") {
      const serviceId = paymentRecord.serviceId;
      const paymentType = paymentRecord.type;

      if (paymentType === "DOWN_PAYMENT") {
        // Workflow: Booking -> Menunggu Jadwal
        await db.services.update({
          where: { id: serviceId },
          data: {
            status_servis: "Menunggu Jadwal",
          },
        });

        await db.serviceStatusHistory.create({
          data: {
            serviceId: serviceId,
            status: "Status",
            status_servis: "Menunggu Jadwal",
            notes: "Pembayaran DP Berhasil via Midtrans",
          },
        });
      } else if (paymentType === "FULL_PAYMENT") {
        // Workflow: Menunggu Pembayaran -> Selesai (Garansi Aktif)
        await db.services.update({
          where: { id: serviceId },
          data: {
            status_servis: "Selesai (Garansi Aktif)",
          },
        });

        await db.serviceStatusHistory.create({
          data: {
            serviceId: serviceId,
            status: "Status",
            status_servis: "Selesai (Garansi Aktif)",
            notes: "Pembayaran Pelunasan Berhasil via Midtrans",
          },
        });
      }
    }

    return NextResponse.json({ message: "OK" });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
