"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  X, 
  Wrench, 
  MapPin, 
  Receipt, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Calendar,
  History,
  User2
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getServiceDetail } from "@/app/actions/booking";
import { format, formatDistanceToNow, parse } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface ServiceStatusHistoryDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  serviceId: string | null;
  trigger?: React.ReactNode;
  mode?: "customer" | "staff";
  showApprovalActions?: boolean;
  onApprove?: () => Promise<void>;
  isApproving?: boolean;
}

const SERVICE_STEPS = [
  { status: "BOOKING_DIBUAT", label: "Booking" },
  { status: "TEKNISI_DITUGASKAN", label: "Penugasan" },
  { status: "DALAM_PENGERJAAN", label: "Progres" },
  { status: "MENUNGGU_PEMBAYARAN", label: "Billing" },
  { status: "SELESAI", label: "Selesai" },
];

export function ServiceStatusHistoryDialog({
  open,
  onOpenChange,
  serviceId,
  trigger,
  mode = "customer",
  showApprovalActions = false,
  onApprove,
  isApproving = false,
}: ServiceStatusHistoryDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? (onOpenChange || (() => {})) : setInternalOpen;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);

  const fetchDetail = async () => {
    if (!serviceId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await getServiceDetail(serviceId);
      if (response) {
        setData(response);
      } else {
        setError("Gagal mengambil data detail: Pesanan tidak ditemukan");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && serviceId) {
      fetchDetail();
    } else if (!isOpen) {
      // Small delay to prevent layout jump while dialog is closing
      setTimeout(() => {
        setData(null);
        setError(null);
      }, 300);
    }
  }, [isOpen, serviceId]);

  const currentStepIndex = useMemo(() => {
    if (!data) return 0;
    const index = SERVICE_STEPS.findIndex(step => step.status === data.status_booking);
    return index === -1 ? 0 : index;
  }, [data]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      )}
      <DialogContent className="max-w-[1440px] w-full p-0 overflow-hidden border-none rounded-[32px] shadow-2xl bg-[#F8FAFC] focus:outline-none">
        {!data && (
          <div className="sr-only">
            <DialogTitle>{loading ? "Memuat Detail" : error ? "Error" : "Detail Pengerjaan"}</DialogTitle>
          </div>
        )}
        
        {loading ? (
          <div className="flex flex-col h-[600px] items-center justify-center gap-6">
            <div className="relative">
                <div className="size-16 rounded-full border-4 border-[#66B21D]/20 border-t-[#66B21D] animate-spin" />
                <Wrench className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-[#66B21D]" />
            </div>
            <p className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-[0.2em]">Memuat Detail...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col h-[600px] items-center justify-center gap-4 text-center px-10">
            <div className="size-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-2">
                <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 leading-tight">{error}</h3>
            <Button variant="outline" onClick={fetchDetail} className="mt-4 rounded-xl font-bold">Coba Lagi</Button>
          </div>
        ) : data ? (
          <div className="flex flex-col h-screen max-h-[92vh] bg-[#F8FAFC] font-sans">
            {/* Header Redesign v3 (Sticky) */}
            <div className="p-6 pb-4 border-b border-[#F1F5F9] bg-white z-20 shrink-0">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-[800] text-[#0F172A] leading-tight tracking-tight font-display mb-1">
                    Detail Pengerjaan
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-[600] text-[#64748B] tracking-wide">ORDER</span>
                    <span className="text-sm font-[800] text-[#0F172A]">#{data.id?.slice(-8).toUpperCase()}</span>
                    <div className="size-1 rounded-full bg-[#CBD5E1]" />
                    <span className="text-sm font-[600] text-[#66B21D]">{data.status_servis}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsOpen(false)} 
                    className="size-12 p-0 rounded-2xl bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] transition-all shrink-0"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              </div>

              {/* Progress Line */}
              <div className="w-full h-1 bg-[#CBD5E1]/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#66B21D] transition-all duration-1000 ease-in-out shadow-[0_0_8px_rgba(102,178,29,0.4)]"
                  style={{ width: `${(currentStepIndex / (SERVICE_STEPS.length - 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Scrollable Content Wrapper */}
            <div 
              data-lenis-prevent
              className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-6"
            >
              {/* Triple Info Bar (Paper Exact) */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-5 mb-8">
                {/* Tanggal Kunjungan */}
                <div className="lg:col-span-2 flex items-center gap-3.5 bg-white border border-[#E2E8F0] rounded-[22px] p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="size-11 rounded-[18px] bg-[#F1F5F9] flex items-center justify-center text-[#475569] shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-[700] text-[#94A3B8] uppercase tracking-[0.12em] mb-0.5">Tanggal Kunjungan</p>
                    <p className="text-sm font-[800] text-[#1E293B] truncate">
                      {(() => {
                        const rawJadwal = data.keluhan?.match(/Jadwal:\s*(.*)/i)?.[1]?.trim();
                        if (!rawJadwal) return "Menunggu Konfirmasi";
                        try {
                          const parsedDate = parse(rawJadwal, "yyyy-MM-dd HH:mm", new Date());
                          return format(parsedDate, "dd MMMM yyyy, HH:mm", { locale: localeId });
                        } catch (e) {
                          return rawJadwal;
                        }
                      })()}
                    </p>
                  </div>
                </div>

                {/* Conditional Info Slot */}
                {mode === "staff" ? (
                  /* Pelanggan (for Technical/Staff view) */
                  <div className="lg:col-span-2 flex items-center gap-3.5 bg-[#EFF6FF] border border-[#DBEAFE] rounded-[22px] p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="size-11 rounded-[18px] bg-white flex items-center justify-center text-[#1E40AF] shrink-0">
                      <User2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-[700] text-[#1E40AF]/60 uppercase tracking-[0.12em] mb-0.5">Nama Pelanggan</p>
                      <p className="text-sm font-[800] text-[#1E293B] truncate">{data.customer?.name || "-"}</p>
                    </div>
                  </div>
                ) : (
                  /* Teknisi (for Customer view) */
                  <div className="lg:col-span-2 flex items-center gap-3.5 bg-[#F0FDF4] border border-[#DCFCE7] rounded-[22px] p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="size-11 rounded-[18px] bg-white flex items-center justify-center text-[#166534] shrink-0">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-[700] text-[#166534]/60 uppercase tracking-[0.12em] mb-0.5">Teknisi</p>
                      <p className="text-sm font-[800] text-[#166534] truncate">{data.teknisi?.name || "Belum Ditugaskan"}</p>
                    </div>
                  </div>
                )}

                {/* Lokasi */}
                <div className="lg:col-span-3 flex items-center gap-3.5 bg-[#FFF7ED] border border-[#FFEDD5] rounded-[22px] p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="size-11 rounded-[18px] bg-white flex items-center justify-center text-[#9A3412] shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-[700] text-[#9A3412]/60 uppercase tracking-[0.12em] mb-0.5">Lokasi Pengerjaan</p>
                    <p className="text-sm font-[800] text-[#9A3412] truncate">
                      {data.alamat_servis || data.keluhan?.split('\n').find((l: string) => l.trim().toLowerCase().startsWith('alamat:'))?.replace(/alamat:\s*/i, '') || data.customer?.customerProfile?.alamat || "Alamat tidak tersedia"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                {/* Left: Billing Table (7/10) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white border border-[#E2E8F0] rounded-[28px] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-[800] text-[#0F172A] leading-[24px]">Rincian Pengerjaan & Suku Cadang</h2>
                      <div className="bg-[#F1F5F9] rounded-full px-3 py-1.5">
                        <span className="text-[10px] font-[800] text-[#475569] uppercase tracking-[0.1em]">Lampiran Tagihan</span>
                      </div>
                    </div>

                    <div className="border border-[#F1F5F9] rounded-[20px] overflow-hidden">
                      {/* Table Header */}
                      <div className="grid grid-cols-10 bg-[#F8FAFC] border-b border-[#F1F5F9] p-4">
                        <div className="col-span-4 text-[11px] font-[800] text-[#94A3B8] uppercase">Deskripsi Pekerjaan</div>
                        <div className="col-span-2 text-[11px] font-[800] text-[#94A3B8] uppercase text-center">Jumlah</div>
                        <div className="col-span-2 text-[11px] font-[800] text-[#94A3B8] uppercase text-right">Unit Price</div>
                        <div className="col-span-2 text-[11px] font-[800] text-[#94A3B8] uppercase text-right">Subtotal</div>
                      </div>

                      {/* Visit Fee Row */}
                      <div className="grid grid-cols-10 items-center p-4 border-b border-[#F8FAFC]">
                        <div className="col-span-4">
                          <p className="text-sm font-[700] text-[#334155]">Biaya Kunjungan & Pemeriksaan</p>
                          <p className="text-[10px] text-[#94A3B8] mt-1">Standar pemeriksaan unit & transportasi</p>
                        </div>
                        <div className="col-span-2 text-sm font-[600] text-[#64748B] text-center">1x</div>
                        <div className="col-span-2 text-sm font-[600] text-[#64748B] text-right">Rp {data.biaya_dasar?.toLocaleString('id-ID') || '50.000'}</div>
                        <div className="col-span-2 text-sm font-[800] text-[#0F172A] text-right">Rp {data.biaya_dasar?.toLocaleString('id-ID') || '50.000'}</div>
                      </div>

                      {/* Services Rows */}
                      {data.acUnits?.flatMap((unit: any, uIdx: number) => 
                        unit.layanan.map((l: any, lIdx: number) => (
                          <div key={`${unit.id}-${l.id}`} className="grid grid-cols-10 items-center p-4 bg-[#FCFDFB] border-b border-[#F8FAFC]">
                            <div className="col-span-4">
                              <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-[#66B21D]" />
                                <p className="text-sm font-[700] text-[#334155]">{l.nama}</p>
                              </div>
                              <p className="text-[10px] text-[#94A3B8] mt-0.5 ml-4">Unit AC {uIdx + 1} ({unit.pk} PK)</p>
                            </div>
                            <div className="col-span-2 text-sm font-[600] text-[#64748B] text-center">1x</div>
                            <div className="col-span-2 text-sm font-[600] text-[#64748B] text-right">Rp {l.harga?.toLocaleString('id-ID')}</div>
                            <div className="col-span-2 text-sm font-[800] text-[#0F172A] text-right">Rp {l.harga?.toLocaleString('id-ID')}</div>
                          </div>
                        ))
                      )}

                      {/* Material Rows */}
                      {data.materialUsages?.map((usage: any) => (
                        <div key={usage.id} className="grid grid-cols-10 items-center p-4 border-b border-[#F8FAFC]">
                          <div className="col-span-4">
                            <div className="flex items-center gap-2">
                              <div className="size-2 rounded-full bg-[#F97316]" />
                              <p className="text-sm font-[700] text-[#334155]">{usage.item?.nama}</p>
                            </div>
                            <p className="text-[10px] text-[#94A3B8] mt-0.5 ml-4">Suku Cadang / Material Tambahan</p>
                          </div>
                          <div className="col-span-2 text-sm font-[600] text-[#64748B] text-center">{usage.qty}x</div>
                          <div className="col-span-2 text-sm font-[600] text-[#64748B] text-right">Rp {usage.harga_satuan?.toLocaleString('id-ID')}</div>
                          <div className="col-span-2 text-sm font-[800] text-[#0F172A] text-right">Rp {(usage.qty * usage.harga_satuan)?.toLocaleString('id-ID')}</div>
                        </div>
                      ))}

                      {/* Total Footer (Paper Exact) */}
                      <div className="grid grid-cols-10 items-center bg-[#0F172A] p-4 pr-6">
                        <div className="col-span-6 text-[11px] font-[800] text-[#94A3B8] uppercase tracking-[0.12em]">Total Pembayaran</div>
                        <div className="col-span-4 text-xl font-[900] text-[#FFFFFF] text-right leading-tight">
                           Rp {(data.biaya || data.estimasi_biaya || 450000).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>

                    {/* Warranty Banner (Paper Exact) */}
                    <div className="flex items-center gap-4 bg-[#F0FDF4] border border-dashed border-[#66B21D] rounded-[18px] p-4 mt-6">
                      <div className="size-9 rounded-xl bg-[#66B21D] flex items-center justify-center text-white shrink-0">
                        <ShieldCheck className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="text-sm font-[800] text-[#166534]">Garansi Pekerjaan Aktif</p>
                        <p className="text-[11px] font-[600] text-[#166534]/80 mt-0.5 leading-tight">
                          Layanan ini dilindungi garansi resmi TIAMAC selama 30 hari ke depan.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: History Timeline (3/10) */}
                <div className="lg:col-span-3">
                  <div className="bg-white border border-[#E2E8F0] rounded-[28px] p-6 h-full">
                    <h2 className="text-lg font-[800] text-[#0F172A] mb-8">Riwayat Status</h2>
                    <div className="relative space-y-6 pl-2">
                        {/* Timeline Line */}
                        <div className="absolute top-2 bottom-2 left-[10px] w-0.5 bg-[#F1F5F9]" />
                        
                        {data.statusHistory?.map((history: any, idx: number) => (
                            <div key={history.id} className="relative pl-10">
                                <div className={`
                                    absolute left-[-6px] top-0 size-[32px] rounded-full border-[4px] border-white z-10 flex items-center justify-center transition-all duration-500
                                    ${idx === 0 ? 'bg-[#66B21D] shadow-[0_0_0_4px_#F0FDF4]' : 'bg-[#F1F5F9]'}
                                `}>
                                    {idx === 0 ? (
                                        <CheckCircle2 className="h-4 w-4 text-white" />
                                    ) : (
                                        <div className="size-1.5 rounded-full bg-[#CBD5E1]" />
                                    )}
                                </div>
                                <div className={idx === 0 ? "" : "opacity-60"}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-sm font-[700] ${idx === 0 ? 'text-[#0F172A]' : 'text-[#475569]'}`}>
                                            {history.status}
                                        </span>
                                        {idx === 0 && (
                                            <span className="px-2 py-0.5 rounded-lg bg-green-50 text-[8px] font-black text-[#66B21D] uppercase tracking-wider">
                                                TERBARU
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[12px] text-[#94A3B8] leading-relaxed">
                                        {history.notes || "Status diperbarui."}
                                    </p>
                                    <p className="text-[11px] font-[600] text-[#CBD5E1] mt-2">
                                        {format(new Date(history.createdAt), "dd MMM, HH:mm", { locale: localeId })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Action Footer v3 */}
            {showApprovalActions && !loading && !error && data && (
              <div className="p-6 bg-white border-t border-[#F1F5F9] shrink-0 z-30">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-[0.2em] mb-1">Total yang disetujui</p>
                    <p className="text-xl font-[900] text-[#0F172A]">
                      Rp {(data.biaya || data.estimasi_biaya || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button 
                      variant="ghost" 
                      onClick={() => setIsOpen(false)}
                      disabled={isApproving}
                      className="flex-1 sm:flex-none h-14 px-8 rounded-2xl font-[800] text-xs text-[#64748B] hover:bg-[#F1F5F9] transition-all uppercase tracking-widest border border-transparent"
                    >
                      Batal
                    </Button>
                    <Button 
                      onClick={() => setShowConfirmAlert(true)}
                      disabled={isApproving}
                      className="flex-1 sm:flex-none h-14 px-10 rounded-2xl bg-[#66B21D] hover:bg-[#5aa11a] text-white font-[900] text-xs shadow-[0_12px_24px_-8px_rgba(102,178,29,0.4)] transition-all active:scale-95 uppercase tracking-widest border-none"
                    >
                      {isApproving ? (
                        <div className="flex items-center gap-3">
                           <div className="size-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                           Memproses...
                        </div>
                      ) : (
                        "Setujui Estimasi"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>

      {/* Final Approval Confirmation Alert */}
      <Dialog open={showConfirmAlert} onOpenChange={setShowConfirmAlert}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-[32px] shadow-2xl z-[100]">
          <div className="bg-white p-8 space-y-6">
            <div className="size-20 rounded-[24px] bg-green-50 text-[#66B21D] flex items-center justify-center mx-auto shadow-sm border border-green-100/50">
              <ShieldCheck className="size-10" />
            </div>
            
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-[900] text-slate-900 tracking-tight uppercase tracking-widest">Setujui Estimasi?</h3>
              <p className="text-sm font-[600] text-slate-500 leading-relaxed px-4">
                Dengan melanjutkan, Anda menyetujui rincian biaya tersebut dan tim teknisi kami akan segera memulai pengerjaan unit AC Anda.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowConfirmAlert(false)}
                className="h-14 rounded-2xl font-[800] text-xs text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest"
                disabled={isApproving}
              >
                Kembali
              </Button>
              <Button 
                onClick={async () => {
                  if (onApprove) {
                    await onApprove();
                    setShowConfirmAlert(false);
                  }
                }}
                className="h-14 rounded-2xl bg-[#66B21D] hover:bg-[#5aa11a] text-white font-[900] text-xs shadow-lg shadow-green-500/20 transition-all active:scale-95 uppercase tracking-widest"
                disabled={isApproving}
              >
                {isApproving ? "Proses..." : "Ya, Lanjutkan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
