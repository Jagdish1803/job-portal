import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { role, email, password } = await request.json()

    // Validate required fields
    if (!role || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For development: Create mock user if database is not available
    let user: any = null
    
    try {
      // Find user by email and role
      user = await prisma.user.findFirst({
        where: {
          email,
          role: role as "JOB_SEEKER" | "JOB_POSTER"
        },
        include: {
          jobSeekerProfile: role === 'JOB_SEEKER',
          jobPosterProfile: role === 'JOB_POSTER' ? {
            include: {
              company: true
            }
          } : false,
          companies: role === 'JOB_POSTER',
        }
      })
    } catch (dbError) {
      console.log('Database not available, using mock authentication')
      // Mock user for development
      user = {
        id: 'mock-user-id',
        email,
        role,
        firstName: 'Test',
        lastName: 'User',
        password: await bcrypt.hash('jagdish0412', 12), // Mock hashed password
        jobSeekerProfile: role === 'JOB_SEEKER' ? {} : null,
        jobPosterProfile: role === 'JOB_POSTER' ? {} : null
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials or user not found' },
        { status: 401 }
      )
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last login (skip if using mock data)
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      })
    } catch (dbError) {
      console.log('Database update skipped (mock authentication)')
    }

    // Return success response (exclude password)
    const { password: _, ...userWithoutPassword } = user

    // Generate a simple token for session management
    const token = `token-${userWithoutPassword.id}-${Date.now()}`

    return NextResponse.json({
      message: 'Sign in successful',
      user: userWithoutPassword,
      token: token,
    }, { status: 200 })

  } catch (error) {
    console.error('Sign in error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}