import { db } from "@/lib/db";
import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";

export class UserService {
  static async findByEmail(email: string) {
    return db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { staffProfile: true, customerProfile: true },
    });
  }

  static async registerOrUpdateGuest(data: {
    name: string;
    email: string;
    no_telp: string;
  }) {
    const normalizedEmail = data.email.toLowerCase();
    const user = await this.findByEmail(normalizedEmail);

    if (user?.staffProfile) {
      throw new Error("Email sudah digunakan akun staff. Gunakan email lain.");
    }

    if (user) {
      await db.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { name: data.name, email: normalizedEmail },
        });
        await tx.customerProfile.upsert({
          where: { userId: user.id },
          update: { no_telp: data.no_telp },
          create: { userId: user.id, no_telp: data.no_telp },
        });
      });
      return user;
    } else {
      const password = `guest_${randomUUID()}`;
      return db.user.create({
        data: {
          name: data.name,
          email: normalizedEmail,
          password,
          customerProfile: {
            create: {
              no_telp: data.no_telp,
            },
          },
        },
      });
    }
  }

  static async getCustomerById(id: string) {
    return db.user.findUnique({
      where: { id },
      include: { customerProfile: true },
    });
  }
  static async updateProfile(id: string, data: {
    name: string;
    email: string;
    no_telp: string;
    provinsi?: string;
    alamat?: string;
    password?: string;
  }) {
    return db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
          ...(data.password ? { password: data.password } : {}),
        },
      });

      await tx.customerProfile.upsert({
        where: { userId: id },
        update: {
          no_telp: data.no_telp,
          provinsi: data.provinsi || null,
          alamat: data.alamat || null,
        },
        create: {
          userId: id,
          no_telp: data.no_telp,
          provinsi: data.provinsi || null,
          alamat: data.alamat || null,
        },
      });
    });
  }
}
