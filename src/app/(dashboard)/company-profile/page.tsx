"use client"

import React, { useState, useEffect, useRef } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, 
  MapPin, 
  Users, 
  Calendar,
  Globe,
  Mail,
  Phone,
  Camera,
  Save,
  Plus,
  X,
  Edit,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

interface Company {
  id: string
  name: string
  description: string | null
  logo: string | null
  website: string | null
  industry: string | null
  size: string | null
  headquarters: string | null
  foundedYear: number | null
  email: string | null
  phone: string | null
  locations: Array<{
    name: string
    address?: string
    mapLink?: string
  }>
  linkedinUrl: string | null
  twitterUrl: string | null
  facebookUrl: string | null
  benefits: string[]
  slug: string
  createdAt: string
  updatedAt: string
}

export default function CompanyProfilePage(): React.JSX.Element {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [company, setCompany] = useState<Company | null>(null)
  const [newLocation, setNewLocation] = useState("")
  const [newLocationAddress, setNewLocationAddress] = useState("")
  const [newLocationMapLink, setNewLocationMapLink] = useState("")
  const [newBenefit, setNewBenefit] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadUserAndCompany()
  }, [])

  const loadUserAndCompany = async () => {
    try {
      // Check authentication
      const userData = localStorage.getItem('user')
      if (!userData) {
        window.location.href = '/sign-in'
        return
      }

      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== 'JOB_POSTER') {
        window.location.href = '/job-seeker-dashboard'
        return
      }

      setUser(parsedUser)

      // Load company data from API
      try {
        const response = await fetch(`/api/companies/profile?userId=${parsedUser.id}`)
        if (response.ok) {
          const data = await response.json()
          setCompany(data.company)
        } else if (response.status === 404) {
          // Company doesn't exist, create a default one
          console.log('No company found, will create new one on save')
          setCompany(null)
        } else {
          console.error('Error loading company profile')
          setCompany(null)
        }
      } catch (error) {
        console.error('Error fetching company:', error)
        setCompany(null)
      }
      
    } catch (error) {
      console.error('Error loading company:', error)
    } finally {
      setIsLoading(false)
    }
  }





  const handleSocialLinkChange = (field: 'linkedinUrl' | 'twitterUrl' | 'facebookUrl', value: string) => {
    updateCompany({ [field]: value || null })
  }

  const addBenefit = () => {
    if (!newBenefit.trim()) return
    updateCompany({ benefits: [...displayCompany.benefits, newBenefit.trim()] })
    setNewBenefit("")
    toast.success('Benefit added successfully!')
  }

  const removeBenefit = (index: number) => {
    updateCompany({ benefits: displayCompany.benefits.filter((_, i) => i !== index) })
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setIsUploading(true)
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `company-logo-${user.id}-${Date.now()}.${fileExt}`
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        toast.error('Failed to upload image')
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName)

      // Update company with new logo URL
      console.log('Updating company with logo:', publicUrl)
      updateCompany({ logo: publicUrl })
      
      // Force state refresh if no existing company
      if (!company) {
        setCompany({ ...displayCompany, logo: publicUrl })
      }
      toast.success('Logo uploaded successfully!')
      
      // Notify nav user component to refresh logo
      window.dispatchEvent(new CustomEvent('company-logo-updated'))
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const addLocation = () => {
    if (!newLocation.trim()) return
    
    // Validate Google Maps link if provided
    if (newLocationMapLink.trim() && !isValidGoogleMapsLink(newLocationMapLink.trim())) {
      toast.error('Please enter a valid Google Maps link (e.g., https://maps.google.com/...)')
      return
    }
    
    const locationData = {
      name: newLocation.trim(),
      address: newLocationAddress.trim() || undefined,
      mapLink: newLocationMapLink.trim() || undefined
    }
    updateCompany({ locations: [...displayCompany.locations, locationData] })
    setNewLocation("")
    setNewLocationAddress("")
    setNewLocationMapLink("")
    
    toast.success('Location added successfully!')
  }

  const removeLocation = (index: number) => {
    updateCompany({ locations: displayCompany.locations.filter((_, i) => i !== index) })
  }

  // Benefits functionality removed as it's not in current database schema

  const handleSave = async () => {
    if (!user) return
    
    setIsSaving(true)
    try {
      // Use the current form data (company state or displayCompany fallback)
      const currentCompany = company || displayCompany
      const companyData = {
        userId: user.id,
        name: currentCompany.name || 'My Company',
        description: currentCompany.description,
        industry: currentCompany.industry,
        size: currentCompany.size,
        foundedYear: currentCompany.foundedYear,
        email: currentCompany.email,
        phone: currentCompany.phone,
        website: currentCompany.website,
        headquarters: currentCompany.headquarters,
        locations: currentCompany.locations || [],
        logo: currentCompany.logo,
        linkedinUrl: currentCompany.linkedinUrl,
        twitterUrl: currentCompany.twitterUrl,
        facebookUrl: currentCompany.facebookUrl,
        benefits: currentCompany.benefits || []
      }

      console.log('Saving company data:', companyData)
      
      const method = company ? 'PUT' : 'POST'
      console.log('Using HTTP method:', method)
      
      const response = await fetch('/api/companies/profile', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData)
      })
      
      console.log('API Response:', response.status, response.statusText)
      
      // Log response text for debugging
      const responseText = await response.text()
      console.log('Response text:', responseText)
      
      // Parse response
      const responseData = responseText ? JSON.parse(responseText) : {}

      if (response.ok) {
        console.log('Save successful, received data:', responseData)
        setCompany(responseData.company)
        toast.success(company ? 'Company profile updated successfully!' : 'Company profile created successfully!')
      } else {
        console.error('Save failed:', responseData)
        toast.error(responseData.error || `Failed to save company profile (${response.status})`)
      }
    } catch (error) {
      console.error('Error saving company profile:', error)
      toast.error('Failed to save company profile')
    } finally {
      setIsSaving(false)
    }
  }

  // Create default company object if none exists
  const displayCompany: Company = company || {
    id: '',
    name: 'My Company',
    description: null,
    logo: null,
    website: null,
    industry: null,
    size: null,
    headquarters: null,
    foundedYear: null,
    email: null,
    phone: null,
    locations: [],
    linkedinUrl: null,
    twitterUrl: null,
    facebookUrl: null,
    benefits: [],
    slug: '',
    createdAt: '',
    updatedAt: ''
  }

  // Update function to handle form changes
  const updateCompany = (updates: Partial<Company>) => {
    const updatedCompany = company ? { ...company, ...updates } : { ...displayCompany, ...updates }
    setCompany(updatedCompany)
  }

  // Validate Google Maps link
  const isValidGoogleMapsLink = (url: string) => {
    if (!url) return true // Empty is allowed
    const googleMapsPatterns = [
      /^https?:\/\/maps\.google\./,
      /^https?:\/\/www\.google\.[a-z]+\/maps/,
      /^https?:\/\/goo\.gl\/maps/,
      /^https?:\/\/maps\.app\.goo\.gl/
    ]
    return googleMapsPatterns.some(pattern => pattern.test(url))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading company profile...</p>
        </div>
      </div>
    )
  }



  return (
    <>
      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-4">
        <main className="px-4 lg:px-6">


                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">Company Profile</h1>
                      <p className="text-muted-foreground">
                        Manage your company information and settings
                      </p>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving}>
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="general" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="general">General Info</TabsTrigger>
                    <TabsTrigger value="locations">Locations</TabsTrigger>
                    <TabsTrigger value="culture">Culture & Benefits</TabsTrigger>
                    <TabsTrigger value="social">Social Links</TabsTrigger>
                  </TabsList>

                  {/* General Information Tab */}
                  <TabsContent value="general" className="space-y-6">
                    {/* Company Header */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Avatar className="h-20 w-20">
                              <AvatarImage src={company?.logo || displayCompany.logo || ''} />
                              <AvatarFallback className="text-2xl">
                                {displayCompany.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="absolute -bottom-2 -right-2 rounded-full p-1 h-8 w-8"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                            >
                              {isUploading ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                              ) : (
                                <Camera className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="flex-1">
                            <h2 className="text-2xl font-bold">{displayCompany.name}</h2>
                            <p className="text-muted-foreground">{displayCompany.industry || 'No industry specified'}</p>
                            <div className="flex items-center mt-2 space-x-4">
                              {displayCompany.size && (
                                <Badge variant="outline" className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {displayCompany.size}
                                </Badge>
                              )}
                              {displayCompany.foundedYear && (
                                <Badge variant="outline" className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Founded {displayCompany.foundedYear}
                                </Badge>
                              )}
                              {displayCompany.headquarters && (
                                <Badge variant="outline" className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {displayCompany.headquarters}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Basic Information</CardTitle>
                          <CardDescription>
                            Update your company's basic details
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Company Name</label>
                            <Input
                              value={displayCompany.name}
                              onChange={(e) => updateCompany({ name: e.target.value })}
                              placeholder="Enter company name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Industry</label>
                            <Select 
                              value={displayCompany.industry || ''} 
                              onValueChange={(value) => updateCompany({ industry: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Information Technology">Information Technology</SelectItem>
                                <SelectItem value="Healthcare">Healthcare</SelectItem>
                                <SelectItem value="Finance">Finance</SelectItem>
                                <SelectItem value="Education">Education</SelectItem>
                                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                <SelectItem value="Retail">Retail</SelectItem>
                                <SelectItem value="Consulting">Consulting</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Company Size</label>
                            <Select 
                              value={displayCompany.size || ''} 
                              onValueChange={(value) => updateCompany({ size: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="STARTUP">Startup (1-10 employees)</SelectItem>
                                <SelectItem value="SMALL">Small (11-50 employees)</SelectItem>
                                <SelectItem value="MEDIUM">Medium (51-200 employees)</SelectItem>
                                <SelectItem value="LARGE">Large (201-1000 employees)</SelectItem>
                                <SelectItem value="ENTERPRISE">Enterprise (1000+ employees)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Founded Year</label>
                            <Input
                              type="number"
                              value={displayCompany.foundedYear || ''}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value.length <= 4) {
                                  updateCompany({ foundedYear: parseInt(value) || null })
                                }
                              }}
                              placeholder="e.g., 2015"
                              maxLength={4}
                              min="1800"
                              max="2100"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Contact Information</CardTitle>
                          <CardDescription>
                            How candidates can reach your company
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Website</label>
                            <div className="flex">
                              <Input
                                value={displayCompany.website || ''}
                                onChange={(e) => updateCompany({ website: e.target.value })}
                                placeholder="https://yourcompany.com"
                                className="flex-1"
                              />
                              {displayCompany.website && (
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  className="ml-2"
                                  onClick={() => window.open(displayCompany.website!, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <Input
                              type="email"
                              value={displayCompany.email || ''}
                              onChange={(e) => updateCompany({ email: e.target.value })}
                              placeholder="contact@company.com"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Phone</label>
                            <Input
                              value={displayCompany.phone || '+91 '}
                              onChange={(e) => {
                                const value = e.target.value
                                // Only allow +91 prefix followed by digits and spaces
                                if (value.startsWith('+91 ')) {
                                  const numberPart = value.substring(4) // Remove "+91 "
                                  // Only keep digits and spaces, remove other characters
                                  const cleanNumber = numberPart.replace(/[^0-9\s]/g, '')
                                  // Limit to 10 digits for Indian phone numbers
                                  const limitedNumber = cleanNumber.replace(/\s/g, '').substring(0, 10)
                                  // Format with spaces for readability
                                  const formattedNumber = limitedNumber.replace(/(\d{5})(\d{5})/, '$1 $2')
                                  updateCompany({ phone: '+91 ' + formattedNumber })
                                } else {
                                  // If someone tries to remove +91, restore it
                                  updateCompany({ phone: '+91 ' })
                                }
                              }}
                              placeholder="+91 XXXXX XXXXX"
                              maxLength={15} // +91 + space + 10 digits + space
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Company Description */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Company Description</CardTitle>
                        <CardDescription>
                          Tell candidates about your company and mission
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={displayCompany.description || ''}
                          onChange={(e) => updateCompany({ description: e.target.value })}
                          placeholder="Describe your company, mission, values, and what makes you unique..."
                          className="min-h-32"
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Locations Tab */}
                  <TabsContent value="locations" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Office Locations</CardTitle>
                        <CardDescription>
                          Manage your company's office locations and remote work options
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">Location Name</label>
                              <Input
                                value={newLocation}
                                onChange={(e) => setNewLocation(e.target.value)}
                                placeholder="e.g., Mumbai Office, Bangalore Branch"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Complete Address</label>
                              <Input
                                value={newLocationAddress}
                                onChange={(e) => setNewLocationAddress(e.target.value)}
                                placeholder="e.g., 123 Business Park, Sector 5, Mumbai, Maharashtra 400001"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Google Maps Link (Optional)</label>
                              <Input
                                value={newLocationMapLink}
                                onChange={(e) => {
                                  const value = e.target.value
                                  setNewLocationMapLink(value)
                                  
                                  // Show validation error on blur or when user stops typing
                                  if (value && !isValidGoogleMapsLink(value)) {
                                    // Don't show error immediately, wait for blur or complete URL
                                  }
                                }}
                                onBlur={(e) => {
                                  const value = e.target.value.trim()
                                  if (value && !isValidGoogleMapsLink(value)) {
                                    toast.error('Please enter a valid Google Maps link')
                                  }
                                }}
                                placeholder="https://maps.google.com/... or https://goo.gl/maps/..."
                                className={newLocationMapLink && !isValidGoogleMapsLink(newLocationMapLink) ? 'border-red-500' : ''}
                              />
                            </div>
                            <Button onClick={addLocation} disabled={!newLocation.trim()}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Location
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {displayCompany.locations.map((location, index) => {
                            // Handle both string and object formats for backward compatibility
                            const locationData = typeof location === 'string' 
                              ? { name: location, address: undefined, mapLink: undefined }
                              : location
                              
                            return (
                              <div key={index} className="p-4 border rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center flex-1">
                                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1">
                                      <h4 className="font-medium">{locationData.name}</h4>
                                      {locationData.address && (
                                        <p className="text-sm text-muted-foreground mt-1">{locationData.address}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {locationData.mapLink && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(locationData.mapLink, '_blank')}
                                        className="text-blue-600 hover:text-blue-700"
                                      >
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        Map
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeLocation(index)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Culture & Benefits Tab */}
                  <TabsContent value="culture" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Benefits and Perks</CardTitle>
                        <CardDescription>
                          Add the benefits and perks you offer to employees
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            value={newBenefit}
                            onChange={(e) => setNewBenefit(e.target.value)}
                            placeholder="Add new benefit (e.g., Health Insurance, Flexible Hours)"
                            onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                          />
                          <Button onClick={addBenefit} disabled={!newBenefit.trim()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </div>

                        {displayCompany.benefits.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {displayCompany.benefits.map((benefit, index) => (
                              <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                <span className="text-sm">{benefit}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeBenefit(index)}
                                  className="text-red-600 hover:text-red-700 p-1"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {displayCompany.benefits.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No benefits added yet. Add your first benefit above.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Social Links Tab */}
                  <TabsContent value="social" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Social Media Links</CardTitle>
                        <CardDescription>
                          Connect your company's social media profiles
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">LinkedIn</label>
                          <Input
                            value={displayCompany.linkedinUrl || ''}
                            onChange={(e) => handleSocialLinkChange('linkedinUrl', e.target.value)}
                            placeholder="https://linkedin.com/company/yourcompany"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Twitter</label>
                          <Input
                            value={displayCompany.twitterUrl || ''}
                            onChange={(e) => handleSocialLinkChange('twitterUrl', e.target.value)}
                            placeholder="https://twitter.com/yourcompany"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Facebook</label>
                          <Input
                            value={displayCompany.facebookUrl || ''}
                            onChange={(e) => handleSocialLinkChange('facebookUrl', e.target.value)}
                            placeholder="https://facebook.com/yourcompany"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </main>
        </div>
    </>
  )
}