"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { createPaymentToken } from "@/app/actions/payment";
import { useRouter } from "next/navigation";

interface PaymentButtonProps {
  serviceId: string;
  type: "DOWN_PAYMENT" | "FULL_PAYMENT";
  amount: number;
  label?: string;
  className?: string;
}

declare global {
  interface Window {
    snap: any;
  }
}

export function PaymentButton({
  serviceId,
  type,
  amount,
  label,
  className,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await createPaymentToken(serviceId, type, amount);

      if (res.success && res.token) {
        window.snap.pay(res.token, {
          onSuccess: function (result: any) {
            /* You may add your own implementation here */
            console.log("payment success!", result);
            router.refresh();
          },
          onPending: function (result: any) {
            /* You may add your own implementation here */
            console.log("payment pending!", result);
            router.refresh();
          },
          onError: function (result: any) {
            /* You may add your own implementation here */
            console.error("payment error!", result);
          },
          onClose: function () {
            /* You may add your own implementation here */
            console.log("customer closed the popup without finishing the payment");
          },
        });
      } else {
        alert(res.message || "Gagal membuat token pembayaran");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Terjadi kesalahan sistem saat memproses pembayaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className={className || "bg-[#66B21D] hover:bg-[#4d9e0f] text-white rounded-xl font-bold gap-2 shadow-lg shadow-green-200/50 transition-all hover:scale-[1.02] active:scale-95"}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4" />
      )}
      {label || (type === "DOWN_PAYMENT" ? "Bayar DP" : "Lunasi Sekarang")}
    </Button>
  );
}
