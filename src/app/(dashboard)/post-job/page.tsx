"use client"

import React, { useState, useEffect } from "react"
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

export default function PostJobPage(): React.JSX.Element {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
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
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      
      // If user is a job seeker, redirect them to job seeker dashboard
      if (parsedUser.role === 'JOB_SEEKER') {
        toast.error('Job seekers cannot post jobs. Please switch to a job poster account.')
        window.location.href = '/job-seeker-dashboard'
        return
      }
      
      // Allow job posters and employers
      if (parsedUser.role !== 'JOB_POSTER' && parsedUser.role !== 'EMPLOYER') {
        toast.error('Only job posters and employers can post jobs.')
        window.location.href = '/sign-in'
        return
      }
      
      setUser(parsedUser)
      setUserProfile(parsedUser)
      setFormData(prev => ({ ...prev, applicationEmail: parsedUser.email }))
    } else {
      window.location.href = '/sign-in'
      return
    }
  }, [])

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
    if (!formData.title || !formData.description || !formData.jobType || !formData.workMode || !formData.applicationDeadline) {
      toast.error("Please fill in all required fields including application deadline")
      setIsLoading(false)
      return
    }

    // Check if user has a company (only for job posters, employers might not need this)
    if (userProfile?.role === 'JOB_POSTER' && !userProfile?.jobPosterProfile?.companyId) {
      toast.error("You need to be associated with a company to post jobs")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          posterId: user.id,
          companyId: userProfile?.jobPosterProfile?.companyId || null,
          skills: formData.skills.split(',').map((skill: string) => ({
            skillId: skill.trim(), // TODO: Map skills to actual skill IDs
            isRequired: true
          })).filter((skill: any) => skill.skillId)
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Job posted successfully!')
        setTimeout(() => {
          window.location.href = '/job-poster-dashboard'
        }, 2000)
      } else {
        toast.error(result.error || 'Failed to post job. Please try again.')
      }
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const saveDraft = () => {
    localStorage.setItem('jobDraft', JSON.stringify(formData))
    toast.success('Draft saved successfully!')
  }

  return (
    <div className="flex flex-1 flex-col gap-4 pt-2 pb-4 md:gap-6 md:pt-3 md:pb-6">
      <div className="px-4 lg:px-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Post a New Job</h1>
              <p className="text-muted-foreground">
                Find the perfect candidate for your team
              </p>
              {userProfile?.jobPosterProfile?.company && (
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <Building2 className="w-4 h-4 mr-1" />
                  Posting for: {userProfile.jobPosterProfile.company.name}
                </div>
              )}
              {userProfile && userProfile.role === 'JOB_POSTER' && !userProfile?.jobPosterProfile?.companyId && (
                <div className="flex items-center mt-2 text-sm text-red-600">
                  ⚠️ Company not found - Please contact support
                </div>
              )}
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
                  Provide basic information about the position
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
                  Describe the role and what you're looking for
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
                  Attract the best talent with competitive compensation
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
                  How candidates should apply for this position
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
                      Application Deadline *
                    </label>
                    <Input
                      type="date"
                      value={formData.applicationDeadline}
                      onChange={(e) => handleInputChange("applicationDeadline", e.target.value)}
                      className="h-12 border-2 border-gray-200 rounded-xl focus:border-gray-900"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={saveDraft}
                className="h-12 px-8"
              >
                Save as Draft
              </Button>
              
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
                  {isLoading ? "Posting Job..." : "Post Job"}
                </Button>
              </div>
            </div>
          </form>
      </div>
    </div>
  )
}