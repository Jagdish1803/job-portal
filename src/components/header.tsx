"use client"

import { Button } from "@/components/ui/button"
import { Building2, Menu, X } from "lucide-react"
import React, { useState } from "react"

interface NavLink {
  href: string
  label: string
}

const navigationLinks: NavLink[] = [
  { href: "/jobs", label: "Find Jobs" },
  { href: "/signin", label: "Sign In" },
  { href: "/employers", label: "Employers/Post Job" }
]

export function Header(): React.JSX.Element {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-light text-gray-900 tracking-tight">
              Talent HR Corner
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-12 ml-auto">
            <a 
              href="/signin" 
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-300 relative group text-sm"
            >
              Sign In
              <span className="absolute inset-x-0 -bottom-1 h-px bg-gray-900 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </a>
            <a 
              href="/employers" 
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-300 relative group text-sm"
            >
              Employers/Post Job
              <span className="absolute inset-x-0 -bottom-1 h-px bg-gray-900 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white/90 backdrop-blur-xl">
            <div className="px-6 pt-6 pb-8 space-y-6">
              <a
                href="/signin"
                className="block text-gray-700 hover:text-gray-900 font-medium py-3 transition-colors duration-300 text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </a>
              <a
                href="/employers"
                className="block text-gray-700 hover:text-gray-900 font-medium py-3 transition-colors duration-300 text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Employers/Post Job
              </a>
              <div className="pt-6 border-t border-gray-100">
                <Button className="w-full justify-center bg-gray-900 hover:bg-gray-800 text-white font-medium h-12 rounded-xl">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}