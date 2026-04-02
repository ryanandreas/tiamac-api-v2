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
  History
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getServiceDetail } from "@/app/actions/booking";
import { format, formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface ServiceStatusHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string | null;
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
}: ServiceStatusHistoryDialogProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (open && serviceId) {
      fetchDetail();
    } else if (!open) {
      // Small delay to prevent layout jump while dialog is closing
      setTimeout(() => {
        setData(null);
        setError(null);
      }, 300);
    }
  }, [open, serviceId]);

  const currentStepIndex = useMemo(() => {
    if (!data) return 0;
    const index = SERVICE_STEPS.findIndex(step => step.status === data.status_booking);
    return index === -1 ? 0 : index;
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1440px] w-full p-0 overflow-hidden border-none rounded-[40px] shadow-2xl bg-[#F8FAFC] focus:outline-none">
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
            <div className="p-10 pb-6 border-b border-[#F1F5F9] bg-white z-20 shrink-0">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-[32px] font-[800] text-[#0F172A] leading-[40px] tracking-tight font-display mb-2">
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
                    onClick={() => onOpenChange(false)} 
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
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pt-10">
              {/* Triple Info Bar (Paper Exact) */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-6 mb-10">
                {/* Pelanggan */}
                <div className="lg:col-span-2 flex items-center gap-4 bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="size-14 rounded-[20px] bg-[#F1F5F9] flex items-center justify-center text-[#475569] font-[800] text-lg shrink-0">
                    {data.customer?.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-[700] text-[#94A3B8] uppercase tracking-[0.15em] mb-1">Pelanggan</p>
                    <p className="text-base font-[800] text-[#1E293B] truncate">{data.customer?.name}</p>
                  </div>
                </div>

                {/* Teknisi */}
                <div className="lg:col-span-2 flex items-center gap-4 bg-[#F0FDF4] border border-[#DCFCE7] rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="size-14 rounded-[20px] bg-white flex items-center justify-center text-[#166534] shrink-0">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-[700] text-[#166534]/60 uppercase tracking-[0.15em] mb-1">Teknisi</p>
                    <p className="text-base font-[800] text-[#166534] truncate">{data.teknisi?.name || "Belum Ditugaskan"}</p>
                  </div>
                </div>

                {/* Lokasi */}
                <div className="lg:col-span-3 flex items-center gap-4 bg-[#FFF7ED] border border-[#FFEDD5] rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="size-14 rounded-[20px] bg-white flex items-center justify-center text-[#9A3412] shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-[700] text-[#9A3412]/60 uppercase tracking-[0.15em] mb-1">Lokasi Pengerjaan</p>
                    <p className="text-base font-[800] text-[#9A3412] truncate">
                      {data.keluhan.split('\n').find((l: string) => l.trim().toLowerCase().startsWith('alamat:'))?.replace(/alamat:\s*/i, '') || "Alamat tidak tersedia"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-10">
                {/* Left: Billing Table (7/10) */}
                <div className="lg:col-span-7 space-y-8">
                  <div className="bg-white border border-[#E2E8F0] rounded-[32px] p-10 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-[20px] font-[800] text-[#0F172A] leading-[24px]">Rincian Pengerjaan & Suku Cadang</h2>
                      <div className="bg-[#F1F5F9] rounded-full px-4 py-2">
                        <span className="text-[11px] font-[800] text-[#475569] uppercase tracking-[0.1em]">Lampiran Tagihan</span>
                      </div>
                    </div>

                    <div className="border border-[#F1F5F9] rounded-[24px] overflow-hidden">
                      {/* Table Header */}
                      <div className="grid grid-cols-10 bg-[#F8FAFC] border-b border-[#F1F5F9] p-5">
                        <div className="col-span-4 text-[11px] font-[800] text-[#94A3B8] uppercase">Deskripsi Pekerjaan</div>
                        <div className="col-span-2 text-[11px] font-[800] text-[#94A3B8] uppercase text-center">Jumlah</div>
                        <div className="col-span-2 text-[11px] font-[800] text-[#94A3B8] uppercase text-right">Unit Price</div>
                        <div className="col-span-2 text-[11px] font-[800] text-[#94A3B8] uppercase text-right">Subtotal</div>
                      </div>

                      {/* Visit Fee Row */}
                      <div className="grid grid-cols-10 items-center p-6 border-b border-[#F8FAFC]">
                        <div className="col-span-4">
                          <p className="text-sm font-[700] text-[#334155]">Biaya Kunjungan & Pemeriksaan</p>
                          <p className="text-[11px] text-[#94A3B8] mt-1">Standar pemeriksaan unit & transportasi</p>
                        </div>
                        <div className="col-span-2 text-sm font-[600] text-[#64748B] text-center">1x</div>
                        <div className="col-span-2 text-sm font-[600] text-[#64748B] text-right">Rp {data.biaya_dasar?.toLocaleString('id-ID') || '50.000'}</div>
                        <div className="col-span-2 text-sm font-[800] text-[#0F172A] text-right">Rp {data.biaya_dasar?.toLocaleString('id-ID') || '50.000'}</div>
                      </div>

                      {/* Services Rows */}
                      {data.acUnits?.flatMap((unit: any, uIdx: number) => 
                        unit.layanan.map((l: any, lIdx: number) => (
                          <div key={`${unit.id}-${l.id}`} className="grid grid-cols-10 items-center p-6 bg-[#FCFDFB] border-b border-[#F8FAFC]">
                            <div className="col-span-4">
                              <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-[#66B21D]" />
                                <p className="text-sm font-[700] text-[#334155]">{l.nama}</p>
                              </div>
                              <p className="text-[11px] text-[#94A3B8] mt-1 ml-4">Unit AC {uIdx + 1} ({unit.pk} PK)</p>
                            </div>
                            <div className="col-span-2 text-sm font-[600] text-[#64748B] text-center">1x</div>
                            <div className="col-span-2 text-sm font-[600] text-[#64748B] text-right">Rp {l.harga?.toLocaleString('id-ID')}</div>
                            <div className="col-span-2 text-sm font-[800] text-[#0F172A] text-right">Rp {l.harga?.toLocaleString('id-ID')}</div>
                          </div>
                        ))
                      )}

                      {/* Material Rows */}
                      {data.materialUsages?.map((usage: any) => (
                        <div key={usage.id} className="grid grid-cols-10 items-center p-6 border-b border-[#F8FAFC]">
                          <div className="col-span-4">
                            <div className="flex items-center gap-2">
                              <div className="size-2 rounded-full bg-[#F97316]" />
                              <p className="text-sm font-[700] text-[#334155]">{usage.item?.nama}</p>
                            </div>
                            <p className="text-[11px] text-[#94A3B8] mt-1 ml-4">Suku Cadang / Material Tambahan</p>
                          </div>
                          <div className="col-span-2 text-sm font-[600] text-[#64748B] text-center">{usage.qty}x</div>
                          <div className="col-span-2 text-sm font-[600] text-[#64748B] text-right">Rp {usage.harga_satuan?.toLocaleString('id-ID')}</div>
                          <div className="col-span-2 text-sm font-[800] text-[#0F172A] text-right">Rp {(usage.qty * usage.harga_satuan)?.toLocaleString('id-ID')}</div>
                        </div>
                      ))}

                      {/* Total Footer (Paper Exact) */}
                      <div className="grid grid-cols-10 items-center bg-[#0F172A] p-6 pr-8">
                        <div className="col-span-6 text-[12px] font-[800] text-[#94A3B8] uppercase tracking-[0.15em]">Total Pembayaran</div>
                        <div className="col-span-4 text-[24px] font-[900] text-[#FFFFFF] text-right leading-[30px]">
                           Rp {(data.biaya || data.estimasi_biaya || 450000).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>

                    {/* Warranty Banner (Paper Exact) */}
                    <div className="flex items-center gap-4 bg-[#F0FDF4] border border-dashed border-[#66B21D] rounded-[20px] p-6 mt-8">
                      <div className="size-10 rounded-xl bg-[#66B21D] flex items-center justify-center text-white shrink-0">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-[800] text-[#166534]">Garansi Pekerjaan Aktif</p>
                        <p className="text-[12px] font-[600] text-[#166534]/80 mt-1 leading-tight">
                          Layanan ini dilindungi garansi resmi TIAMAC selama 30 hari ke depan.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: History Timeline (3/10) */}
                <div className="lg:col-span-3">
                  <div className="bg-white border border-[#E2E8F0] rounded-[32px] p-10 h-full">
                    <h2 className="text-[20px] font-[800] text-[#0F172A] mb-10">Riwayat Status</h2>
                    <div className="relative space-y-10 pl-2">
                        {/* Timeline Line */}
                        <div className="absolute top-2 bottom-2 left-[12px] w-0.5 bg-[#F1F5F9]" />
                        
                        {data.statusHistory?.map((history: any, idx: number) => (
                            <div key={history.id} className="relative pl-12">
                                <div className={`
                                    absolute left-[-6px] top-0 size-[38px] rounded-full border-[4px] border-white z-10 flex items-center justify-center transition-all duration-500
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

            {/* Footer Placeholder for Actions (Sticky) */}
            <div className="p-8 border-t border-[#F1F5F9] bg-white shrink-0">
               <div className="flex justify-between items-center max-w-[1200px] mx-auto px-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-[#475569]">
                        <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Total Tagihan Final</p>
                        <p className="text-xl font-black text-[#0F172A]">
                            Rp {(data.biaya || data.estimasi_biaya || 0).toLocaleString('id-ID')}
                        </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => onOpenChange(false)}
                    className="h-12 px-10 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-[800] text-sm uppercase tracking-widest transition-all"
                  >
                    Tutup Rincian
                  </Button>
               </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
