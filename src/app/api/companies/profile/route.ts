import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/companies/profile - Get company profile for authenticated user
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

    // Verify the user is a job poster
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        role: 'JOB_POSTER'
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get the user's company
    const company = await prisma.company.findFirst({
      where: {
        ownerId: userId
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            jobPosts: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Parse location strings back to objects for frontend
    const processedCompany = {
      ...company,
      locations: company.locations.map(loc => {
        try {
          // Try to parse as JSON, if it fails, treat as string
          return typeof loc === 'string' && loc.startsWith('{') ? JSON.parse(loc) : { name: loc }
        } catch {
          return { name: loc }
        }
      }),
      // Return benefits from database
      benefits: company.benefits || []
    }

    return NextResponse.json({
      company: processedCompany
    })

  } catch (error) {
    console.error('Error fetching company profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company profile' },
      { status: 500 }
    )
  }
}

// PUT /api/companies/profile - Update company profile
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('PUT /api/companies/profile - Received data:', data)
    
    const {
      userId,
      name,
      description,
      industry,
      size,
      foundedYear,
      email,
      phone,
      website,
      headquarters,
      locations = [],
      logo,
      linkedinUrl,
      twitterUrl,
      facebookUrl,
      benefits = []
    } = data

    // Validate size enum if provided
    const validSizes = ['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']
    const companySize = size && validSizes.includes(size) ? size : null
    console.log('PUT - Company size validation:', { size, companySize })

    // Validate required fields
    if (!userId || !name) {
      return NextResponse.json(
        { error: 'User ID and company name are required' },
        { status: 400 }
      )
    }

    // Verify the user is a job poster and owns a company
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        role: 'JOB_POSTER'
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Find the user's existing company
    const existingCompany = await prisma.company.findFirst({
      where: {
        ownerId: userId
      }
    })

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Handle location data (convert objects to JSON strings for storage)
    const processedLocations = Array.isArray(locations) 
      ? locations.map(loc => typeof loc === 'string' ? loc : JSON.stringify(loc))
      : []
    
    // Handle benefits data
    const processedBenefits = Array.isArray(benefits) ? benefits : []
    
    // Update company
    console.log('Updating company with data:', {
      name, description, industry, size: companySize, foundedYear,
      email, phone, website, headquarters, locations: processedLocations,
      logo, linkedinUrl, twitterUrl, facebookUrl, benefits: processedBenefits
    })
    
    const updatedCompany = await prisma.company.update({
      where: {
        id: existingCompany.id
      },
      data: {
        name,
        description,
        industry,
        size: companySize as any,
        foundedYear: foundedYear ? parseInt(foundedYear.toString()) : null,
        email,
        phone,
        website,
        headquarters,
        locations: processedLocations,
        logo,
        linkedinUrl,
        twitterUrl,
        facebookUrl,
        benefits: processedBenefits,
        updatedAt: new Date()
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            jobPosts: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Company profile updated successfully',
      company: updatedCompany
    })

  } catch (error) {
    console.error('Error updating company profile:', error)
    return NextResponse.json(
      { error: 'Failed to update company profile' },
      { status: 500 }
    )
  }
}

// POST /api/companies/profile - Create company profile for user who doesn't have one
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('POST /api/companies/profile - Received data:', data)
    
    const {
      userId,
      name,
      description,
      industry,
      size,
      foundedYear,
      email,
      phone,
      website,
      headquarters,
      locations = [],
      logo,
      linkedinUrl,
      twitterUrl,
      facebookUrl,
      benefits = []
    } = data

    // Validate size enum if provided
    const validSizes = ['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']
    const companySize = size && validSizes.includes(size) ? size : null
    console.log('PUT - Company size validation:', { size, companySize })

    // Validate required fields
    if (!userId || !name) {
      return NextResponse.json(
        { error: 'User ID and company name are required' },
        { status: 400 }
      )
    }

    // Verify the user is a job poster
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        role: 'JOB_POSTER'
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: User must be a job poster' },
        { status: 403 }
      )
    }

    // Check if user already has a company
    const existingCompany = await prisma.company.findFirst({
      where: {
        ownerId: userId
      }
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: 'User already has a company profile' },
        { status: 409 }
      )
    }

    // Create slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // Ensure slug is unique
    let slug = baseSlug
    let counter = 1
    while (true) {
      const existingSlug = await prisma.company.findFirst({
        where: { slug }
      })
      if (!existingSlug) break
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Handle location data (convert objects to JSON strings for storage)
    const processedLocations = Array.isArray(locations) 
      ? locations.map(loc => typeof loc === 'string' ? loc : JSON.stringify(loc))
      : []
    
    // Handle benefits data
    const processedBenefits = Array.isArray(benefits) ? benefits : []
    
    // Create company
    console.log('Creating company with data:', {
      name, slug, description, industry, size: companySize, foundedYear, 
      email, phone, website, headquarters, locations: processedLocations, 
      benefits: processedBenefits, ownerId: userId
    })
    
    const company = await prisma.company.create({
      data: {
        name,
        slug,
        description,
        industry,
        size: companySize as any,
        foundedYear: foundedYear ? parseInt(foundedYear.toString()) : null,
        email,
        phone,
        website,
        headquarters,
        locations,
        logo,
        linkedinUrl,
        twitterUrl,
        facebookUrl,
        benefits: processedBenefits,
        ownerId: userId
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            jobPosts: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Company profile created successfully',
      company
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating company profile:', error)
    return NextResponse.json(
      { error: 'Failed to create company profile' },
      { status: 500 }
    )
  }
}