import HeroSection from "@/components/hero-section";
import FooterSection from "@/components/footer";
import { LandingServices } from "@/components/landing/landing-services";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingTestimonials } from "@/components/landing/landing-testimonials";
import { getCurrentUser } from "@/app/actions/session";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getCurrentUser();

  if (user.isAuthenticated) {
    if (user.type === "staff") {
      redirect("/dashboard");
    }
  }

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
