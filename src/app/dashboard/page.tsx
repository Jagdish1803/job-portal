"use client"

import { useEffect } from 'react'

export default function Page() {
  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem('user')
    
    if (!user) {
      window.location.href = '/sign-in'
      return
    }

    try {
      const userData = JSON.parse(user)
      
      // Redirect based on user role
      if (userData.role === 'JOB_SEEKER') {
        window.location.href = '/job-seeker-dashboard'
      } else if (userData.role === 'JOB_POSTER' || userData.role === 'EMPLOYER') {
        window.location.href = '/job-poster-dashboard'
      } else {
        window.location.href = '/sign-in'
      }
    } catch (error) {
      console.error('Invalid user data:', error)
      window.location.href = '/sign-in'
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
