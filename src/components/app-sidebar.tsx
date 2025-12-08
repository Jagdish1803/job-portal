"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  IconBriefcase,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconHeart,
  IconUser,
  IconBell,
  IconFileText,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const getNavigationData = (userRole: string) => {
  // Navigation for job seekers
  if (userRole === 'JOB_SEEKER') {
    return {
      navMain: [
        {
          title: "Dashboard",
          url: "/job-seeker-dashboard",
          icon: IconDashboard,
        },
        {
          title: "Browse Jobs",
          url: "/browse-jobs",
          icon: IconSearch,
        },
        {
          title: "My Applications",
          url: "/my-applications",
          icon: IconFileText,
        },
        {
          title: "Saved Jobs",
          url: "/saved-jobs",
          icon: IconHeart,
        },
      ],
      navSecondary: [],
    }
  }

  // Navigation for job posters and employers (default)
  return {
    navMain: [
      {
        title: "Dashboard",
        url: "/job-poster-dashboard",
        icon: IconDashboard,
      },
      {
        title: "Post Job",
        url: "/post-job",
        icon: IconBriefcase,
      },
      {
        title: "Applications",
        url: "/applications",
        icon: IconFileText,
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: IconChartBar,
      },
    ],
    navSecondary: [],
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userData, setUserData] = useState({
    name: "User",
    email: "user@example.com",
    avatar: "",
  })
  const [userRole, setUserRole] = useState("JOB_SEEKER")

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        const name = `${parsedUser.firstName || ''} ${parsedUser.lastName || ''}`.trim() || parsedUser.email
        
        setUserData({
          name,
          email: parsedUser.email,
          avatar: parsedUser.profilePicture || "",
        })
        setUserRole(parsedUser.role || "JOB_SEEKER")
        console.log('User role detected:', parsedUser.role)

        // If user is a job poster, try to fetch company logo for avatar
        if (parsedUser.role === 'JOB_POSTER' || parsedUser.role === 'EMPLOYER') {
          fetchCompanyLogo(parsedUser.id)
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  const fetchCompanyLogo = async (userId: string) => {
    try {
      const response = await fetch(`/api/companies/profile?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.company?.logo) {
          setUserData(prev => ({
            ...prev,
            avatar: data.company.logo
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching company logo:', error)
    }
  }

  // Listen for company logo updates
  useEffect(() => {
    const handleLogoUpdate = () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser.role === 'JOB_POSTER' || parsedUser.role === 'EMPLOYER') {
          fetchCompanyLogo(parsedUser.id)
        }
      }
    }

    window.addEventListener('company-logo-updated', handleLogoUpdate)
    return () => window.removeEventListener('company-logo-updated', handleLogoUpdate)
  }, [])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Talent HR Corner</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={getNavigationData(userRole).navMain} />
        <NavSecondary items={getNavigationData(userRole).navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
