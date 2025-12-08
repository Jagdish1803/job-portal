"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Heart, 
  Clock,
  Building2,
  DollarSign,
  Filter,
  SlidersHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  X
} from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface JobPost {
  id: string
  title: string
  company: {
    id: string
    name: string
    logo: string | null
    headquarters: string | null
  }
  location: string | null
  jobType: string
  workMode: string
  experienceLevel: string
  salaryMin: number | null
  salaryMax: number | null
  currency: string | null
  description: string
  requirements: string
  skills: Array<{
    skill: {
      id: string
      name: string
      slug: string
    }
  }>
  createdAt: string
  applicationDeadline: string | null
  isActive: boolean
  _count: {
    applications: number
  }
}

// Helper function to format enum values
function formatEnumValue(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export default function BrowseJobsPage(): React.JSX.Element {
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [jobTypeFilter, setJobTypeFilter] = useState("all")
  const [workModeFilter, setWorkModeFilter] = useState("all")
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [notification, setNotification] = useState<{
    show: boolean
    type: 'success' | 'error' | 'warning'
    title: string
    description?: string
    action?: { label: string; onClick: () => void }
  }>({ show: false, type: 'success', title: '' })

  useEffect(() => {
    fetchJobs()
    loadSavedJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs?limit=100')
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      } else {
        console.error('Failed to fetch jobs')
        showNotification('error', 'Failed to load jobs', 'Please try refreshing the page')
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      showNotification('error', 'Failed to load jobs', 'Please check your internet connection and try again')
    } finally {
      setLoading(false)
    }
  }

  const loadSavedJobs = () => {
    const saved = localStorage.getItem('savedJobs')
    if (saved) {
      setSavedJobs(JSON.parse(saved))
    }
  }

  const showNotification = (type: 'success' | 'error' | 'warning', title: string, description?: string, action?: { label: string; onClick: () => void }) => {
    setNotification({ show: true, type, title, description, action })
  }

  const hideNotification = () => {
    setNotification({ show: false, type: 'success', title: '' })
  }

  const toggleSaveJob = (jobId: string) => {
    const newSavedJobs = savedJobs.includes(jobId)
      ? savedJobs.filter(id => id !== jobId)
      : [...savedJobs, jobId]
    
    setSavedJobs(newSavedJobs)
    localStorage.setItem('savedJobs', JSON.stringify(newSavedJobs))
    
    showNotification(
      'success',
      savedJobs.includes(jobId) 
        ? 'Job removed from saved jobs' 
        : 'Job saved successfully'
    )
  }

  const applyToJob = async (jobId: string) => {
    try {
      const user = localStorage.getItem('user')
      if (!user) {
        showNotification('warning', 'Please login to apply', 'You need to sign in to submit job applications')
        return
      }

      const userData = JSON.parse(user)
      
      // Check if profile is complete
      const profileResponse = await fetch(`/api/job-seeker-profile?userId=${userData.id}`)
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        
        // Check if profile exists and is complete
        const isProfileComplete = profileData.profile && 
          profileData.profile.preferredJobTypes && 
          profileData.profile.preferredJobTypes.length > 0 &&
          profileData.profile.gender &&
          profileData.user.firstName &&
          profileData.user.lastName &&
          profileData.user.phone
        
        if (!isProfileComplete) {
          showNotification(
            'warning', 
            'Please complete your profile before applying to jobs',
            'Go to Profile page to complete your information',
            {
              label: 'Go to Profile',
              onClick: () => window.location.href = '/profile'
            }
          )
          return
        }
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          applicantId: userData.id,
        }),
      })

      if (response.ok) {
        showNotification('success', 'Application submitted successfully!', 'Your application has been sent to the employer')
      } else {
        const error = await response.json()
        showNotification('error', 'Failed to submit application', error.error || 'Please try again later')
      }
    } catch (error) {
      console.error('Error applying to job:', error)
      showNotification('error', 'Failed to submit application', 'Please check your connection and try again')
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLocation = !locationFilter || (job.location && job.location.toLowerCase().includes(locationFilter.toLowerCase()))
    const matchesJobType = jobTypeFilter === 'all' || job.jobType === jobTypeFilter
    const matchesWorkMode = workModeFilter === 'all' || job.workMode === workModeFilter
    
    return matchesSearch && matchesLocation && matchesJobType && matchesWorkMode && job.isActive
  })

  const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
    if (min && max && currency) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
    }
    return 'Salary not disclosed'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  return (
    <div className="flex flex-1 flex-col gap-4 pt-2 pb-4 md:gap-6 md:pt-3 md:pb-6">
      <div className="px-4 lg:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Browse Jobs</h1>
          <p className="text-muted-foreground">
            Discover your next career opportunity
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Job title, keywords, or company"
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Location"
                      className="pl-10"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="INTERNSHIP">Internship</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={workModeFilter} onValueChange={setWorkModeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Work Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="REMOTE">Remote</SelectItem>
                    <SelectItem value="ON_SITE">On-site</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading jobs...' : `${filteredJobs.length} jobs found`}
          </p>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSaveJob(job.id)}
                          className={`ml-2 ${savedJobs.includes(job.id) ? 'text-red-500' : 'text-gray-400'}`}
                        >
                          <Heart className={`w-4 h-4 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {job.company.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location || 'Remote'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(job.createdAt)}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        <Badge variant="secondary" className="text-xs py-0">{formatEnumValue(job.jobType)}</Badge>
                        <Badge variant="outline" className="text-xs py-0">{formatEnumValue(job.workMode)}</Badge>
                        <Badge variant="outline" className="text-xs py-0">{formatEnumValue(job.experienceLevel)}</Badge>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {job.description}
                      </p>

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {job.skills.slice(0, 4).map((skillItem, index) => (
                            <Badge key={index} variant="outline" className="text-xs py-0 px-2">
                              {skillItem.skill.name}
                            </Badge>
                          ))}
                          {job.skills.length > 4 && (
                            <Badge variant="outline" className="text-xs py-0 px-2">
                              +{job.skills.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-sm font-semibold">
                          <DollarSign className="w-4 h-4" />
                          {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                        </div>
                        <Button onClick={() => applyToJob(job.id)} size="sm">
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Notification Dialog */}
      <AlertDialog open={notification.show} onOpenChange={hideNotification}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              {notification.type === 'success' && (
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              )}
              {notification.type === 'error' && (
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              )}
              {notification.type === 'warning' && (
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
              )}
              <div className="flex-1">
                <AlertDialogTitle className="text-base font-semibold">
                  {notification.title}
                </AlertDialogTitle>
              </div>
            </div>
          </AlertDialogHeader>
          {notification.description && (
            <AlertDialogDescription className="text-sm text-muted-foreground ml-13">
              {notification.description}
            </AlertDialogDescription>
          )}
          <AlertDialogFooter className="flex gap-2">
            {notification.action && (
              <AlertDialogAction
                onClick={notification.action.onClick}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {notification.action.label}
              </AlertDialogAction>
            )}
            <AlertDialogAction 
              onClick={hideNotification}
              variant={notification.action ? "outline" : "default"}
            >
              {notification.action ? 'Later' : 'OK'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}