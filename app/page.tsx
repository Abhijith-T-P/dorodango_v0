import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Problem } from "@/components/problem"
import { HowItWorks } from "@/components/how-it-works"
import { Impact } from "@/components/impact"
import { GetInvolved } from "@/components/get-involved"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Problem />
      <HowItWorks />
      <Impact />
      <GetInvolved />
      <Footer />
    </main>
  )
}
