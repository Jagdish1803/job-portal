import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, notes } = body
    const applicationId = params.id

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }

    // Update the application
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: status || undefined,
        recruiterNotes: notes !== undefined ? notes : undefined,
        updatedAt: new Date(),
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
      id: updatedApplication.id,
      job: {
        id: updatedApplication.jobPost.id,
        title: updatedApplication.jobPost.title,
        company: updatedApplication.jobPost.company.name,
        location: updatedApplication.jobPost.location,
        jobType: updatedApplication.jobPost.jobType,
        workMode: updatedApplication.jobPost.workMode || 'ON_SITE'
      },
      status: updatedApplication.status,
      appliedDate: updatedApplication.appliedAt.toISOString(),
      lastUpdated: updatedApplication.updatedAt.toISOString(),
      notes: updatedApplication.recruiterNotes
    }

    return NextResponse.json({
      success: true,
      message: 'Application updated successfully',
      application: transformedApplication,
    })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }

    // Delete the application
    await prisma.application.delete({
      where: { id: applicationId }
    })

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    )
  }
}