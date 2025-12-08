"use client"

import React, { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Building2, MapPin, DollarSign, Clock, Users, Briefcase } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface JobPostData {
  title: string
  description: string
  requirements: string
  responsibilities: string
  benefits: string
  jobType: string
  workMode: string
  experienceLevel: string
  location: string
  salaryMin: string
  salaryMax: string
  currency: string
  applicationEmail: string
  skills: string
  applicationDeadline: string
}

// Popular locations for autocomplete
const POPULAR_LOCATIONS = [
  "Mumbai, Maharashtra",
  "Bangalore, Karnataka",
  "Delhi, New Delhi",
  "Hyderabad, Telangana",
  "Chennai, Tamil Nadu",
  "Pune, Maharashtra",
  "Kolkata, West Bengal",
  "Ahmedabad, Gujarat",
  "Jaipur, Rajasthan",
  "Surat, Gujarat",
  "Lucknow, Uttar Pradesh",
  "Kanpur, Uttar Pradesh",
  "Nagpur, Maharashtra",
  "Indore, Madhya Pradesh",
  "Thane, Maharashtra",
  "Bhopal, Madhya Pradesh",
  "Visakhapatnam, Andhra Pradesh",
  "Pimpri-Chinchwad, Maharashtra",
  "Patna, Bihar",
  "Vadodara, Gujarat",
  "Ghaziabad, Uttar Pradesh",
  "Ludhiana, Punjab",
  "Agra, Uttar Pradesh",
  "Nashik, Maharashtra",
  "Faridabad, Haryana",
  "Meerut, Uttar Pradesh",
  "Rajkot, Gujarat",
  "Kalyan-Dombivali, Maharashtra",
  "Vasai-Virar, Maharashtra",
  "Varanasi, Uttar Pradesh",
  "Srinagar, Jammu and Kashmir",
  "Aurangabad, Maharashtra",
  "Dhanbad, Jharkhand",
  "Amritsar, Punjab",
  "Navi Mumbai, Maharashtra",
  "Allahabad, Uttar Pradesh",
  "Ranchi, Jharkhand",
  "Howrah, West Bengal",
  "Coimbatore, Tamil Nadu",
  "Jabalpur, Madhya Pradesh",
  "Gwalior, Madhya Pradesh",
  "Vijayawada, Andhra Pradesh",
  "Jodhpur, Rajasthan",
  "Madurai, Tamil Nadu",
  "Raipur, Chhattisgarh",
  "Kota, Rajasthan",
  "Guwahati, Assam",
  "Chandigarh, Chandigarh",
  "Thiruvananthapuram, Kerala",
  "Solapur, Maharashtra",
  "Remote",
  "Work from Home",
  "Hybrid",
  "New York, USA",
  "San Francisco, USA",
  "London, UK",
  "Toronto, Canada",
  "Singapore",
  "Dubai, UAE",
  "Berlin, Germany",
  "Sydney, Australia"
]

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }): React.JSX.Element {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [jobLoading, setJobLoading] = useState(true)
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [jobId, setJobId] = useState<string>("")
  const [formData, setFormData] = useState<JobPostData>({
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    jobType: "",
    workMode: "",
    experienceLevel: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    currency: "INR",
    applicationEmail: "",
    skills: "",
    applicationDeadline: ""
  })

  useEffect(() => {
    const initializeJobData = async () => {
      const resolvedParams = await params
      setJobId(resolvedParams.id)
      loadJobData(resolvedParams.id)
    }
    initializeJobData()
  }, [])

  const loadJobData = async (id: string) => {
    try {
      // Check if user is logged in and is a job poster
      const userData = localStorage.getItem('user')
      if (!userData) {
        window.location.href = '/sign-in'
        return
      }

      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== 'JOB_POSTER') {
        window.location.href = '/job-seeker-dashboard'
        return
      }

      setUser(parsedUser)

      // Fetch job data
      const response = await fetch(`/api/jobs/${id}`)
      if (response.ok) {
        const data = await response.json()
        const job = data.job

        // Populate form with existing data
        setFormData({
          title: job.title || "",
          description: job.description || "",
          requirements: job.requirements || "",
          responsibilities: job.responsibilities || "",
          benefits: job.benefits || "",
          jobType: job.jobType || "",
          workMode: job.workMode || "",
          experienceLevel: job.experienceLevel || "",
          location: job.location || "",
          salaryMin: job.salaryMin?.toString() || "",
          salaryMax: job.salaryMax?.toString() || "",
          currency: job.currency || "INR",
          applicationEmail: job.applicationEmail || parsedUser.email,
          skills: job.skills?.map((s: any) => s.skill.name).join(", ") || "",
          applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : ""
        })
      } else {
        toast.error("Failed to load job data")
        window.location.href = '/job-poster-dashboard'
      }
    } catch (error) {
      console.error('Error loading job:', error)
      toast.error("Failed to load job data")
    } finally {
      setJobLoading(false)
    }
  }

  const handleInputChange = (field: keyof JobPostData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Handle location autocomplete
    if (field === 'location') {
      handleLocationChange(value)
    }
  }

  const handleLocationChange = (value: string) => {
    if (value.length > 0) {
      const suggestions = POPULAR_LOCATIONS.filter(location =>
        location.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8) // Show max 8 suggestions
      
      setLocationSuggestions(suggestions)
      setShowLocationSuggestions(suggestions.length > 0)
    } else {
      setLocationSuggestions([])
      setShowLocationSuggestions(false)
    }
  }

  const selectLocationSuggestion = (location: string) => {
    setFormData(prev => ({ ...prev, location }))
    setShowLocationSuggestions(false)
    setLocationSuggestions([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate required fields
    if (!formData.title || !formData.description || !formData.jobType || !formData.workMode) {
      toast.error("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          posterId: user.id,
          skills: formData.skills.split(',').map((skill: string) => ({
            skillId: skill.trim(),
            isRequired: true
          })).filter((skill: any) => skill.skillId)
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Job updated successfully!')
        setTimeout(() => {
          window.location.href = '/job-poster-dashboard'
        }, 2000)
      } else {
        toast.error(result.error || 'Failed to update job. Please try again.')
      }
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (jobLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading job data...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <main className="px-4 lg:px-6">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">Edit Job</h1>
                      <p className="text-muted-foreground">
                        Update your job posting details
                      </p>
                    </div>
                    <Link href="/job-poster-dashboard">
                      <Button variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Job Details
              </CardTitle>
              <CardDescription>
                Update basic information about the position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <Input
                  placeholder="e.g., Senior React Developer"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="h-12 border-2 border-gray-200 rounded-xl focus:border-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type *
                  </label>
                  <Select value={formData.jobType} onValueChange={(value) => handleInputChange("jobType", value)}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL_TIME">Full Time</SelectItem>
                      <SelectItem value="PART_TIME">Part Time</SelectItem>
                      <SelectItem value="CONTRACT">Contract</SelectItem>
                      <SelectItem value="FREELANCE">Freelance</SelectItem>
                      <SelectItem value="INTERNSHIP">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Mode *
                  </label>
                  <Select value={formData.workMode} onValueChange={(value) => handleInputChange("workMode", value)}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl">
                      <SelectValue placeholder="Select work mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REMOTE">Remote</SelectItem>
                      <SelectItem value="ON_SITE">On-site</SelectItem>
                      <SelectItem value="HYBRID">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <Select value={formData.experienceLevel} onValueChange={(value) => handleInputChange("experienceLevel", value)}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENTRY_LEVEL">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="MID_LEVEL">Mid Level (2-5 years)</SelectItem>
                      <SelectItem value="SENIOR_LEVEL">Senior Level (5+ years)</SelectItem>
                      <SelectItem value="EXECUTIVE">Executive Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <Input
                  placeholder="e.g., Mumbai, Maharashtra or Remote"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  onFocus={() => {
                    if (formData.location && locationSuggestions.length > 0) {
                      setShowLocationSuggestions(true)
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding suggestions to allow clicking on them
                    setTimeout(() => setShowLocationSuggestions(false), 200)
                  }}
                  className="h-12 border-2 border-gray-200 rounded-xl focus:border-gray-900"
                />
                
                {/* Location Suggestions Dropdown */}
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {locationSuggestions.map((location, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center"
                        onClick={() => selectLocationSuggestion(location)}
                      >
                        <MapPin className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                        <span className="text-gray-700">{location}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>
                Update the role description and requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <Textarea
                  placeholder="Provide a detailed description of the role, company, and what makes this opportunity exciting..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="min-h-32 border-2 border-gray-200 rounded-xl focus:border-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements
                </label>
                <Textarea
                  placeholder="List the required skills, qualifications, and experience..."
                  value={formData.requirements}
                  onChange={(e) => handleInputChange("requirements", e.target.value)}
                  className="min-h-24 border-2 border-gray-200 rounded-xl focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsibilities
                </label>
                <Textarea
                  placeholder="Describe the day-to-day responsibilities and tasks..."
                  value={formData.responsibilities}
                  onChange={(e) => handleInputChange("responsibilities", e.target.value)}
                  className="min-h-24 border-2 border-gray-200 rounded-xl focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills & Technologies
                </label>
                <Input
                  placeholder="React, Node.js, TypeScript, MongoDB (comma-separated)"
                  value={formData.skills}
                  onChange={(e) => handleInputChange("skills", e.target.value)}
                  className="h-12 border-2 border-gray-200 rounded-xl focus:border-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter skills separated by commas
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Compensation & Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Compensation & Benefits
              </CardTitle>
              <CardDescription>
                Update compensation details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Salary (Annual)
                  </label>
                  <Input
                    type="number"
                    placeholder="500000"
                    value={formData.salaryMin}
                    onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                    className="h-12 border-2 border-gray-200 rounded-xl focus:border-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Salary (Annual)
                  </label>
                  <Input
                    type="number"
                    placeholder="1200000"
                    value={formData.salaryMax}
                    onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                    className="h-12 border-2 border-gray-200 rounded-xl focus:border-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <div className="h-12 border-2 border-gray-200 rounded-xl bg-gray-50 flex items-center px-4">
                    <span className="text-gray-700 font-medium">INR (₹)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benefits & Perks
                </label>
                <Textarea
                  placeholder="Health insurance, flexible hours, remote work, professional development, stock options..."
                  value={formData.benefits}
                  onChange={(e) => handleInputChange("benefits", e.target.value)}
                  className="min-h-20 border-2 border-gray-200 rounded-xl focus:border-gray-900"
                />
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Application Details
              </CardTitle>
              <CardDescription>
                Update application information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Email
                  </label>
                  <Input
                    type="email"
                    placeholder="hr@company.com"
                    value={formData.applicationEmail}
                    onChange={(e) => handleInputChange("applicationEmail", e.target.value)}
                    className="h-12 border-2 border-gray-200 rounded-xl focus:border-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Application Deadline
                  </label>
                  <Input
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => handleInputChange("applicationDeadline", e.target.value)}
                    className="h-12 border-2 border-gray-200 rounded-xl focus:border-gray-900"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div></div>
            
            <div className="flex gap-4">
              <Link href="/job-poster-dashboard">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 px-8"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 px-8 bg-gray-900 hover:bg-gray-800 text-white"
              >
                {isLoading ? "Updating Job..." : "Update Job"}
              </Button>
            </div>
          </div>
                </form>
              </main>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}