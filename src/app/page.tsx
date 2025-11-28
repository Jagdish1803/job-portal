import React from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { GetStartedSection } from "@/components/get-started-section"
import { Footer } from "@/components/footer"

export default function Home(): React.JSX.Element {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="bg-gradient-to-b from-blue-50 to-white">
        <HeroSection />
        <GetStartedSection />
      </main>
      <Footer />
    </div>
  )
}
