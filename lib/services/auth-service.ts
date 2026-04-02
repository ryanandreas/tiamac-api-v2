import { db } from "@/lib/db";
import { AuthLoginSchema, AuthSignupSchema } from "@/lib/validations/schemas";
import bcrypt from "bcryptjs";

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
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { staffProfile: true, customerProfile: true },
    });

    if (!user) throw new Error("User tidak ditemukan");
    if (user.status !== "ACTIVE") throw new Error("Akun dinonaktifkan");

    // 3. Password Verification (with gradual migration to hash)
    let isMatch = false;
    const dbPassword = user.password || "";

    if (dbPassword === password) {
      // PLAIN TEXT MATCH: Migrate to hash now
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      isMatch = true;
    } else {
      // CHECK HASH
      try {
        isMatch = await bcrypt.compare(password, dbPassword);
      } catch (e) {
        // Not a valid hash
        isMatch = false;
      }
    }

    if (!isMatch) throw new Error("Password salah");

    return user;
  }

  static async updateLastLogin(id: string) {
    return db.user.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  static async registerCustomer(input: any) {
    // 1. Validation
    const result = AuthSignupSchema.safeParse(input);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Input tidak valid";
      throw new Error(firstError);
    }

    const { name, email, no_telp, provinsi, alamat, password } = result.data;

    // 2. Check if email exists
    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    if (existing) throw new Error("Email sudah terdaftar");

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create User & Profile in Transaction
    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          status: "ACTIVE",
          customerProfile: {
            create: {
              no_telp,
              provinsi,
              alamat
            }
          }
        },
        include: {
          customerProfile: true
        }
      });
      return newUser;
    });

    return user;
  }
}

