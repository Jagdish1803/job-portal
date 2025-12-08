"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, User, Mail, Lock, Phone, Briefcase } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { toast } from "sonner"

interface SignUpFormData {
  role: "JOB_SEEKER" | "JOB_POSTER" | ""
  fullName: string
  email: string
  password: string
  mobileNumber: string
  workStatus: string
  acceptUpdates: boolean
  // Job Seeker specific fields
  experience?: string
  // Job Poster specific fields
  companyName?: string
  jobTitle?: string
  companySize?: string
}

const workStatusOptions = [
  { value: "fresher", label: "Fresher" },
  { value: "experienced", label: "Experienced Professional" },
  { value: "student", label: "Student" },
  { value: "unemployed", label: "Currently Unemployed" },
  { value: "employed", label: "Currently Employed" },
  { value: "freelancer", label: "Freelancer" },
  { value: "entrepreneur", label: "Entrepreneur" },
  { value: "recruiter", label: "Recruiter/HR Professional" },
  { value: "business_owner", label: "Business Owner" }
]

export default function SignUpPage(): React.JSX.Element {
  const [formData, setFormData] = useState<SignUpFormData>({
    role: "",
    fullName: "",
    email: "",
    password: "",
    mobileNumber: "+91 ",
    workStatus: "",
    acceptUpdates: false,
    experience: "",
    companyName: "",
    jobTitle: "",
    companySize: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleChange = (role: "JOB_SEEKER" | "JOB_POSTER") => {
    setFormData(prev => ({ ...prev, role }))
  }

  const handleInputChange = (field: keyof SignUpFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate role-specific required fields
    if (formData.role === "JOB_SEEKER" && !formData.workStatus) {
      toast.error("Please select your work status")
      setIsLoading(false)
      return
    }
    if (formData.role === "JOB_POSTER" && (!formData.companyName || !formData.jobTitle)) {
      toast.error("Please fill in company name and job title")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Account created successfully! Redirecting...')
        
        // Store user data and redirect to appropriate dashboard
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user))
          
          // Create a token if not provided (for development)
          const token = result.token || `temp-token-${Date.now()}`
          localStorage.setItem('token', token)
          
          // Set cookies for server-side authentication
          document.cookie = `user=${JSON.stringify(result.user)}; path=/; max-age=86400; secure; samesite=strict`
          document.cookie = `token=${token}; path=/; max-age=86400; secure; samesite=strict`
          
          // Immediate redirect based on role
          setTimeout(() => {
            if (formData.role === 'JOB_POSTER' || result.user.role === 'JOB_POSTER') {
              window.location.href = '/job-poster-dashboard'
            } else if (formData.role === 'JOB_SEEKER' || result.user.role === 'JOB_SEEKER') {
              window.location.href = '/job-seeker-dashboard'
            } else {
              window.location.href = '/dashboard'
            }
          }, 1500)
        } else {
          // Fallback to sign-in if no user data
          setTimeout(() => {
            window.location.href = '/sign-in'
          }, 2000)
        }
      } else {
        toast.error(result.error || 'Something went wrong. Please try again.')
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
            Create Your Account
          </CardTitle>
          <CardDescription className="text-gray-600">
            Join thousands of professionals and find your dream job
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

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="pl-10 h-12 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 font-medium"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
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
                  placeholder="Create a strong password"
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

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.mobileNumber}
                  onChange={(e) => {
                    // Allow only numbers, +, spaces, and hyphens
                    let value = e.target.value.replace(/[^+\d\s-]/g, '')
                    
                    // Ensure +91 is always at the beginning
                    if (!value.startsWith('+91')) {
                      if (value.startsWith('+')) {
                        value = '+91 ' + value.slice(1).trim()
                      } else {
                        value = '+91 ' + value.trim()
                      }
                    }
                    
                    handleInputChange("mobileNumber", value)
                  }}
                  className="pl-10 h-12 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 font-medium"
                  maxLength={17}
                />
              </div>
            </div>

            {/* Role-specific fields */}
            {formData.role === "JOB_SEEKER" && (
              <>
                {/* Work Status for Job Seekers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Status
                  </label>
                  <Select value={formData.workStatus} onValueChange={(value) => handleInputChange("workStatus", value)}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 font-medium">
                      <div className="flex items-center">
                        <Briefcase className="mr-2 text-gray-400 w-5 h-5" />
                        <SelectValue placeholder="Select your work status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {workStatusOptions.filter(option => 
                        ['fresher', 'experienced', 'student', 'unemployed', 'employed', 'freelancer'].includes(option.value)
                      ).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience Level for Job Seekers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <Select value={formData.experience || ""} onValueChange={(value) => handleInputChange("experience", value)}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 font-medium">
                      <div className="flex items-center">
                        <Briefcase className="mr-2 text-gray-400 w-5 h-5" />
                        <SelectValue placeholder="Select your experience level" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
                      <SelectItem value="senior">Senior Level (5-10 years)</SelectItem>
                      <SelectItem value="lead">Lead/Manager (10+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {formData.role === "JOB_POSTER" && (
              <>
                {/* Company Name for Job Posters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Enter your company name"
                      value={formData.companyName || ""}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      className="pl-10 h-12 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Job Title/Role for Job Posters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Job Title
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="e.g., HR Manager, Recruiter, CEO"
                      value={formData.jobTitle || ""}
                      onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                      className="pl-10 h-12 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Company Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size
                  </label>
                  <Select value={formData.companySize || ""} onValueChange={(value) => handleInputChange("companySize", value)}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 font-medium">
                      <div className="flex items-center">
                        <Briefcase className="mr-2 text-gray-400 w-5 h-5" />
                        <SelectValue placeholder="Select company size" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup (1-10 employees)</SelectItem>
                      <SelectItem value="small">Small (11-50 employees)</SelectItem>
                      <SelectItem value="medium">Medium (51-200 employees)</SelectItem>
                      <SelectItem value="large">Large (201-1000 employees)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (1000+ employees)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* SMS/Email Updates Checkbox */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="acceptUpdates"
                checked={formData.acceptUpdates}
                onChange={(e) => handleInputChange("acceptUpdates", e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="acceptUpdates" className="text-sm text-gray-600">
                Send me important updates via SMS/Email/WhatsApp
              </label>
            </div>

            {/* Create Account Button */}
            <Button
              type="submit"
              disabled={isLoading || !formData.role}
              className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-gray-900 hover:text-gray-700 font-medium">
                  Sign in here
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