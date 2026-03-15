import HeroSection from "@/components/hero-section"
import FooterSection from "@/components/footer"
import { getCurrentUser } from "@/app/actions/session"
import { redirect } from "next/navigation"

export default async function Page() {
  const user = await getCurrentUser()

  if (user.isAuthenticated) {
    if (user.type === "staff") {
      redirect("/dashboard")
    }
  }

  return (
    <>
      <HeroSection user={user} />
      <FooterSection />
    </>
  )
}
