import { z } from "zod";

export const BookingUnitSchema = z.object({
  pk: z.number().min(0.5, "PK minimal 0.5"),
  layanan: z.array(z.string()).min(1, "Pilih minimal 1 layanan"),
});

export const CreateBookingSchema = z.object({
  customerId: z.string().uuid("Customer ID tidak valid").optional(),
  keluhan: z.string().min(5, "Keluhan minimal 5 karakter"),
  alamat: z.string().min(5, "Alamat minimal 5 karakter"),
  jadwalTanggal: z.string().min(1, "Jadwal wajib diisi"),
  units: z.array(BookingUnitSchema).min(1, "Minimal 1 unit AC"),
  guestInfo: z.object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    no_telp: z.string().min(10, "Nomor telp minimal 10 digit"),
  }).optional(),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

export const AuthLoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type AuthLoginInput = z.infer<typeof AuthLoginSchema>;
