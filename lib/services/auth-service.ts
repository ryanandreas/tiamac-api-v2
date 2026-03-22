import { db } from "@/lib/db";
import { AuthLoginSchema } from "@/lib/validations/schemas";

export class AuthService {
  static async validateUser(input: any) {
    // 1. Validation Layer (Zod)
    const result = AuthLoginSchema.safeParse(input);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Input tidak valid";
      throw new Error(firstError);
    }

    const { email, password } = result.data;

    // 2. Pure DB logic
    const user = await db.users.findUnique({
      where: { email: email.toLowerCase() },
      include: { staffProfile: true, customerProfile: true },
    });

    if (!user) throw new Error("User tidak ditemukan");
    if (user.status !== "ACTIVE") throw new Error("Akun dinonaktifkan");
    if (user.password !== password) throw new Error("Password salah");

    return user;
  }

  static async updateLastLogin(uuid: string) {
    return db.users.update({
      where: { uuid },
      data: { lastLogin: new Date() },
    });
  }
}

