"use client"

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function SiteHeader() {
  const pathname = usePathname()
  
  // Map paths to breadcrumb labels
  const getBreadcrumbItems = () => {
    const segments = pathname.split('/').filter(Boolean)
    
    if (segments.length === 0 || segments[0] === 'dashboard') {
      return [{ label: 'Dashboard', href: '/dashboard', isLast: true }]
    }
    
    if (segments[0] === 'job-poster-dashboard') {
      return [{ label: 'Dashboard', href: '/job-poster-dashboard', isLast: true }]
    }
    
    if (segments[0] === 'job-seeker-dashboard') {
      return [{ label: 'Dashboard', href: '/job-seeker-dashboard', isLast: true }]
    }
    
    // Handle other dashboard routes
    const breadcrumbs = [
      { label: 'Dashboard', href: '/dashboard', isLast: false }
    ]
    
    if (segments.includes('post-job')) {
      breadcrumbs.push({ label: 'Post Job', href: '/post-job', isLast: true })
    } else if (segments.includes('applications')) {
      breadcrumbs.push({ label: 'Applications', href: '/applications', isLast: true })
    } else if (segments.includes('analytics')) {
      breadcrumbs.push({ label: 'Analytics', href: '/analytics', isLast: true })
    } else if (segments.includes('company-profile')) {
      breadcrumbs.push({ label: 'Company Profile', href: '/company-profile', isLast: true })
    }
    
    return breadcrumbs
  }

  const breadcrumbItems = getBreadcrumbItems()

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 p-4 lg:px-4.5">
        <SidebarTrigger />
        <div className="mx-2 h-4 w-px bg-border"></div>
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <div key={item.href} className="flex items-center">
                <BreadcrumbItem>
                  {item.isLast ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!item.isLast && <BreadcrumbSeparator />}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
