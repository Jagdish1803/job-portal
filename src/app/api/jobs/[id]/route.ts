import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/jobs/[id] - Delete a specific job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params
    const { posterId } = await request.json()

    if (!posterId) {
      return NextResponse.json(
        { error: 'Poster ID is required' },
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

    // Delete the job and all related data
    await prisma.$transaction(async (tx) => {
      // Delete job skills
      await tx.jobSkill.deleteMany({
        where: { jobPostId: jobId }
      })

      // Delete job categories
      await tx.jobCategory.deleteMany({
        where: { jobPostId: jobId }
      })

      // Delete applications
      await tx.application.deleteMany({
        where: { jobPostId: jobId }
      })

      // Delete saved jobs
      await tx.savedJob.deleteMany({
        where: { jobPostId: jobId }
      })

      // Finally delete the job post
      await tx.jobPost.delete({
        where: { id: jobId }
      })
    })

    return NextResponse.json({
      message: 'Job deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    )
  }
}

// GET /api/jobs/[id] - Get a specific job for editing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params

    const job = await prisma.jobPost.findUnique({
      where: { id: jobId },
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

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ job })

  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    )
  }
}

// PUT /api/jobs/[id] - Update a specific job
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params
    const body = await request.json()
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
      applicationEmail,
      applicationDeadline,
      skills,
      posterId
    } = body

    if (!posterId) {
      return NextResponse.json(
        { error: 'Poster ID is required' },
        { status: 400 }
      )
    }

    // Verify the job exists and belongs to the user
    const existingJob = await prisma.jobPost.findFirst({
      where: {
        id: jobId,
        posterId: posterId
      }
    })

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update the job in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the job post
      const updatedJob = await tx.jobPost.update({
        where: { id: jobId },
        data: {
          title,
          description,
          requirements: requirements || null,
          responsibilities: responsibilities || null,
          benefits: benefits || null,
          jobType,
          workMode,
          experienceLevel: experienceLevel || null,
          location: location || null,
          salaryMin: salaryMin ? parseInt(salaryMin) : null,
          salaryMax: salaryMax ? parseInt(salaryMax) : null,
          currency,
          applicationEmail: applicationEmail || null,
          applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
          updatedAt: new Date(),
        },
      })

      // Handle skills update if provided
      if (skills && Array.isArray(skills)) {
        // Remove existing job skills
        await tx.jobSkill.deleteMany({
          where: { jobPostId: jobId }
        })

        // Add new skills
        for (const skillData of skills) {
          if (skillData.skillId && skillData.skillId.trim()) {
            // Check if skill exists, create if not
            let skill = await tx.skill.findFirst({
              where: { 
                name: { 
                  equals: skillData.skillId.trim(),
                  mode: 'insensitive'
                }
              }
            })

            if (!skill) {
              const skillName = skillData.skillId.trim()
              skill = await tx.skill.create({
                data: { 
                  name: skillName,
                  slug: skillName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                }
              })
            }

            // Create job skill relationship
            await tx.jobSkill.create({
              data: {
                jobPostId: updatedJob.id,
                skillId: skill.id,
                isRequired: skillData.isRequired || true,
              },
            })
          }
        }
      }

      return updatedJob
    })

    return NextResponse.json({ 
      message: 'Job updated successfully', 
      job: result 
    })

  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    )
  }
}