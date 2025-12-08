"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Phone, 
  MapPin, 
  Upload,
  Globe,
  Linkedin,
  Plus,
  X
} from "lucide-react"
import { toast } from "sonner"


interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  city?: string
  state?: string
  location?: string
  bio?: string
  website?: string
  linkedin?: string
  profilePicture?: string
  skills: Skill[]
  education: Education[]
}

interface Skill {
  name: string
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
}

interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate?: string
  current: boolean
  grade?: string
}

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"]


export default function ProfilePage(): React.JSX.Element {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [newSkill, setNewSkill] = useState({ name: "", level: "Intermediate" as const })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const user = localStorage.getItem('user')
      if (!user) {
        toast.error('Please login to view profile')
        return
      }

      const userData = JSON.parse(user)
      
      // Try to fetch profile from API
      const response = await fetch(`/api/job-seeker-profile?userId=${userData.id}`)
      
      if (response.ok) {
        const data = await response.json()
        
        const loadedProfile: UserProfile = {
          id: userData.id,
          firstName: data.user?.firstName || userData.firstName || '',
          lastName: data.user?.lastName || userData.lastName || '',
          email: data.user?.email || userData.email || '',
          phone: data.user?.phone || '',
          bio: data.user?.bio || '',
          website: data.user?.website || data.profile?.portfolioUrl || '',
          linkedin: data.profile?.linkedinUrl || '',
          location: data.user?.location || '',
          profilePicture: data.user?.profilePicture || userData.profilePicture || '',
          
          // Skills
          skills: data.profile?.skills ? data.profile.skills.map((s: any) => ({
            name: s.skill.name,
            level: s.proficiencyLevel || 'Intermediate'
          })) : [],
          
          // Education
          education: data.profile?.educations ? data.profile.educations.map((edu: any) => ({
            id: edu.id,
            institution: edu.institution,
            degree: edu.degree,
            field: edu.fieldOfStudy || '',
            startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : '',
            endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : '',
            current: edu.isCurrent || false,
            grade: edu.gpa?.toString() || ''
          })) : [],
        }
        
        setProfile(loadedProfile)
      } else {
        // Create new profile with user data
        setProfile({
          id: userData.id,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          location: '',
          bio: '',
          website: '',
          linkedin: '',
          profilePicture: userData.profilePicture || '',
          skills: [],
          education: []
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    try {
      // Call API to save profile data
      const response = await fetch('/api/job-seeker-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profile,
          userId: profile?.id,
        })
      })
      
      if (response.ok) {
        toast.success('Profile saved successfully!')
        
        // Update user data in localStorage
        const user = localStorage.getItem('user')
        if (user) {
          const userData = JSON.parse(user)
          const updatedUser = {
            ...userData,
            firstName: profile?.firstName,
            lastName: profile?.lastName,
            phone: profile?.phone,
            profilePicture: profile?.profilePicture
          }
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to save profile")
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    }
  }

  const addSkill = () => {
    if (newSkill.name.trim() && profile) {
      setProfile({
        ...profile,
        skills: [...profile.skills, { ...newSkill }]
      })
      setNewSkill({ name: "", level: "Intermediate" })
    }
  }

  const removeSkill = (index: number) => {
    if (profile) {
      setProfile({
        ...profile,
        skills: profile.skills.filter((_, i) => i !== index)
      })
    }
  }

  const addEducation = () => {
    if (profile) {
      const newEdu: Education = {
        id: Date.now().toString(),
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        current: false,
        grade: ''
      }
      setProfile({
        ...profile,
        education: [...profile.education, newEdu]
      })
    }
  }

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    if (profile) {
      setProfile({
        ...profile,
        education: profile.education.map(edu =>
          edu.id === id ? { ...edu, [field]: value } : edu
        )
      })
    }
  }

  const removeEducation = (id: string) => {
    if (profile) {
      setProfile({
        ...profile,
        education: profile.education.filter(edu => edu.id !== id)
      })
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload only JPEG, PNG, or WebP images")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    setUploadingPhoto(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', profile.id)

      const response = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setProfile({ ...profile, profilePicture: data.url })
        
        // Update user in localStorage immediately
        const user = localStorage.getItem('user')
        if (user) {
          const userData = JSON.parse(user)
          const updatedUser = { ...userData, profilePicture: data.url }
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
        
        // Save profile picture to database immediately
        await fetch('/api/job-seeker-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: profile.id,
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            city: profile.city,
            state: profile.state,
            profilePicture: data.url,
            gender: profile.gender,
            jobType: profile.jobType,
            bio: profile.bio,
          })
        })
        
        toast.success("Profile picture uploaded successfully!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to upload photo")
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error("Failed to upload photo")
    } finally {
      setUploadingPhoto(false)
    }
  }



  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 lg:px-6 pt-2">
        <div className="py-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">Profile</h1>
                <p className="text-gray-600">Manage your professional profile and preferences</p>
              </div>
              <Button onClick={saveProfile} className="bg-black hover:bg-gray-800 text-white">
                Save Changes
              </Button>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left Column - Profile Card */}
              <div className="lg:col-span-1">
                <Card className="p-6">
                  <div className="text-center">
                    {/* Profile Photo */}
                    <div className="mb-6">
                      <Avatar className="w-32 h-32 mx-auto mb-4">
                        <AvatarImage src={profile.profilePicture} />
                        <AvatarFallback className="text-2xl bg-black text-white">
                          {`${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase() || "JS"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label htmlFor="photo-upload">
                        <Button 
                          asChild 
                          variant="outline" 
                          size="sm"
                          disabled={uploadingPhoto}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                          </span>
                        </Button>
                      </label>
                    </div>

                    {/* Profile Name */}
                    <h2 className="text-xl font-bold text-black mb-1">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <p className="text-gray-500 mb-4">{profile.email}</p>

                    {/* Contact Info */}
                    <div className="space-y-3 text-left">
                      {profile.phone && (
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                      
                      {profile.location && (
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      
                      {profile.website && (
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Globe className="w-4 h-4" />
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:underline">
                            Website
                          </a>
                        </div>
                      )}
                      
                      {profile.linkedin && (
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Linkedin className="w-4 h-4" />
                          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                             className="text-blue-600 hover:underline">
                            LinkedIn
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column - Profile Details */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Basic Information */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-6 text-black">Basic Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <Input
                        value={profile.firstName}
                        onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                        placeholder="Enter your first name"
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <Input
                        value={profile.lastName}
                        onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                        placeholder="Enter your last name"
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <Input
                        value={profile.email}
                        disabled
                        className="h-12 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <Input
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        placeholder="Enter your phone number"
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <Input
                      value={profile.location}
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                      placeholder="City, State"
                      className="h-12"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <Textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                      <Input
                        value={profile.website}
                        onChange={(e) => setProfile({...profile, website: e.target.value})}
                        placeholder="https://..."
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                      <Input
                        value={profile.linkedin}
                        onChange={(e) => setProfile({...profile, linkedin: e.target.value})}
                        placeholder="https://linkedin.com/in/..."
                        className="h-12"
                      />
                    </div>
                  </div>
                </Card>

                {/* Skills */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-black">Skills</h3>
                    <Button 
                      size="sm" 
                      onClick={addSkill} 
                      disabled={!newSkill.name.trim()}
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Skill
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <Input
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                      placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      className="h-12"
                    />
                    <Select 
                      value={newSkill.level} 
                      onValueChange={(value) => setNewSkill({...newSkill, level: value as any})}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {SKILL_LEVELS.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-2 px-3 py-2">
                        {skill.name} ({skill.level})
                        <button
                          onClick={() => removeSkill(index)}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    {profile.skills.length === 0 && (
                      <p className="text-gray-500">No skills added yet</p>
                    )}
                  </div>
                </Card>

                {/* Education */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-black">Education</h3>
                    <Button 
                      size="sm" 
                      onClick={addEducation}
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Education
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {profile.education.map((edu) => (
                      <Card key={edu.id} className="p-4 border-l-4 border-l-blue-500">
                        <div className="grid md:grid-cols-2 gap-4">
                          <Input
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                            placeholder="Institution name"
                            className="h-10"
                          />
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            placeholder="Degree"
                            className="h-10"
                          />
                          <Input
                            value={edu.field}
                            onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                            placeholder="Field of study"
                            className="h-10"
                          />
                          <Input
                            value={edu.grade}
                            onChange={(e) => updateEducation(edu.id, 'grade', e.target.value)}
                            placeholder="Grade/GPA"
                            className="h-10"
                          />
                          <div className="flex items-center gap-2">
                            <Input
                              type="date"
                              value={edu.startDate}
                              onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                              className="h-10"
                            />
                            <span className="text-gray-500">to</span>
                            <Input
                              type="date"
                              value={edu.endDate}
                              onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                              disabled={edu.current}
                              className="h-10"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={edu.current}
                                onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">Currently studying</span>
                            </label>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeEducation(edu.id)}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {profile.education.length === 0 && (
                      <p className="text-gray-500">No education added yet</p>
                    )}
                  </div>
                </Card>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}