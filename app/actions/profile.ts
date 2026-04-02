'use server'

import { db } from "@/lib/db";
import { getCurrentUser } from "./session";
import { revalidatePath } from "next/cache";

export async function updateStaffProfile(formData: FormData) {
  const user = await getCurrentUser();

  if (!user.isAuthenticated || user.type !== "staff") {
    return { success: false, message: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const no_telp = formData.get("no_telp") as string;
  const wilayah = formData.get("wilayah") as string;
  const bio = formData.get("bio") as string;

  try {
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { name },
      }),
      db.staffProfile.update({
        where: { userId: user.id },
        data: {
          no_telp,
          wilayah,
          bio,
        } as any, // Cast to any because Prisma types might be stale
      }),
    ]);

    revalidatePath("/dashboard/profile");
    return { success: true, message: "Profil berhasil diperbarui" };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, message: "Gagal memperbarui profil" };
  }
}
