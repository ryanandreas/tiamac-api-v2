export const SERVICE_STEPS = [
  { id: 1, label: "Booking", value: "Booking" },
  { id: 2, label: "Jadwal", value: "Menunggu Jadwal" },
  { id: 3, label: "Konfirmasi", value: "Konfirmasi Teknisi" },
  { id: 4, label: "Pengecekan", value: "Pengecekan Unit" },
  { id: 5, label: "Persetujuan", value: "Menunggu Persetujuan Customer" },
  { id: 6, label: "Pengerjaan", value: "Perbaikan Unit" },
  { id: 7, label: "Pembayaran", value: "Menunggu Pembayaran" },
  { id: 8, label: "Selesai", value: "Selesai" },
] as const;

export type ServiceStepValue = typeof SERVICE_STEPS[number]["value"];

export const getStepIndex = (status: string) => {
  const index = SERVICE_STEPS.findIndex(step => 
    step.value.toLowerCase() === status.toLowerCase() || 
    (status.toLowerCase().includes("selesai") && step.value === "Selesai") ||
    (status.toLowerCase().includes("konfirmasi") && step.value === "Konfirmasi Teknisi")
  );
  return index === -1 ? 0 : index;
};
