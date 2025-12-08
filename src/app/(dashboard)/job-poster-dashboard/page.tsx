"use client"

import React, { useState, useEffect } from "react"
import { DataTable } from "@/components/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  PlusCircle, 
  Briefcase, 
  Users, 
  Eye, 
  Building2,
  CheckCircle,
  Star,
  Clock,
  TrendingUp,
  MoreVertical,
  Edit,
  Pause,
  Play,
  Trash2,
  Calendar
} from "lucide-react"
import Link from "next/link"

interface JobPost {
  id: string
  title: string
  location: string
  jobType: string
  status: string
  applicationsCount: number
  viewsCount: number
  createdAt: string
  applicationDeadline?: string
  salary?: string
}

interface DashboardStats {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  totalViews: number
  featuredJobs: number
}

interface RecentApplication {
  id: string
  jobTitle: string
  applicantName: string
  appliedAt: string
  status: string
}

interface CompanyInfo {
  name: string
  logo?: string
  totalEmployees?: number
}

export default function JobPosterDashboard(): React.JSX.Element {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [jobPosts, setJobPosts] = useState<JobPost[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalViews: 0,
    featuredJobs: 0
  })
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([])
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<{id: string, title: string} | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Get user from localStorage
      const userData = localStorage.getItem('user')
      if (!userData) {
        window.location.href = '/auth/signin'
        return
      }

      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== 'JOB_POSTER') {
        window.location.href = '/job-seeker-dashboard'
        return
      }

      setUser(parsedUser)

      // Fetch dashboard data
      const response = await fetch(`/api/jobs/my-jobs?posterId=${parsedUser.id}`)
      if (response.ok) {
        const data = await response.json()
        
        // Transform API data to match component interface
        const transformedJobs: JobPost[] = data.jobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          location: job.location || 'Remote',
          jobType: job.jobType,
          status: job.isActive ? 'active' : 'paused',
          applicationsCount: job._count.applications,
          viewsCount: job.viewCount || 0,
          createdAt: job.createdAt,
          applicationDeadline: job.applicationDeadline,
          salary: job.salaryMin && job.salaryMax 
            ? `₹${Math.round(job.salaryMin/100000)}-${Math.round(job.salaryMax/100000)} LPA`
            : undefined
        }))

        setJobPosts(transformedJobs)
        setStats(data.stats || {
          totalJobs: 0,
          activeJobs: 0,
          totalApplications: 0,
          featuredJobs: 0
        })
        
        // Set company info from first job if available
        if (data.jobs.length > 0 && data.jobs[0].company) {
          setCompanyInfo({
            name: data.jobs[0].company.name,
            logo: data.jobs[0].company.logo
          })
        }
        
        // Mock recent applications for now (you can create a separate API endpoint)
        setRecentApplications([
          {
            id: '1',
            jobTitle: transformedJobs[0]?.title || 'Software Developer',
            applicantName: 'Rahul Sharma',
            appliedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: 'pending'
          },
          {
            id: '2', 
            jobTitle: transformedJobs[0]?.title || 'Product Manager',
            applicantName: 'Priya Patel',
            appliedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            status: 'reviewed'
          }
        ])
      } else if (response.status === 403) {
        // User might not have job poster profile yet - show empty state
        console.log('Dashboard: User not set up as job poster yet')
        setJobPosts([])
        setStats({
          totalJobs: 0,
          activeJobs: 0,
          totalApplications: 0,
          totalViews: 0,
          featuredJobs: 0
        })
        setRecentApplications([])
      } else {
        // Other errors - show empty state
        console.log('Dashboard: Error loading data, showing empty state')
        setJobPosts([])
        setStats({
          totalJobs: 0,
          activeJobs: 0,
          totalApplications: 0,
          totalViews: 0,
          featuredJobs: 0
        })
        setRecentApplications([])
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setIsLoading(false)
    }
  }

  const handleEditJob = (jobId: string) => {
    // Navigate to edit job page (you can create this route)
    window.location.href = `/edit-job/${jobId}`
  }

  const openDeleteDialog = (jobId: string, jobTitle: string) => {
    setJobToDelete({ id: jobId, title: jobTitle })
    setDeleteDialogOpen(true)
  }

  const handleDeleteJob = async () => {
    if (!jobToDelete) return

    try {
      const response = await fetch(`/api/jobs/${jobToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          posterId: user.id
        }),
      })

      if (response.ok) {
        // Remove job from local state
        setJobPosts(prev => prev.filter(job => job.id !== jobToDelete.id))
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalJobs: prev.totalJobs - 1,
          activeJobs: prev.activeJobs - (jobPosts.find(job => job.id === jobToDelete.id)?.status === 'active' ? 1 : 0)
        }))
      } else {
        const error = await response.json()
        console.error('Failed to delete job:', error.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Error deleting job:', error)
    } finally {
      setDeleteDialogOpen(false)
      setJobToDelete(null)
    }
  }

  // Transform job posts data for the DataTable component
  const tableData = jobPosts.map(job => ({
    id: job.id,
    title: job.title,
    location: job.location,
    type: job.jobType.replace('_', ' '),
    status: job.status,
    applications: job.applicationsCount,
    views: job.viewsCount,
    created: new Date(job.createdAt).toLocaleDateString(),
    salary: job.salary || 'Not specified'
  }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 pt-2 pb-4 md:gap-6 md:pt-3 md:pb-6">
        <div className="px-4 lg:px-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-muted-foreground">
                  Overview of your job postings and applications
                </p>
              </div>
              <Link href="/post-job">
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Post New Job
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Custom Stats Cards for Job Poster */}
              <div className="px-4 lg:px-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalJobs}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.activeJobs} active
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Applications</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalApplications}</div>
                      <p className="text-xs text-muted-foreground">
                        Across all jobs
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalViews || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Job post views
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activeJobs}</div>
                      <p className="text-xs text-muted-foreground">
                        Currently hiring
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="px-4 lg:px-6">
                <div className="space-y-6">
                    {/* Job Posts List */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Your Job Posts</CardTitle>
                          <CardDescription>Manage and track your job listings</CardDescription>
                        </div>
                        <Link href="/post-job">
                          <Button size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Job
                          </Button>
                        </Link>
                      </CardHeader>
                      <CardContent>
                        {jobPosts.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[200px]">Job Title</TableHead>
                                <TableHead className="w-[180px]">Location</TableHead>
                                <TableHead className="w-[120px]">Type</TableHead>
                                <TableHead className="w-[100px]">Status</TableHead>
                                <TableHead className="w-[120px] text-center">Applications</TableHead>
                                <TableHead className="w-[100px] text-center">Views</TableHead>
                                <TableHead className="w-[120px]">Salary</TableHead>
                                <TableHead className="w-[120px]">Posted Date</TableHead>
                                <TableHead className="w-[120px]">Deadline</TableHead>
                                <TableHead className="w-[60px] text-center"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {jobPosts.map((job) => (
                                <TableRow key={job.id}>
                                  <TableCell className="font-medium">{job.title}</TableCell>
                                  <TableCell>{job.location}</TableCell>
                                  <TableCell>{job.jobType.replace('_', ' ')}</TableCell>
                                  <TableCell>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      job.status === 'active' 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {job.status === 'active' ? 'Active' : 'Paused'}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">{job.applicationsCount}</TableCell>
                                  <TableCell className="text-center">{job.viewsCount}</TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {job.salary || 'Not specified'}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                                      {new Date(job.createdAt).toLocaleDateString()}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                                      {job.applicationDeadline 
                                        ? new Date(job.applicationDeadline).toLocaleDateString()
                                        : 'No deadline'
                                      }
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEditJob(job.id)}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          Edit Job
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          className="text-red-600" 
                                          onClick={() => openDeleteDialog(job.id, job.title)}
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete Job
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-12">
                            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Job Posts Yet</h3>
                            <p className="text-gray-500 mb-4">Start building your team by posting your first job opening.</p>
                            <Link href="/post-job">
                              <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Post Your First Job
                              </Button>
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                </div>
              </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{jobToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteJob}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}