"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Upload, 
  Plus, 
  X, 
  FileText, 
  GraduationCap, 
  Languages, 
  Briefcase, 
  Code,
  ChevronLeft,
  ChevronRight,
  Check
} from "lucide-react"
import { toast } from "sonner"

interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startYear: string
  endYear: string
  grade?: string
}

interface Skill {
  name: string
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
}

interface Language {
  name: string
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native'
}

interface Internship {
  id: string
  company: string
  position: string
  duration: string
  description: string
}

interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  url?: string
}

interface ProfileData {
  // Basic Info
  profilePhoto?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  state: string
  preferredLocation: string
  age: string
  gender: string
  jobType: string[]
  summary: string
  
  // Additional sections
  education: Education[]
  skills: Skill[]
  languages: Language[]
  internships: Internship[]
  projects: Project[]
  resumeFile?: File
}

interface ProfileCompletionModalProps {
  isOpen: boolean
  onComplete: (profileData: ProfileData) => void
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", 
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal"
]

const JOB_TYPES = ["Full Time", "Part Time", "Contract", "Internship", "Freelance"]
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"]
const LANGUAGE_PROFICIENCY = ["Basic", "Conversational", "Fluent", "Native"]

export function ProfileCompletionModal({ isOpen, onComplete }: ProfileCompletionModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    preferredLocation: "",
    age: "",
    gender: "",
    jobType: [],
    summary: "",
    education: [],
    skills: [],
    languages: [],
    internships: [],
    projects: []
  })

  // Form state for adding new items
  const [newSkill, setNewSkill] = useState({ name: "", level: "Intermediate" as const })
  const [newLanguage, setNewLanguage] = useState({ name: "", proficiency: "Conversational" as const })

  const updateProfileData = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: "",
      degree: "",
      field: "",
      startYear: "",
      endYear: "",
      grade: ""
    }
    updateProfileData("education", [...profileData.education, newEdu])
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    const updated = profileData.education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    )
    updateProfileData("education", updated)
  }

  const removeEducation = (id: string) => {
    updateProfileData("education", profileData.education.filter(edu => edu.id !== id))
  }

  const addSkill = () => {
    if (newSkill.name.trim()) {
      updateProfileData("skills", [...profileData.skills, { ...newSkill }])
      setNewSkill({ name: "", level: "Intermediate" })
    }
  }

  const removeSkill = (index: number) => {
    updateProfileData("skills", profileData.skills.filter((_, i) => i !== index))
  }

  const addLanguage = () => {
    if (newLanguage.name.trim()) {
      updateProfileData("languages", [...profileData.languages, { ...newLanguage }])
      setNewLanguage({ name: "", proficiency: "Conversational" })
    }
  }

  const removeLanguage = (index: number) => {
    updateProfileData("languages", profileData.languages.filter((_, i) => i !== index))
  }

  const addInternship = () => {
    const newIntern: Internship = {
      id: Date.now().toString(),
      company: "",
      position: "",
      duration: "",
      description: ""
    }
    updateProfileData("internships", [...profileData.internships, newIntern])
  }

  const updateInternship = (id: string, field: keyof Internship, value: string) => {
    const updated = profileData.internships.map(intern => 
      intern.id === id ? { ...intern, [field]: value } : intern
    )
    updateProfileData("internships", updated)
  }

  const removeInternship = (id: string) => {
    updateProfileData("internships", profileData.internships.filter(intern => intern.id !== id))
  }

  const addProject = () => {
    const newProj: Project = {
      id: Date.now().toString(),
      title: "",
      description: "",
      technologies: [],
      url: ""
    }
    updateProfileData("projects", [...profileData.projects, newProj])
  }

  const updateProject = (id: string, field: keyof Project, value: any) => {
    const updated = profileData.projects.map(proj => 
      proj.id === id ? { ...proj, [field]: value } : proj
    )
    updateProfileData("projects", updated)
  }

  const removeProject = (id: string) => {
    updateProfileData("projects", profileData.projects.filter(proj => proj.id !== id))
  }

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload only PDF files")
        return
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error("File size must be less than 10MB")
        return
      }
      updateProfileData("resumeFile", file)
      toast.success("Resume uploaded successfully!")
    }
  }

  const validateBasicInfo = () => {
    const required = [
      "firstName", "lastName", "email", "phone", "city", 
      "state", "preferredLocation", "age", "gender", "summary"
    ]
    const missing = required.filter(field => !profileData[field as keyof ProfileData])
    
    if (missing.length > 0) {
      toast.error("Please fill all required fields")
      return false
    }
    
    if (profileData.jobType.length === 0) {
      toast.error("Please select at least one job type")
      return false
    }
    
    return true
  }

  const handleComplete = async () => {
    if (!validateBasicInfo()) return
    
    try {
      // Call API to save profile data
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      })
      
      if (response.ok) {
        // Mark profile as completed in localStorage
        localStorage.setItem("profileCompleted", "true")
        onComplete(profileData)
        toast.success("Profile completed successfully!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to complete profile")
      }
    } catch (error) {
      console.error('Error completing profile:', error)
      toast.error("Failed to complete profile")
    }
  }

  const nextStep = () => {
    if (currentStep === 1 && !validateBasicInfo()) return
    setCurrentStep(prev => Math.min(prev + 1, 3))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const getInitials = () => {
    return `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-none w-screen h-screen max-h-none p-0 bg-gray-50">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-white border-b px-6 py-4 shrink-0">
            <DialogHeader>
              <DialogTitle className="text-3xl text-center font-bold">Complete Your Profile</DialogTitle>
              <p className="text-center text-muted-foreground text-lg mt-2">
                Help employers find you by completing your professional profile
              </p>
            </DialogHeader>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto p-6">

              {/* Progress Steps */}
              <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-6">
                  {[
                    { step: 1, label: "Basic Info" },
                    { step: 2, label: "Skills & Experience" }, 
                    { step: 3, label: "Resume Upload" }
                  ].map(({ step, label }) => (
                    <div key={step} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${
                          step <= currentStep 
                            ? "bg-blue-600 text-white shadow-lg" 
                            : "bg-gray-200 text-gray-600"
                        }`}>
                          {step < currentStep ? <Check className="w-5 h-5" /> : step}
                        </div>
                        <span className={`mt-2 text-sm font-medium ${
                          step <= currentStep ? "text-blue-600" : "text-gray-500"
                        }`}>
                          {label}
                        </span>
                      </div>
                      {step < 3 && (
                        <div className={`w-16 h-0.5 mx-4 mt-[-20px] ${
                          step < currentStep ? "bg-blue-600" : "bg-gray-200"
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Content */}
              <div className="bg-white rounded-lg shadow-sm border p-8">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-8">
                    {/* Profile Photo */}
                    <div className="flex flex-col items-center space-y-6">
                      <Avatar className="w-32 h-32 border-4 border-gray-100">
                        <AvatarImage src={profileData.profilePhoto} />
                        <AvatarFallback className="text-3xl font-semibold bg-blue-100 text-blue-600">
                          {getInitials() || "JS"}
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="lg" className="px-8">
                        <Upload className="w-5 h-5 mr-3" />
                        Upload Profile Photo
                      </Button>
                    </div>

                    {/* Basic Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-base font-semibold text-gray-700">First Name *</label>
                        <Input
                          className="h-12 text-base"
                          value={profileData.firstName}
                          onChange={(e) => updateProfileData("firstName", e.target.value)}
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-base font-semibold text-gray-700">Last Name *</label>
                        <Input
                          className="h-12 text-base"
                          value={profileData.lastName}
                          onChange={(e) => updateProfileData("lastName", e.target.value)}
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-base font-semibold text-gray-700">Email Address *</label>
                        <Input
                          className="h-12 text-base"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => updateProfileData("email", e.target.value)}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-base font-semibold text-gray-700">Phone Number *</label>
                        <Input
                          className="h-12 text-base"
                          value={profileData.phone}
                          onChange={(e) => updateProfileData("phone", e.target.value)}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-base font-semibold text-gray-700">City *</label>
                        <Input
                          className="h-12 text-base"
                          value={profileData.city}
                          onChange={(e) => updateProfileData("city", e.target.value)}
                          placeholder="Mumbai, Delhi, Bangalore..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-base font-semibold text-gray-700">State *</label>
                        <Select value={profileData.state} onValueChange={(value) => updateProfileData("state", value)}>
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Select your state" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDIAN_STATES.map(state => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-base font-semibold text-gray-700">Preferred Work Location *</label>
                      <Input
                        className="h-12 text-base"
                        value={profileData.preferredLocation}
                        onChange={(e) => updateProfileData("preferredLocation", e.target.value)}
                        placeholder="Mumbai, Remote, Bangalore, Pune, Hybrid..."
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-base font-semibold text-gray-700">Age *</label>
                        <Input
                          className="h-12 text-base"
                          type="number"
                          value={profileData.age}
                          onChange={(e) => updateProfileData("age", e.target.value)}
                          placeholder="25"
                          min="18"
                          max="65"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-base font-semibold text-gray-700">Gender *</label>
                        <Select value={profileData.gender} onValueChange={(value) => updateProfileData("gender", value)}>
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

            <div>
              <label className="text-sm font-medium">Job Types *</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {JOB_TYPES.map(type => (
                  <Badge
                    key={type}
                    variant={profileData.jobType.includes(type) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const updated = profileData.jobType.includes(type)
                        ? profileData.jobType.filter(t => t !== type)
                        : [...profileData.jobType, type]
                      updateProfileData("jobType", updated)
                    }}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Summary About Yourself *</label>
              <Textarea
                value={profileData.summary}
                onChange={(e) => updateProfileData("summary", e.target.value)}
                placeholder="Write a brief summary about yourself, your career goals, and what you're looking for..."
                rows={4}
              />
            </div>
          </div>
        )}

        {/* Step 2: Additional Details */}
        {currentStep === 2 && (
          <Tabs defaultValue="education" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="languages">Languages</TabsTrigger>
              <TabsTrigger value="internships">Internships</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>

            <TabsContent value="education" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Education</h3>
                <Button onClick={addEducation} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Education
                </Button>
              </div>
              
              {profileData.education.map(edu => (
                <Card key={edu.id}>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Institution/University"
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                      />
                      <Input
                        placeholder="Degree (e.g., B.Tech, MBA)"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <Input
                        placeholder="Field of Study"
                        value={edu.field}
                        onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                      />
                      <Input
                        placeholder="Start Year"
                        value={edu.startYear}
                        onChange={(e) => updateEducation(edu.id, "startYear", e.target.value)}
                      />
                      <Input
                        placeholder="End Year"
                        value={edu.endYear}
                        onChange={(e) => updateEducation(edu.id, "endYear", e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between">
                      <Input
                        placeholder="Grade/CGPA (optional)"
                        value={edu.grade}
                        onChange={(e) => updateEducation(edu.id, "grade", e.target.value)}
                        className="max-w-48"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeEducation(edu.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="skills" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Skills</h3>
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Skill name"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                />
                <Select value={newSkill.level} onValueChange={(value: any) => setNewSkill({...newSkill, level: value})}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_LEVELS.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addSkill}>Add</Button>
              </div>

              <div className="space-y-2">
                {profileData.skills.map((skill, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <span className="font-medium">{skill.name}</span>
                      <Badge variant="outline" className="ml-2">{skill.level}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkill(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="languages" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Languages</h3>
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Language name"
                  value={newLanguage.name}
                  onChange={(e) => setNewLanguage({...newLanguage, name: e.target.value})}
                />
                <Select value={newLanguage.proficiency} onValueChange={(value: any) => setNewLanguage({...newLanguage, proficiency: value})}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_PROFICIENCY.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addLanguage}>Add</Button>
              </div>

              <div className="space-y-2">
                {profileData.languages.map((lang, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <span className="font-medium">{lang.name}</span>
                      <Badge variant="outline" className="ml-2">{lang.proficiency}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLanguage(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="internships" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Internships</h3>
                <Button onClick={addInternship} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Internship
                </Button>
              </div>
              
              {profileData.internships.map(intern => (
                <Card key={intern.id}>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Company"
                        value={intern.company}
                        onChange={(e) => updateInternship(intern.id, "company", e.target.value)}
                      />
                      <Input
                        placeholder="Position"
                        value={intern.position}
                        onChange={(e) => updateInternship(intern.id, "position", e.target.value)}
                      />
                    </div>
                    <Input
                      placeholder="Duration (e.g., Jun 2024 - Aug 2024)"
                      value={intern.duration}
                      onChange={(e) => updateInternship(intern.id, "duration", e.target.value)}
                    />
                    <Textarea
                      placeholder="Description of your role and achievements"
                      value={intern.description}
                      onChange={(e) => updateInternship(intern.id, "description", e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeInternship(intern.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Projects</h3>
                <Button onClick={addProject} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Project
                </Button>
              </div>
              
              {profileData.projects.map(project => (
                <Card key={project.id}>
                  <CardContent className="pt-4 space-y-4">
                    <Input
                      placeholder="Project Title"
                      value={project.title}
                      onChange={(e) => updateProject(project.id, "title", e.target.value)}
                    />
                    <Textarea
                      placeholder="Project Description"
                      value={project.description}
                      onChange={(e) => updateProject(project.id, "description", e.target.value)}
                      rows={3}
                    />
                    <Input
                      placeholder="Technologies Used (comma-separated)"
                      value={project.technologies.join(", ")}
                      onChange={(e) => updateProject(project.id, "technologies", e.target.value.split(", ").filter(t => t.trim()))}
                    />
                    <div className="flex justify-between gap-4">
                      <Input
                        placeholder="Project URL (optional)"
                        value={project.url}
                        onChange={(e) => updateProject(project.id, "url", e.target.value)}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeProject(project.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        )}

        {/* Step 3: Resume Upload */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-medium mb-2">Upload Your Resume</h3>
              <p className="text-muted-foreground">
                Upload your resume to complete your profile (PDF only, max 10MB)
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                
                {profileData.resumeFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5 text-green-500" />
                      <span className="text-green-600 font-medium">
                        {profileData.resumeFile.name}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      File size: {(profileData.resumeFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => updateProfileData("resumeFile", undefined)}
                    >
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-lg font-medium">Drag & drop your resume here</p>
                    <p className="text-muted-foreground">or click to browse files</p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      className="hidden"
                      id="resume-upload"
                    />
                    <Button asChild>
                      <label htmlFor="resume-upload" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </label>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Supported format: PDF</p>
              <p>Maximum file size: 10MB</p>
            </div>
          </div>
        )}

              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="bg-white border-t px-6 py-4 shrink-0">
              <div className="max-w-5xl mx-auto flex justify-between items-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-8"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Previous
                </Button>

                <div className="text-center">
                  <p className="text-lg font-medium text-gray-600">
                    Step {currentStep} of 3
                  </p>
                </div>

                {currentStep < 3 ? (
                  <Button onClick={nextStep} size="lg" className="px-8">
                    Next
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleComplete} size="lg" className="px-8 bg-green-600 hover:bg-green-700">
                    <Check className="w-5 h-5 mr-2" />
                    Complete Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}