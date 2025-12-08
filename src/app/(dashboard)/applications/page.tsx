"use client"

import React, { useState, useEffect } from 'react'
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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  Check,
  X,
  Calendar,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Download
} from "lucide-react"

interface Application {
  id: string
  status: 'APPLIED' | 'REVIEWED' | 'INTERVIEW' | 'OFFERED' | 'REJECTED' | 'WITHDRAWN'
  appliedAt: string
  coverLetter: string | null
  resume: string | null
  jobSeeker: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
    profile: {
      bio: string | null
      experience: string | null
      location: string | null
      avatar: string | null
    } | null
  }
  jobPost: {
    id: string
    title: string
    location: string | null
    company: {
      name: string
    }
  }
}

const statusColors = {
  APPLIED: "bg-blue-100 text-blue-800 border-blue-200",
  REVIEWED: "bg-yellow-100 text-yellow-800 border-yellow-200",
  INTERVIEW: "bg-purple-100 text-purple-800 border-purple-200",
  OFFERED: "bg-green-100 text-green-800 border-green-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  WITHDRAWN: "bg-gray-100 text-gray-800 border-gray-200"
}

export default function ApplicationsPage(): React.JSX.Element {
  const [user, setUser] = useState<any>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [jobFilter, setJobFilter] = useState("all")
  const [jobs, setJobs] = useState<any[]>([])

  useEffect(() => {
    loadUserAndApplications()
  }, [])

  const loadUserAndApplications = async () => {
    try {
      // Check authentication
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

      // Load applications from API or use empty state
      // For now, show empty state until real API is implemented
      setApplications([])
      setJobs([])
      
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadDummyApplications = () => {
    // Dummy data for applications
    const dummyApplications: Application[] = [
      {
        id: "1",
        status: "APPLIED",
        appliedAt: "2025-12-01T10:30:00Z",
        coverLetter: "I am very interested in this position and believe my skills align perfectly...",
        resume: "resume_john_doe.pdf",
        jobSeeker: {
          id: "js1",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "+91 9876543210",
          profile: {
            bio: "Full-stack developer with 3 years of experience in React and Node.js",
            experience: "3 years",
            location: "Mumbai, Maharashtra",
            avatar: null
          }
        },
        jobPost: {
          id: "job1",
          title: "Senior React Developer",
          location: "Mumbai, Maharashtra",
          company: {
            name: "Tech Solutions Inc"
          }
        }
      },
      {
        id: "2",
        status: "REVIEWED",
        appliedAt: "2025-11-30T14:20:00Z",
        coverLetter: "Dear Hiring Manager, I am writing to express my interest...",
        resume: "resume_jane_smith.pdf",
        jobSeeker: {
          id: "js2",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          phone: "+91 8765432109",
          profile: {
            bio: "UI/UX Designer passionate about creating user-friendly interfaces",
            experience: "2 years",
            location: "Bangalore, Karnataka",
            avatar: null
          }
        },
        jobPost: {
          id: "job1",
          title: "Senior React Developer",
          location: "Mumbai, Maharashtra",
          company: {
            name: "Tech Solutions Inc"
          }
        }
      },
      {
        id: "3",
        status: "INTERVIEW",
        appliedAt: "2025-11-29T09:15:00Z",
        coverLetter: "I have extensive experience in backend development...",
        resume: "resume_mike_johnson.pdf",
        jobSeeker: {
          id: "js3",
          firstName: "Mike",
          lastName: "Johnson",
          email: "mike.johnson@example.com",
          phone: "+91 7654321098",
          profile: {
            bio: "Backend engineer specializing in Node.js and Python",
            experience: "4 years",
            location: "Pune, Maharashtra",
            avatar: null
          }
        },
        jobPost: {
          id: "job2",
          title: "Backend Developer",
          location: "Pune, Maharashtra",
          company: {
            name: "Tech Solutions Inc"
          }
        }
      },
      {
        id: "4",
        status: "OFFERED",
        appliedAt: "2025-11-28T16:45:00Z",
        coverLetter: "I am excited about the opportunity to contribute to your team...",
        resume: "resume_sarah_wilson.pdf",
        jobSeeker: {
          id: "js4",
          firstName: "Sarah",
          lastName: "Wilson",
          email: "sarah.wilson@example.com",
          phone: "+91 6543210987",
          profile: {
            bio: "DevOps engineer with expertise in AWS and Docker",
            experience: "5 years",
            location: "Chennai, Tamil Nadu",
            avatar: null
          }
        },
        jobPost: {
          id: "job3",
          title: "DevOps Engineer",
          location: "Remote",
          company: {
            name: "Tech Solutions Inc"
          }
        }
      },
      {
        id: "5",
        status: "REJECTED",
        appliedAt: "2025-11-27T11:30:00Z",
        coverLetter: "Looking forward to discussing how I can contribute...",
        resume: "resume_alex_brown.pdf",
        jobSeeker: {
          id: "js5",
          firstName: "Alex",
          lastName: "Brown",
          email: "alex.brown@example.com",
          phone: "+91 5432109876",
          profile: {
            bio: "Junior developer eager to learn and grow",
            experience: "1 year",
            location: "Delhi, New Delhi",
            avatar: null
          }
        },
        jobPost: {
          id: "job1",
          title: "Senior React Developer",
          location: "Mumbai, Maharashtra",
          company: {
            name: "Tech Solutions Inc"
          }
        }
      }
    ]

    setApplications(dummyApplications)

    // Extract unique jobs for filter
    const uniqueJobs = Array.from(
      new Map(dummyApplications.map(app => [app.jobPost.id, app.jobPost])).values()
    )
    setJobs(uniqueJobs)
  }

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      // Update local state (in real app, this would be an API call)
      setApplications(prevApps => 
        prevApps.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus as Application['status'] }
            : app
        )
      )
      console.log(`Updated application ${applicationId} status to ${newStatus}`)
    } catch (error) {
      console.error('Error updating application status:', error)
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.jobSeeker.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobSeeker.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobSeeker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobPost.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    const matchesJob = jobFilter === 'all' || app.jobPost.id === jobFilter
    
    return matchesSearch && matchesStatus && matchesJob
  })

  const stats = {
    total: applications.length,
    applied: applications.filter(app => app.status === 'APPLIED').length,
    reviewed: applications.filter(app => app.status === 'REVIEWED').length,
    interview: applications.filter(app => app.status === 'INTERVIEW').length,
    offered: applications.filter(app => app.status === 'OFFERED').length,
    rejected: applications.filter(app => app.status === 'REJECTED').length
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 pt-2 pb-4 md:gap-6 md:pt-3 md:pb-6">
        <main className="px-4 lg:px-6">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">Applications</h1>
                      <p className="text-muted-foreground">
                        Review and manage job applications
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total</p>
                          <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <Users className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">New</p>
                          <p className="text-2xl font-bold text-blue-600">{stats.applied}</p>
                        </div>
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Interview</p>
                          <p className="text-2xl font-bold text-purple-600">{stats.interview}</p>
                        </div>
                        <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <div className="h-3 w-3 bg-purple-600 rounded-full"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Offered</p>
                          <p className="text-2xl font-bold text-green-600">{stats.offered}</p>
                        </div>
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                          <div className="h-3 w-3 bg-green-600 rounded-full"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                        </div>
                        <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                          <div className="h-3 w-3 bg-red-600 rounded-full"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            placeholder="Search by candidate name, email, or job title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="APPLIED">Applied</SelectItem>
                            <SelectItem value="REVIEWED">Reviewed</SelectItem>
                            <SelectItem value="INTERVIEW">Interview</SelectItem>
                            <SelectItem value="OFFERED">Offered</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={jobFilter} onValueChange={setJobFilter}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Job" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Jobs</SelectItem>
                            {jobs.map((job) => (
                              <SelectItem key={job.id} value={job.id}>
                                {job.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Applications Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Applications</CardTitle>
                    <CardDescription>
                      Review and manage candidate applications ({filteredApplications.length} of {applications.length} applications)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredApplications.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No applications found</h3>
                        <p className="text-muted-foreground">
                          {applications.length === 0 
                            ? "No applications received yet." 
                            : "No applications match your current filters."
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Candidate</TableHead>
                              <TableHead>Job Position</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Experience</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Applied</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredApplications.map((application) => (
                              <TableRow key={application.id}>
                                <TableCell>
                                  <div className="flex items-center space-x-3">
                                    <Avatar>
                                      <AvatarImage src={application.jobSeeker.profile?.avatar || ''} />
                                      <AvatarFallback>
                                        {application.jobSeeker.firstName[0]}{application.jobSeeker.lastName[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">
                                        {application.jobSeeker.firstName} {application.jobSeeker.lastName}
                                      </p>
                                      <div className="flex items-center text-sm text-muted-foreground">
                                        <Mail className="w-3 h-3 mr-1" />
                                        {application.jobSeeker.email}
                                      </div>
                                      {application.jobSeeker.phone && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                          <Phone className="w-3 h-3 mr-1" />
                                          {application.jobSeeker.phone}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{application.jobPost.title}</p>
                                    <p className="text-sm text-muted-foreground">{application.jobPost.company.name}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                                    {application.jobSeeker.profile?.location || 'Not specified'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Briefcase className="w-4 h-4 mr-1 text-muted-foreground" />
                                    {application.jobSeeker.profile?.experience || 'Not specified'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant="outline" 
                                    className={statusColors[application.status]}
                                  >
                                    {application.status.charAt(0) + application.status.slice(1).toLowerCase()}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                                    <span className="text-sm">
                                      {new Date(application.appliedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => console.log('View application:', application.id)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                      </DropdownMenuItem>
                                      {application.resume && (
                                        <DropdownMenuItem onClick={() => console.log('Download resume:', application.resume)}>
                                          <Download className="mr-2 h-4 w-4" />
                                          Download Resume
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, 'REVIEWED')}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Mark as Reviewed
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, 'INTERVIEW')}>
                                        <Users className="mr-2 h-4 w-4" />
                                        Schedule Interview
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, 'OFFERED')}>
                                        <Check className="mr-2 h-4 w-4" />
                                        Send Offer
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                                        className="text-red-600"
                                      >
                                        <X className="mr-2 h-4 w-4" />
                                        Reject Application
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
        </main>
    </div>
  )
}