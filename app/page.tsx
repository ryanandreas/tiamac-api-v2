import HeroSection from "@/components/hero-section"
import FooterSection from "@/components/footer"
import { getCurrentUser } from "@/app/actions/session"

export default async function Page() {
  const user = await getCurrentUser()

  return (
    <>
      <HeroSection user={user} />
      <FooterSection />
    </>
  )
}
