import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/jobs/my-jobs - Get jobs posted by the current user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const posterId = searchParams.get('posterId')
    
    if (!posterId) {
      return NextResponse.json(
        { error: 'Poster ID is required' },
        { status: 400 }
      )
    }

    // Verify the user is a job poster
    const user = await prisma.user.findFirst({
      where: {
        id: posterId,
        role: 'JOB_POSTER'
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Fetch jobs posted by this user
    const jobs = await prisma.jobPost.findMany({
      where: {
        posterId: posterId
      },
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
    })

    // Get summary statistics
    const stats = {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(job => job.isActive).length,
      totalApplications: jobs.reduce((sum, job) => sum + job._count.applications, 0),
      featuredJobs: jobs.filter(job => job.isFeatured).length
    }

    return NextResponse.json({
      jobs,
      stats
    })

  } catch (error) {
    console.error('Error fetching user jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

// PATCH /api/jobs/my-jobs - Update job status (activate/deactivate)
export async function PATCH(request: NextRequest) {
  try {
    const { jobId, isActive, posterId } = await request.json()
    
    if (!jobId || !posterId) {
      return NextResponse.json(
        { error: 'Job ID and Poster ID are required' },
        { status: 400 }
      )
    }

    // Verify the user owns this job
    const job = await prisma.jobPost.findFirst({
      where: {
        id: jobId,
        posterId: posterId
      }
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update job status
    const updatedJob = await prisma.jobPost.update({
      where: { id: jobId },
      data: { 
        isActive: isActive !== undefined ? isActive : job.isActive,
        updatedAt: new Date()
      },
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
        _count: {
          select: {
            applications: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Job updated successfully',
      job: updatedJob
    })

  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    )
  }
}