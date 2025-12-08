"use client"

import React, { useEffect } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { GetStartedSection } from "@/components/get-started-section"
import { Footer } from "@/components/footer"

export default function Home(): React.JSX.Element {
  useEffect(() => {
    // Check if user is already authenticated and redirect to appropriate dashboard
    const user = localStorage.getItem('user')
    
    if (user) {
      try {
        const userData = JSON.parse(user)
        
        if (userData.id && userData.role) {
          // User is authenticated, redirect to appropriate dashboard
          if (userData.role === 'JOB_SEEKER') {
            window.location.href = '/job-seeker-dashboard'
          } else if (userData.role === 'JOB_POSTER' || userData.role === 'EMPLOYER') {
            window.location.href = '/job-poster-dashboard'
          }
        }
      } catch (error) {
        // Invalid user data, clear it
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
    }
  }, [])

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
