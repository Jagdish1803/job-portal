import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/jobs - Fetch all jobs with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    // Filters
    const search = searchParams.get('search') || ''
    const location = searchParams.get('location') || ''
    const jobType = searchParams.get('jobType') || ''
    const workMode = searchParams.get('workMode') || ''
    const experienceLevel = searchParams.get('experienceLevel') || ''
    const salaryMin = searchParams.get('salaryMin')
    const salaryMax = searchParams.get('salaryMax')

    // Build where clause
    const where: any = {
      isActive: true,
      AND: []
    }

    // Search filter
    if (search) {
      where.AND.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { company: { name: { contains: search, mode: 'insensitive' } } }
        ]
      })
    }

    // Location filter
    if (location) {
      where.AND.push({
        location: { contains: location, mode: 'insensitive' }
      })
    }

    // Job type filter
    if (jobType) {
      where.AND.push({ jobType })
    }

    // Work mode filter
    if (workMode) {
      where.AND.push({ workMode })
    }

    // Experience level filter
    if (experienceLevel) {
      where.AND.push({ experienceLevel })
    }

    // Salary range filter
    if (salaryMin || salaryMax) {
      const salaryFilter: any = {}
      if (salaryMin) {
        salaryFilter.gte = parseInt(salaryMin)
      }
      if (salaryMax) {
        salaryFilter.lte = parseInt(salaryMax)
      }
      where.AND.push({ salaryMin: salaryFilter })
    }

    // Remove empty AND array if no filters
    if (where.AND.length === 0) {
      delete where.AND
    }

    // Fetch jobs
    const [jobs, totalCount] = await Promise.all([
      prisma.jobPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              headquarters: true,
              locations: true,
              size: true
            }
          },
          poster: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          },
          skills: {
            include: {
              skill: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          },
          _count: {
            select: {
              applications: true
            }
          }
        }
      }),
      prisma.jobPost.count({ where })
    ])

    return NextResponse.json({
      jobs,
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
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

// POST /api/jobs - Create a new job post
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const {
      title,
      description,
      requirements,
      responsibilities,
      benefits,
      jobType,
      workMode,
      experienceLevel,
      location,
      salaryMin,
      salaryMax,
      currency,
      salaryPeriod,
      showSalary,
      applicationDeadline,
      applicationEmail,
      applicationUrl,
      applicationInstructions,
      companyId,
      posterId,
      categories = [],
      skills = [],
      isFeatured = false
    } = data

    // Validate required fields
    if (!title || !description || !requirements || !jobType || !workMode || !experienceLevel || !companyId || !posterId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify that the poster exists and has permission to post for this company
    const poster = await prisma.user.findFirst({
      where: {
        id: posterId,
        role: 'JOB_POSTER',
        jobPosterProfile: {
          canPostJobs: true
        }
      }
    })

    if (!poster) {
      return NextResponse.json(
        { error: 'Unauthorized: User cannot post jobs' },
        { status: 403 }
      )
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim() + '-' + Date.now()

    // Create job post with transaction
    const jobPost = await prisma.$transaction(async (tx) => {
      // Create the job post
      const newJobPost = await tx.jobPost.create({
        data: {
          title,
          slug,
          description,
          requirements,
          responsibilities,
          benefits,
          jobType: jobType as any,
          workMode: workMode as any,
          experienceLevel: experienceLevel as any,
          location,
          salaryMin: salaryMin ? parseInt(salaryMin) : null,
          salaryMax: salaryMax ? parseInt(salaryMax) : null,
          currency: currency || 'USD',
          salaryPeriod: salaryPeriod || 'YEARLY',
          showSalary: showSalary !== false,
          applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
          applicationEmail,
          applicationUrl,
          applicationInstructions,
          isFeatured: isFeatured === true,
          posterId,
          companyId,
          publishedAt: new Date()
        }
      })

      // Add categories if provided
      if (categories.length > 0) {
        await tx.jobCategory.createMany({
          data: categories.map((categoryId: string) => ({
            jobPostId: newJobPost.id,
            categoryId
          }))
        })
      }

      // Add skills if provided
      if (skills.length > 0) {
        // Process each skill and create if it doesn't exist
        for (const skillData of skills) {
          let skillId = skillData.skillId
          
          // If skillId looks like a skill name (not a proper ID), create or find the skill
          if (typeof skillId === 'string' && !skillId.startsWith('cm')) {
            const skillName = skillId.trim()
            if (skillName) {
              // Create slug from skill name
              const slug = skillName
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .trim()

              // Find existing skill or create new one
              let skill = await tx.skill.findFirst({
                where: {
                  OR: [
                    { name: { equals: skillName, mode: 'insensitive' } },
                    { slug: slug }
                  ]
                }
              })

              if (!skill) {
                skill = await tx.skill.create({
                  data: {
                    name: skillName,
                    slug: slug,
                    category: 'General'
                  }
                })
              }
              
              skillId = skill.id
            }
          }

          // Create the job skill relationship if we have a valid skill ID
          if (skillId && skillId.startsWith('cm')) {
            await tx.jobSkill.create({
              data: {
                jobPostId: newJobPost.id,
                skillId: skillId,
                isRequired: skillData.isRequired || false
              }
            })
          }
        }
      }

      return newJobPost
    })

    // Fetch the complete job post with relations
    const completeJobPost = await prisma.jobPost.findUnique({
      where: { id: jobPost.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            headquarters: true,
            locations: true,
            size: true
          }
        },
        poster: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        skills: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Job post created successfully',
      jobPost: completeJobPost
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating job post:', error)
    return NextResponse.json(
      { error: 'Failed to create job post' },
      { status: 500 }
    )
  }
}