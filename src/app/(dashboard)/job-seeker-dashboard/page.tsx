"use client"

import React, { useState, useEffect } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { 
  Search, 
  MapPin, 
  Briefcase, 
  Heart, 
  FileText, 
  User, 
  TrendingUp,
  Clock,
  Building2
} from "lucide-react"
import { toast } from "sonner"

export default function JobSeekerDashboard(): React.JSX.Element {
  const [profileData, setProfileData] = useState<any>(null)
  const [showProfileDialog, setShowProfileDialog] = useState(false)

  useEffect(() => {
    checkProfileCompletion()
  }, [])

  const checkProfileCompletion = () => {
    // Check if profile is completed
    const userProfile = localStorage.getItem("userProfile")
    
    if (userProfile) {
      setProfileData(JSON.parse(userProfile))
      setShowProfileDialog(false)
    } else {
      // Check if user dismissed the dialog recently (within 1 hour)
      const dismissedTime = localStorage.getItem("profileDialogDismissed")
      if (dismissedTime) {
        const timeSinceDismiss = Date.now() - parseInt(dismissedTime)
        const oneHourInMs = 60 * 60 * 1000 // 1 hour in milliseconds
        
        if (timeSinceDismiss < oneHourInMs) {
          // Still within 1 hour, don't show dialog
          setShowProfileDialog(false)
        } else {
          // More than 1 hour has passed, show dialog again
          localStorage.removeItem("profileDialogDismissed")
          setShowProfileDialog(true)
        }
      } else {
        // No dismiss record, show dialog
        setShowProfileDialog(true)
      }
    }
  }

  const handleCompleteProfile = () => {
    window.location.href = '/profile'
  }

  const handleSkip = () => {
    // Store the current timestamp when user clicks "No"
    localStorage.setItem("profileDialogDismissed", Date.now().toString())
    setShowProfileDialog(false)
  }
  return (
    <div className="flex flex-1 flex-col gap-4 pt-2 pb-4 md:gap-6 md:pt-3 md:pb-6">
      {/* Profile Completion Dialog */}
      <AlertDialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Your Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Complete your profile to increase your chances of getting hired by employers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleSkip}>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteProfile}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="px-4 lg:px-6">
          <div className="max-w-6xl space-y-6">
            {/* Welcome Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">
                Welcome Back{profileData ? `, ${profileData.firstName}!` : '!'}
              </h1>
              <p className="text-muted-foreground">
                {profileData 
                  ? `Ready to explore new opportunities? Let's find your next ${profileData.jobType?.join(', ') || 'job'}.`
                  : 'Find your dream job and track your applications'
                }
              </p>
            </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Applications Sent</p>
                  <p className="text-2xl font-bold">
                    {profileData ? '0' : '12'}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profile Views</p>
                  <p className="text-2xl font-bold">
                    {profileData ? '0' : '48'}
                  </p>
                </div>
                <User className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Saved Jobs</p>
                  <p className="text-2xl font-bold">
                    {JSON.parse(localStorage.getItem('savedJobs') || '[]').length || '8'}
                  </p>
                </div>
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profile Completeness</p>
                  <p className="text-2xl font-bold">
                    {profileData ? '100%' : '25%'}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Recent Applications
                </CardTitle>
                <CardDescription>
                  Track the status of your job applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Senior React Developer",
                      company: "Tech Solutions Inc.",
                      status: "Under Review",
                      date: "2 days ago",
                      statusColor: "text-blue-600 bg-blue-50"
                    },
                    {
                      title: "Frontend Engineer",
                      company: "StartupCorp",
                      status: "Interview Scheduled",
                      date: "1 week ago",
                      statusColor: "text-green-600 bg-green-50"
                    },
                    {
                      title: "Full Stack Developer",
                      company: "InnovateLab",
                      status: "Applied",
                      date: "2 weeks ago",
                      statusColor: "text-gray-600 bg-gray-50"
                    }
                  ].map((app, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{app.title}</p>
                          <p className="text-sm text-muted-foreground">{app.company}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${app.statusColor}`}>
                          {app.status}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">{app.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Applications
                </Button>
              </CardContent>
            </Card>

            {/* Recommended Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Recommended Jobs
                </CardTitle>
                <CardDescription>
                  Jobs matched to your skills and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "React Developer",
                      company: "Digital Agency",
                      location: "Mumbai, Maharashtra",
                      type: "Full Time",
                      posted: "1 day ago"
                    },
                    {
                      title: "JavaScript Engineer",
                      company: "E-commerce Platform",
                      location: "Bangalore, Karnataka",
                      type: "Remote",
                      posted: "3 days ago"
                    },
                    {
                      title: "Frontend Developer",
                      company: "FinTech Startup",
                      location: "Pune, Maharashtra",
                      type: "Hybrid",
                      posted: "5 days ago"
                    }
                  ].map((job, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{job.title}</h3>
                        <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {job.location}
                        </span>
                        <span className="flex items-center">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {job.type}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {job.posted}
                        </span>
                      </div>
                      <Button size="sm" className="mt-3 w-full">
                        Apply Now
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View More Jobs
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col">
                  <User className="w-6 h-6 mb-2" />
                  Update Profile
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <FileText className="w-6 h-6 mb-2" />
                  Upload Resume
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <Search className="w-6 h-6 mb-2" />
                  Browse Jobs
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <Heart className="w-6 h-6 mb-2" />
                  Saved Jobs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}