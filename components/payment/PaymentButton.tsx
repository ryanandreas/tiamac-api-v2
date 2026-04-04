"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentButtonProps {
  serviceId: string;
  type: "DOWN_PAYMENT" | "FULL_PAYMENT";
  amount: number;
  label?: string;
  className?: string;
}

export function PaymentButton({
  serviceId,
  label,
  className,
  type,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNavigateToPayment = () => {
    setLoading(true);
    // Langsung arahkan ke halaman detail pesanan di mana Custom UI Payment Chooser berada
    router.push(`/customer-panel/pesanan/${serviceId}`);
  };

  return (
    <Button
      onClick={handleNavigateToPayment}
      disabled={loading}
      className={className || "bg-[#66B21D] hover:bg-[#4d9e0f] text-white rounded-xl font-bold gap-2 shadow-lg shadow-green-200/50 transition-all hover:scale-[1.02] active:scale-95"}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4" />
      )}
      {label || (type === "DOWN_PAYMENT" ? "Bayar DP" : "Lunasi Sekarang")}
      {!loading && <ArrowRight className="h-3 w-3 opacity-50 ml-1" />}
    </Button>
  );
}
