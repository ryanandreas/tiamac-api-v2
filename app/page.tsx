import type { Metadata } from "next";
import HeroSection from "@/components/hero-section";
import FooterSection from "@/components/footer";
import { LandingServices } from "@/components/landing/landing-services";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingTestimonials } from "@/components/landing/landing-testimonials";
import { getCurrentUser } from "@/app/actions/session";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Tiam AC - Solusi Dingin & Hemat untuk AC Anda",
  description: "Platform layanan AC terpercaya. Pesan teknisi profesional untuk cuci AC, perbaikan, dan instalasi dengan garansi 30 hari.",
};

export default async function Page() {
  const user = await getCurrentUser();

  // Redirect dihapus agar user logged in tetap bisa melihat page / (Landing Page)

  return (
    <>
      <HeroSection user={user} />
      <LandingServices />
      <LandingHowItWorks />
      <LandingTestimonials />
      <FooterSection />
    </>
  );
}
