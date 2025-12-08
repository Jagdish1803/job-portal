"use client"

import React, { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication on client side
    const checkAuth = () => {
      const user = localStorage.getItem('user')
      
      if (!user) {
        window.location.href = '/sign-in'
        return
      }

      try {
        const userData = JSON.parse(user)
        if (!userData.id || !userData.role) {
          window.location.href = '/sign-in'
          return
        }
        
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Invalid user data:', error)
        window.location.href = '/sign-in'
        return
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Show loading or nothing while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to sign-in
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset className="bg-muted/30">
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}