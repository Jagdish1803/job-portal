import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      firstName,
      lastName,
      phone,
      city,
      state,
      preferredLocation,
      age,
      gender,
      jobType,
      bio,
      website,
      linkedin,
      skills,
      education,
      experience,
      languages,
      internships,
      projects,
      resumeUrl,
      dateOfBirth,
      currentJobTitle,
      yearsOfExperience,
      expectedSalaryMin,
      expectedSalaryMax,
      currency,
      preferredWorkMode,
      profilePicture
    } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Update user basic information (only update fields that are provided)
    const userUpdateData: any = {}
    if (firstName !== undefined) userUpdateData.firstName = firstName
    if (lastName !== undefined) userUpdateData.lastName = lastName
    if (phone !== undefined) userUpdateData.phone = phone
    if (bio !== undefined) userUpdateData.bio = bio
    if (website !== undefined) userUpdateData.website = website
    if (profilePicture !== undefined) userUpdateData.profilePicture = profilePicture
    if (city && state) userUpdateData.location = `${city}, ${state}`
    
    await prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
    })

    // Map job types to enum values
    const mappedJobTypes = jobType ? jobType.map((type: string) => mapJobType(type)) : []

    // Create or update job seeker profile
    const jobSeekerProfile = await prisma.jobSeekerProfile.upsert({
      where: { userId },
      create: {
        userId,
        currentJobTitle,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
        expectedSalaryMin: expectedSalaryMin ? parseInt(expectedSalaryMin) : null,
        expectedSalaryMax: expectedSalaryMax ? parseInt(expectedSalaryMax) : null,
        currency: currency || 'INR',
        preferredWorkMode: preferredWorkMode || null,
        preferredJobTypes: mappedJobTypes,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : age ? new Date(new Date().getFullYear() - parseInt(age), 0, 1) : null,
        gender,
        resumeUrl,
        linkedinUrl: linkedin,
        portfolioUrl: website,
        languagesSpoken: languages?.map((lang: any) => `${lang.name} (${lang.proficiency})`) || [],
      },
      update: {
        currentJobTitle,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
        expectedSalaryMin: expectedSalaryMin ? parseInt(expectedSalaryMin) : null,
        expectedSalaryMax: expectedSalaryMax ? parseInt(expectedSalaryMax) : null,
        currency: currency || 'INR',
        preferredWorkMode: preferredWorkMode || null,
        preferredJobTypes: mappedJobTypes,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : age ? new Date(new Date().getFullYear() - parseInt(age), 0, 1) : null,
        gender,
        resumeUrl,
        linkedinUrl: linkedin,
        portfolioUrl: website,
        languagesSpoken: languages?.map((lang: any) => `${lang.name} (${lang.proficiency})`) || [],
      },
    })

    // Handle skills
    if (skills && skills.length > 0) {
      // First, delete existing skills
      await prisma.jobSeekerSkill.deleteMany({
        where: { jobSeekerProfileId: jobSeekerProfile.id },
      })

      // Create new skills
      for (const skill of skills) {
        // Find or create the skill
        let skillRecord = await prisma.skill.findFirst({
          where: { name: { equals: skill.name, mode: 'insensitive' } },
        })

        if (!skillRecord) {
          skillRecord = await prisma.skill.create({
            data: {
              name: skill.name,
              slug: skill.name.toLowerCase().replace(/\s+/g, '-'),
            },
          })
        }

        // Create job seeker skill
        await prisma.jobSeekerSkill.create({
          data: {
            jobSeekerProfileId: jobSeekerProfile.id,
            skillId: skillRecord.id,
            proficiencyLevel: skill.level,
          },
        })
      }
    }

    // Handle education
    if (education && education.length > 0) {
      // Delete existing education
      await prisma.education.deleteMany({
        where: { jobSeekerProfileId: jobSeekerProfile.id },
      })

      // Create new education entries
      for (const edu of education) {
        if (edu.institution && edu.degree) {
          await prisma.education.create({
            data: {
              jobSeekerProfileId: jobSeekerProfile.id,
              institution: edu.institution,
              degree: edu.degree,
              fieldOfStudy: edu.field || null,
              level: mapEducationLevel(edu.degree) as any,
              startDate: edu.startDate ? new Date(edu.startDate) : new Date(),
              endDate: edu.endDate ? new Date(edu.endDate) : null,
              isCurrent: edu.current || false,
              gpa: edu.grade ? parseFloat(edu.grade) : null,
            },
          })
        }
      }
    }

    // Handle experience (internships and regular experience)
    if (experience && experience.length > 0) {
      // Delete existing experience
      await prisma.experience.deleteMany({
        where: { jobSeekerProfileId: jobSeekerProfile.id },
      })

      // Create new experience entries
      for (const exp of experience) {
        if (exp.company && exp.position) {
          await prisma.experience.create({
            data: {
              jobSeekerProfileId: jobSeekerProfile.id,
              jobTitle: exp.position,
              companyName: exp.company,
              location: exp.location || null,
              startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              isCurrent: exp.current || false,
              description: exp.description || null,
            },
          })
        }
      }
    }

    // Handle internships (also as experience)
    if (internships && internships.length > 0) {
      for (const internship of internships) {
        if (internship.company && internship.position) {
          await prisma.experience.create({
            data: {
              jobSeekerProfileId: jobSeekerProfile.id,
              jobTitle: internship.position,
              companyName: internship.company,
              description: `${internship.description}\nDuration: ${internship.duration}`,
              startDate: new Date(), // You might want to parse duration for actual dates
              isCurrent: false,
            },
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: jobSeekerProfile,
    })
  } catch (error) {
    console.error('Error updating job seeker profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
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

    // Get user basic information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        bio: true,
        location: true,
        website: true,
        profilePicture: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get job seeker profile
    const jobSeekerProfile = await prisma.jobSeekerProfile.findUnique({
      where: { userId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        educations: {
          orderBy: { startDate: 'desc' },
        },
        experiences: {
          orderBy: { startDate: 'desc' },
        },
        certifications: {
          orderBy: { issueDate: 'desc' },
        },
      },
    })

    return NextResponse.json({
      success: true,
      user,
      profile: jobSeekerProfile,
    })
  } catch (error) {
    console.error('Error fetching job seeker profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// Helper function to map job type strings to enum values
function mapJobType(jobType: string): string {
  const typeMap: { [key: string]: string } = {
    'Full Time': 'FULL_TIME',
    'Part Time': 'PART_TIME',
    'Contract': 'CONTRACT',
    'Freelance': 'FREELANCE',
    'Internship': 'INTERNSHIP',
    'Temporary': 'TEMPORARY'
  }
  return typeMap[jobType] || jobType.toUpperCase().replace(/\s+/g, '_')
}

// Helper function to map degree to education level
function mapEducationLevel(degree: string): string {
  const degreeLower = degree.toLowerCase()
  
  if (degreeLower.includes('phd') || degreeLower.includes('doctorate')) {
    return 'DOCTORATE'
  } else if (degreeLower.includes('master') || degreeLower.includes('mba') || degreeLower.includes('ms') || degreeLower.includes('ma')) {
    return 'MASTER'
  } else if (degreeLower.includes('bachelor') || degreeLower.includes('bs') || degreeLower.includes('ba') || degreeLower.includes('btech') || degreeLower.includes('be')) {
    return 'BACHELOR'
  } else if (degreeLower.includes('associate')) {
    return 'ASSOCIATE'
  } else if (degreeLower.includes('high school') || degreeLower.includes('12th') || degreeLower.includes('10th')) {
    return 'HIGH_SCHOOL'
  } else {
    return 'CERTIFICATE'
  }
}
