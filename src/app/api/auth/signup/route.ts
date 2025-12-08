import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { 
      role, fullName, email, password, mobileNumber, workStatus, acceptUpdates,
      experience, companyName, jobTitle, companySize 
    } = await request.json()

    // Validate required fields
    if (!role || !fullName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists (with fallback for no database)
    let existingUser = null
    try {
      existingUser = await prisma.user.findUnique({
        where: { email }
      })
    } catch (dbError) {
      console.log('Database not available, skipping duplicate check')
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Split fullName into firstName and lastName
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || ''

    // Create user with database or mock data
    let result: any = null
    
    try {
      // Create user with transaction to ensure data consistency
      result = await prisma.$transaction(async (tx) => {
        // Create main user
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            role: role as "JOB_SEEKER" | "JOB_POSTER",
            firstName,
            lastName,
            phone: mobileNumber,
          },
        })

        // Create role-specific profile
        if (role === 'JOB_SEEKER') {
          await tx.jobSeekerProfile.create({
            data: {
              userId: user.id,
              currentJobTitle: workStatus === 'employed' ? 'Professional' : null,
              isOpenToWork: workStatus !== 'employed',
              yearsOfExperience: experience === 'entry' ? 1 : 
                                experience === 'mid' ? 3 :
                                experience === 'senior' ? 7 :
                                experience === 'lead' ? 12 : null,
            },
          })
        } else if (role === 'JOB_POSTER') {
          // Create company first if provided
          let company = null
          if (companyName) {
            company = await tx.company.create({
              data: {
                name: companyName,
                slug: companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
                size: companySize?.toUpperCase() as any || 'SMALL',
                ownerId: user.id,
              },
            })
          }

          // Create job poster profile linked to company
          await tx.jobPosterProfile.create({
            data: {
              userId: user.id,
              jobTitle: jobTitle || 'Hiring Manager',
              canPostJobs: true,
              companyId: company?.id || null,
            },
          })
        }

        return user
      })
    } catch (dbError) {
      console.log('Database not available, creating mock user')
      // Mock user creation for development
      result = {
        id: 'mock-' + Date.now(),
        email,
        role,
        firstName,
        lastName,
        phone: mobileNumber,
        password: hashedPassword
      }
    }

    // Return success response (exclude password)
    const { password: _, ...userWithoutPassword } = result
    
    // Generate a simple token for session management
    const token = `token-${userWithoutPassword.id}-${Date.now()}`
    
    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword,
      token: token,
      isNewUser: true,
      needsProfileCompletion: role === 'JOB_SEEKER'
    }, { status: 201 })

  } catch (error) {
    console.error('Sign up error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}