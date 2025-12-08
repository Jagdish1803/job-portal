"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { toast } from "sonner"

interface SignInFormData {
  role: "JOB_SEEKER" | "JOB_POSTER" | ""
  email: string
  password: string
}

export default function SignInPage(): React.JSX.Element {
  const [formData, setFormData] = useState<SignInFormData>({
    role: "",
    email: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleChange = (role: "JOB_SEEKER" | "JOB_POSTER") => {
    setFormData(prev => ({ ...prev, role }))
  }

  const handleInputChange = (field: keyof SignInFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        // Store user data in localStorage and cookies
        localStorage.setItem('user', JSON.stringify(result.user))
        if (result.token) {
          localStorage.setItem('token', result.token)
        }
        
        // Set cookies for server-side authentication
        document.cookie = `user=${JSON.stringify(result.user)}; path=/; max-age=86400; secure; samesite=strict`
        if (result.token) {
          document.cookie = `token=${result.token}; path=/; max-age=86400; secure; samesite=strict`
        }
        
        toast.success('Welcome back! Redirecting...')
        // Redirect based on user role
        setTimeout(() => {
          if (result.user.role === 'JOB_SEEKER') {
            window.location.href = '/job-seeker-dashboard'
          } else if (result.user.role === 'JOB_POSTER') {
            window.location.href = '/job-poster-dashboard'
          } else {
            window.location.href = '/'
          }
        }, 1500)
      } else {
        toast.error(result.error || 'Invalid credentials. Please try again.')
      }
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
        <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-semibold text-gray-900">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to your account to continue your job search
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange("JOB_SEEKER")}
                className={`py-3 px-4 text-sm font-medium rounded-xl border-2 transition-all ${
                  formData.role === "JOB_SEEKER"
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                Job Seekers
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("JOB_POSTER")}
                className={`py-3 px-4 text-sm font-medium rounded-xl border-2 transition-all ${
                  formData.role === "JOB_POSTER"
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                Job Posters
              </button>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10 h-12 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 font-medium"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="pl-10 pr-10 h-12 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading || !formData.role}
              className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/sign-up" className="text-gray-900 hover:text-gray-700 font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}