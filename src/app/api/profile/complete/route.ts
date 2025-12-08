import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json()
    
    // Here you would typically save to your database
    // For now, we'll just validate the required fields
    
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'city', 
      'state', 'preferredLocation', 'age', 'gender', 'summary'
    ]
    
    const missingFields = requiredFields.filter(field => !profileData[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Missing required fields', missingFields },
        { status: 400 }
      )
    }
    
    if (!profileData.jobType || profileData.jobType.length === 0) {
      return NextResponse.json(
        { error: 'At least one job type must be selected' },
        { status: 400 }
      )
    }
    
    // Validate resume file if provided
    if (profileData.resumeFile && profileData.resumeFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Resume file size must be less than 10MB' },
        { status: 400 }
      )
    }
    
    // In a real application, you would:
    // 1. Save profile data to database
    // 2. Upload resume file to storage service (like Supabase Storage)
    // 3. Update user record with profile completion status
    
    return NextResponse.json({
      message: 'Profile completed successfully',
      profileId: 'profile-' + Date.now(),
      completedAt: new Date().toISOString()
    }, { status: 200 })
    
  } catch (error) {
    console.error('Profile completion error:', error)
    return NextResponse.json(
      { error: 'Failed to complete profile' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // In a real application, you would fetch the profile data from database
    // For now, return a mock response
    
    return NextResponse.json({
      profile: {
        id: userId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+91 9876543210',
        city: 'Mumbai',
        state: 'Maharashtra',
        preferredLocation: 'Mumbai, Remote',
        age: '25',
        gender: 'Male',
        jobType: ['Full Time', 'Remote'],
        summary: 'Passionate software developer with experience in modern web technologies.',
        education: [],
        skills: [],
        languages: [],
        internships: [],
        projects: [],
        completedAt: new Date().toISOString()
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}