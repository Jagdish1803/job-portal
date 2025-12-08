import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/companies - Fetch companies with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    
    // Search
    const search = searchParams.get('search') || ''
    const industry = searchParams.get('industry') || ''
    const size = searchParams.get('size') || ''
    
    // Build where clause
    const where: any = {
      AND: []
    }

    // Search filter
    if (search) {
      where.AND.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { industry: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    // Industry filter
    if (industry) {
      where.AND.push({
        industry: { contains: industry, mode: 'insensitive' }
      })
    }

    // Size filter
    if (size) {
      where.AND.push({ size })
    }

    // Remove empty AND array if no filters
    if (where.AND.length === 0) {
      delete where.AND
    }

    // Fetch companies
    const [companies, totalCount] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isVerified: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          _count: {
            select: {
              jobPosts: {
                where: { isActive: true }
              }
            }
          }
        }
      }),
      prisma.company.count({ where })
    ])

    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}

// POST /api/companies - Create a new company
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const {
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
      coverImage,
      linkedinUrl,
      twitterUrl,
      facebookUrl,
      ownerId
    } = data

    // Validate required fields
    if (!name || !ownerId) {
      return NextResponse.json(
        { error: 'Company name and owner ID are required' },
        { status: 400 }
      )
    }

    // Verify the owner exists and is a job poster
    const owner = await prisma.user.findFirst({
      where: {
        id: ownerId,
        role: 'JOB_POSTER'
      }
    })

    if (!owner) {
      return NextResponse.json(
        { error: 'Unauthorized: User must be a job poster' },
        { status: 403 }
      )
    }

    // Check if company name already exists
    const existingCompany = await prisma.company.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' }
      }
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: 'A company with this name already exists' },
        { status: 409 }
      )
    }

    // Create slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // Create company
    const company = await prisma.company.create({
      data: {
        name,
        slug,
        description,
        industry,
        size: size as any,
        foundedYear: foundedYear ? parseInt(foundedYear) : null,
        email,
        phone,
        website,
        headquarters,
        locations,
        logo,
        coverImage,
        linkedinUrl,
        twitterUrl,
        facebookUrl,
        ownerId
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
      message: 'Company created successfully',
      company
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}