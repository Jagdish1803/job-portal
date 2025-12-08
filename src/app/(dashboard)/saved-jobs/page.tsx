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
  Trash2,
  Eye
} from "lucide-react"
import { toast } from "sonner"

interface SavedJob {
  id: string
  title: string
  company: string
  location: string
  jobType: string
  workMode: string
  experienceLevel: string
  salaryMin: number
  salaryMax: number
  currency: string
  description: string
  requirements: string
  skills: string[]
  postedDate: string
  applicationDeadline: string
  isActive: boolean
  savedDate: string
}

export default function SavedJobsPage(): React.JSX.Element {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [jobTypeFilter, setJobTypeFilter] = useState("all")
  const [workModeFilter, setWorkModeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("savedDate")

  useEffect(() => {
    fetchSavedJobs()
  }, [])

  const fetchSavedJobs = async () => {
    try {
      // Get saved job IDs from localStorage
      const savedJobIds = JSON.parse(localStorage.getItem('savedJobs') || '[]')
      
      if (savedJobIds.length === 0) {
        setLoading(false)
        return
      }

      // Fetch job details for saved jobs
      const jobPromises = savedJobIds.map(async (jobId: string) => {
        try {
          const response = await fetch(`/api/jobs/${jobId}`)
          if (response.ok) {
            const job = await response.json()
            return {
              ...job,
              savedDate: new Date().toISOString() // You might want to store actual saved dates
            }
          }
          return null
        } catch (error) {
          console.error(`Error fetching job ${jobId}:`, error)
          return null
        }
      })

      const jobs = await Promise.all(jobPromises)
      setSavedJobs(jobs.filter(job => job !== null && job.isActive))
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
      toast.error('Failed to load saved jobs')
    } finally {
      setLoading(false)
    }
  }

  const removeSavedJob = (jobId: string) => {
    // Remove from localStorage
    const currentSaved = JSON.parse(localStorage.getItem('savedJobs') || '[]')
    const updatedSaved = currentSaved.filter((id: string) => id !== jobId)
    localStorage.setItem('savedJobs', JSON.stringify(updatedSaved))
    
    // Remove from state
    setSavedJobs(savedJobs.filter(job => job.id !== jobId))
    toast.success('Job removed from saved jobs')
  }

  const applyToJob = async (jobId: string) => {
    try {
      const user = localStorage.getItem('user')
      if (!user) {
        toast.error('Please login to apply')
        return
      }

      const userData = JSON.parse(user)
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
        toast.success('Application submitted successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error applying to job:', error)
      toast.error('Failed to submit application')
    }
  }

  const filteredJobs = savedJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesJobType = jobTypeFilter === 'all' || job.jobType === jobTypeFilter
    const matchesWorkMode = workModeFilter === 'all' || job.workMode === workModeFilter
    
    return matchesSearch && matchesJobType && matchesWorkMode
  })

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'savedDate':
        return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime()
      case 'postedDate':
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      case 'company':
        return a.company.localeCompare(b.company)
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  const formatSalary = (min: number, max: number, currency: string) => {
    if (min && max) {
      return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}`
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

  const isApplicationDeadlineSoon = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays > 0
  }

  return (
    <div className="flex flex-1 flex-col gap-4 pt-2 pb-4 md:gap-6 md:pt-3 md:pb-6">
      <div className="px-4 lg:px-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Saved Jobs</h1>
              <p className="text-muted-foreground">
                Keep track of jobs you're interested in
              </p>
            </div>
            <Button asChild variant="outline">
              <a href="/browse-jobs">
                <Search className="w-4 h-4 mr-2" />
                Browse More Jobs
              </a>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search saved jobs by title or company"
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
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
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Work Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="REMOTE">Remote</SelectItem>
                  <SelectItem value="ON_SITE">On-site</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savedDate">Sort by Saved Date</SelectItem>
                  <SelectItem value="postedDate">Sort by Posted Date</SelectItem>
                  <SelectItem value="company">Sort by Company</SelectItem>
                  <SelectItem value="title">Sort by Job Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading saved jobs...' : `${sortedJobs.length} saved jobs`}
          </p>
        </div>

        {/* Saved Jobs List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : sortedJobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {savedJobs.length === 0 ? 'No saved jobs yet' : 'No jobs match your filters'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {savedJobs.length === 0 
                    ? 'Save interesting jobs while browsing to keep track of them here'
                    : 'Try adjusting your search criteria or filters'
                  }
                </p>
                <Button asChild>
                  <a href="/browse-jobs">
                    <Search className="w-4 h-4 mr-2" />
                    Browse Jobs
                  </a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            sortedJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/jobs/${job.id}`, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSavedJob(job.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {job.company}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Posted {formatDate(job.postedDate)}
                        </div>
                      </div>

                      <div className="flex gap-2 mb-3">
                        <Badge variant="secondary">{job.jobType}</Badge>
                        <Badge variant="outline">{job.workMode}</Badge>
                        <Badge variant="outline">{job.experienceLevel}</Badge>
                        {isApplicationDeadlineSoon(job.applicationDeadline) && (
                          <Badge variant="destructive" className="animate-pulse">
                            Deadline Soon
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {job.skills.slice(0, 5).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <DollarSign className="w-4 h-4" />
                          {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => applyToJob(job.id)}
                          >
                            Apply Now
                          </Button>
                        </div>
                      </div>

                      {job.applicationDeadline && (
                        <div className="mt-3 text-xs text-muted-foreground">
                          Application deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}