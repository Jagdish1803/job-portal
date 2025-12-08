import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const applicantId = searchParams.get('applicantId')

    if (!applicantId) {
      return NextResponse.json(
        { error: 'Applicant ID is required' },
        { status: 400 }
      )
    }

    // Get applications for the user
    const applications = await prisma.application.findMany({
      where: { applicantId },
      include: {
        jobPost: {
          include: {
            company: {
              select: {
                name: true,
                logo: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform the data to match the expected format
    const transformedApplications = applications.map(app => ({
      id: app.id,
      job: {
        id: app.jobPost.id,
        title: app.jobPost.title,
        company: app.jobPost.company.name,
        location: app.jobPost.location,
        jobType: app.jobPost.jobType,
        workMode: app.jobPost.workMode || 'ON_SITE'
      },
      status: app.status,
      appliedDate: app.appliedAt.toISOString(),
      lastUpdated: app.updatedAt.toISOString(),
      notes: app.recruiterNotes || null
    }))

    return NextResponse.json({
      success: true,
      applications: transformedApplications,
    })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, applicantId, notes } = body

    if (!jobId || !applicantId) {
      return NextResponse.json(
        { error: 'Job ID and Applicant ID are required' },
        { status: 400 }
      )
    }

    // Check if user already applied to this job
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobPostId: jobId,
        applicantId: applicantId,
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      )
    }

    // Create new application
    const application = await prisma.application.create({
      data: {
        jobPostId: jobId,
        applicantId: applicantId,
        status: 'PENDING',
        recruiterNotes: notes || null,
      },
      include: {
        jobPost: {
          include: {
            company: {
              select: {
                name: true,
                logo: true,
              }
            }
          }
        }
      }
    })

    // Transform the data to match the expected format
    const transformedApplication = {
      id: application.id,
      job: {
        id: application.jobPost.id,
        title: application.jobPost.title,
        company: application.jobPost.company.name,
        location: application.jobPost.location,
        jobType: application.jobPost.jobType,
        workMode: application.jobPost.workMode || 'ON_SITE'
      },
      status: application.status,
      appliedDate: application.appliedAt.toISOString(),
      lastUpdated: application.updatedAt.toISOString(),
      notes: application.recruiterNotes
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      application: transformedApplication,
    })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}