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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown,
  Eye,
  Users,
  Briefcase,
  Calendar,
  Target,
  Clock,
  Award,
  MapPin
} from "lucide-react"

interface AnalyticsData {
  jobViews: Array<{ date: string; views: number; applications: number }>
  applicationTrends: Array<{ month: string; applications: number; hired: number }>
  jobTypeDistribution: Array<{ type: string; count: number; percentage: number }>
  locationStats: Array<{ location: string; jobs: number; applications: number }>
  performanceMetrics: {
    totalViews: number
    totalApplications: number
    averageTimeToHire: number
    applicationRate: number
    responseRate: number
    hireRate: number
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AnalyticsPage(): React.JSX.Element {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    loadUserAndAnalytics()
  }, [timeRange])

  const loadUserAndAnalytics = async () => {
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

      // Load analytics from API or show empty/demo state
      // For now, load demo data for visualization
      loadDummyAnalytics()
      
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadDummyAnalytics = () => {
    // Generate dummy analytics data
    const dummyData: AnalyticsData = {
      jobViews: [
        { date: '2025-11-01', views: 45, applications: 3 },
        { date: '2025-11-02', views: 52, applications: 5 },
        { date: '2025-11-03', views: 38, applications: 2 },
        { date: '2025-11-04', views: 67, applications: 8 },
        { date: '2025-11-05', views: 73, applications: 6 },
        { date: '2025-11-06', views: 81, applications: 9 },
        { date: '2025-11-07', views: 69, applications: 7 },
        { date: '2025-11-08', views: 95, applications: 12 },
        { date: '2025-11-09', views: 88, applications: 10 },
        { date: '2025-11-10', views: 76, applications: 8 },
        { date: '2025-11-11', views: 92, applications: 11 },
        { date: '2025-11-12', views: 84, applications: 9 },
        { date: '2025-11-13', views: 78, applications: 7 },
        { date: '2025-11-14', views: 103, applications: 15 },
        { date: '2025-11-15', views: 96, applications: 13 },
        { date: '2025-11-16', views: 89, applications: 11 },
        { date: '2025-11-17', views: 107, applications: 16 },
        { date: '2025-11-18', views: 115, applications: 18 },
        { date: '2025-11-19', views: 98, applications: 14 },
        { date: '2025-11-20', views: 112, applications: 17 },
        { date: '2025-11-21', views: 121, applications: 19 },
        { date: '2025-11-22', views: 108, applications: 15 },
        { date: '2025-11-23', views: 94, applications: 12 },
        { date: '2025-11-24', views: 87, applications: 10 },
        { date: '2025-11-25', views: 101, applications: 14 },
        { date: '2025-11-26', views: 118, applications: 17 },
        { date: '2025-11-27', views: 125, applications: 20 },
        { date: '2025-11-28', views: 132, applications: 22 },
        { date: '2025-11-29', views: 128, applications: 21 },
        { date: '2025-11-30', views: 135, applications: 23 }
      ],
      applicationTrends: [
        { month: 'Jul', applications: 45, hired: 8 },
        { month: 'Aug', applications: 67, hired: 12 },
        { month: 'Sep', applications: 89, hired: 15 },
        { month: 'Oct', applications: 123, hired: 22 },
        { month: 'Nov', applications: 156, hired: 28 },
        { month: 'Dec', applications: 89, hired: 16 }
      ],
      jobTypeDistribution: [
        { type: 'Full Time', count: 8, percentage: 57.1 },
        { type: 'Part Time', count: 3, percentage: 21.4 },
        { type: 'Contract', count: 2, percentage: 14.3 },
        { type: 'Freelance', count: 1, percentage: 7.1 }
      ],
      locationStats: [
        { location: 'Mumbai, Maharashtra', jobs: 5, applications: 87 },
        { location: 'Bangalore, Karnataka', jobs: 3, applications: 65 },
        { location: 'Pune, Maharashtra', jobs: 2, applications: 42 },
        { location: 'Delhi, New Delhi', jobs: 2, applications: 38 },
        { location: 'Remote', jobs: 4, applications: 123 }
      ],
      performanceMetrics: {
        totalViews: 2847,
        totalApplications: 342,
        averageTimeToHire: 18,
        applicationRate: 12.0,
        responseRate: 85.2,
        hireRate: 16.7
      }
    }

    setAnalyticsData(dummyData)
  }

  if (isLoading || !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const { performanceMetrics } = analyticsData

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-4 pt-2 pb-4 md:gap-6 md:pt-3 md:pb-6">
              <main className="px-4 lg:px-6">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">Analytics</h1>
                      <p className="text-muted-foreground">
                        Track performance and insights for your job postings
                      </p>
                    </div>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="1y">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                          <p className="text-2xl font-bold">{performanceMetrics.totalViews.toLocaleString()}</p>
                          <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +12.5% from last month
                          </p>
                        </div>
                        <Eye className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Applications</p>
                          <p className="text-2xl font-bold">{performanceMetrics.totalApplications}</p>
                          <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +8.3% from last month
                          </p>
                        </div>
                        <Users className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Application Rate</p>
                          <p className="text-2xl font-bold">{performanceMetrics.applicationRate}%</p>
                          <p className="text-xs text-red-600 flex items-center mt-1">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            -2.1% from last month
                          </p>
                        </div>
                        <Target className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Hire Rate</p>
                          <p className="text-2xl font-bold">{performanceMetrics.hireRate}%</p>
                          <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +3.2% from last month
                          </p>
                        </div>
                        <Award className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Views and Applications Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Views & Applications Trend</CardTitle>
                      <CardDescription>Daily job views and applications over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analyticsData.jobViews}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                            formatter={(value, name) => [value, name === 'views' ? 'Views' : 'Applications']}
                          />
                          <Area type="monotone" dataKey="views" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                          <Area type="monotone" dataKey="applications" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.8} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Application Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Application & Hiring Trends</CardTitle>
                      <CardDescription>Monthly applications received vs successful hires</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData.applicationTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="applications" fill="#8884d8" name="Applications" />
                          <Bar dataKey="hired" fill="#82ca9d" name="Hired" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Job Type Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Type Distribution</CardTitle>
                      <CardDescription>Breakdown of jobs by employment type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analyticsData.jobTypeDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ type, percentage }) => `${type}: ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {analyticsData.jobTypeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Location Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Location Performance</CardTitle>
                      <CardDescription>Applications by job location</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData.locationStats} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="location" type="category" width={120} />
                          <Tooltip />
                          <Bar dataKey="applications" fill="#8884d8" name="Applications" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Response Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        Response Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Response Rate</span>
                        <span className="font-medium">{performanceMetrics.responseRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Avg. Time to Hire</span>
                        <span className="font-medium">{performanceMetrics.averageTimeToHire} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Hire Rate</span>
                        <span className="font-medium">{performanceMetrics.hireRate}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Locations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        Top Locations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticsData.locationStats.slice(0, 5).map((location, index) => (
                          <div key={location.location} className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2`} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                              <span className="text-sm font-medium">{location.location}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{location.applications} apps</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Briefcase className="w-5 h-5 mr-2" />
                        Quick Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Active Jobs</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Pending Applications</span>
                        <span className="font-medium">47</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Interviews Scheduled</span>
                        <span className="font-medium">8</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Offers Extended</span>
                        <span className="font-medium">3</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </main>
            </div>
    </div>
  )
}