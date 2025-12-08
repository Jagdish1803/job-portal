"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock,
  Building2,
  Eye,
  FileText,
  Calendar,
  Filter
} from "lucide-react"
import { toast } from "sonner"

interface Application {
  id: string
  job: {
    id: string
    title: string
    company: string
    location: string
    jobType: string
    workMode: string
  }
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFERED' | 'REJECTED' | 'WITHDRAWN'
  appliedDate: string
  lastUpdated: string
  notes?: string
}

const statusConfig = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  REVIEWED: { label: 'Under Review', color: 'bg-blue-100 text-blue-800' },
  SHORTLISTED: { label: 'Shortlisted', color: 'bg-purple-100 text-purple-800' },
  INTERVIEW: { label: 'Interview Scheduled', color: 'bg-green-100 text-green-800' },
  OFFERED: { label: 'Offer Received', color: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  WITHDRAWN: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' }
}

export default function MyApplicationsPage(): React.JSX.Element {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("appliedDate")

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const user = localStorage.getItem('user')
      if (!user) {
        toast.error('Please login to view applications')
        return
      }

      const userData = JSON.parse(user)
      const response = await fetch(`/api/applications?applicantId=${userData.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      } else {
        console.error('Failed to fetch applications')
        toast.error('Failed to load applications')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const withdrawApplication = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'WITHDRAWN' }),
      })

      if (response.ok) {
        setApplications(applications.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'WITHDRAWN', lastUpdated: new Date().toISOString() }
            : app
        ))
        toast.success('Application withdrawn successfully')
      } else {
        toast.error('Failed to withdraw application')
      }
    } catch (error) {
      console.error('Error withdrawing application:', error)
      toast.error('Failed to withdraw application')
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.job.company.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case 'appliedDate':
        return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
      case 'lastUpdated':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      case 'company':
        return a.job.company.localeCompare(b.job.company)
      case 'position':
        return a.job.title.localeCompare(b.job.title)
      default:
        return 0
    }
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTimeAgo = (dateString: string) => {
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

  const getApplicationStats = () => {
    const total = applications.length
    const pending = applications.filter(app => app.status === 'PENDING' || app.status === 'REVIEWED').length
    const interviews = applications.filter(app => app.status === 'INTERVIEW' || app.status === 'SHORTLISTED').length
    const offers = applications.filter(app => app.status === 'OFFERED').length
    
    return { total, pending, interviews, offers }
  }

  const stats = getApplicationStats()

  return (
    <div className="flex flex-1 flex-col gap-4 pt-2 pb-4 md:gap-6 md:pt-3 md:pb-6">
      <div className="px-4 lg:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Applications</h1>
          <p className="text-muted-foreground">
            Track and manage your job applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Under Review</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Interviews</p>
                  <p className="text-2xl font-bold">{stats.interviews}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Offers</p>
                  <p className="text-2xl font-bold">{stats.offers}</p>
                </div>
                <Briefcase className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by job title or company"
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appliedDate">Sort by Applied Date</SelectItem>
                  <SelectItem value="lastUpdated">Sort by Last Updated</SelectItem>
                  <SelectItem value="company">Sort by Company</SelectItem>
                  <SelectItem value="position">Sort by Position</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : sortedApplications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No applications found</h3>
                <p className="text-muted-foreground mb-4">
                  {applications.length === 0 
                    ? "You haven't applied to any jobs yet" 
                    : "No applications match your current filters"
                  }
                </p>
                <Button asChild>
                  <a href="/browse-jobs">Browse Jobs</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            sortedApplications.map((application) => {
              const statusInfo = statusConfig[application.status]
              return (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">
                              {application.job.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                {application.job.company}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {application.job.location}
                              </div>
                            </div>
                          </div>
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </div>

                        <div className="flex gap-2 mb-3">
                          <Badge variant="secondary">{application.job.jobType}</Badge>
                          <Badge variant="outline">{application.job.workMode}</Badge>
                        </div>

                        {application.notes && (
                          <p className="text-sm text-muted-foreground mb-3">
                            <strong>Notes:</strong> {application.notes}
                          </p>
                        )}

                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Applied on {formatDate(application.appliedDate)}</span>
                          <span>Updated {getTimeAgo(application.lastUpdated)}</span>
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`/jobs/${application.job.id}`, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Job
                        </Button>
                        {(application.status === 'PENDING' || application.status === 'REVIEWED') && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => withdrawApplication(application.id)}
                          >
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}