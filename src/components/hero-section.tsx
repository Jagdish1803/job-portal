"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin } from "lucide-react"

interface SearchFormData {
  searchTerm: string
  location: string
  experience: string
}

interface ExperienceOption {
  value: string
  label: string
}

const experienceOptions: ExperienceOption[] = [
  { value: "0-1", label: "0-1 years" },
  { value: "1-3", label: "1-3 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10+", label: "10+ years" }
]

const popularSearches: string[] = ["React", "Data Analyst", "Product Manager"]

export function HeroSection(): React.JSX.Element {
  const [formData, setFormData] = useState<SearchFormData>({
    searchTerm: "",
    location: "",
    experience: ""
  })

  const handleSearchTermChange = (value: string): void => {
    setFormData(prev => ({ ...prev, searchTerm: value }))
  }

  const handleLocationChange = (value: string): void => {
    setFormData(prev => ({ ...prev, location: value }))
  }

  const handleExperienceChange = (value: string): void => {
    setFormData(prev => ({ ...prev, experience: value }))
  }

  const handlePopularSearchClick = (term: string): void => {
    setFormData(prev => ({ ...prev, searchTerm: term }))
  }

  const handleSearch = (): void => {
    console.log('Search submitted:', formData)
    // Add search logic here
  }

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto max-w-6xl text-center">
        {/* Main Heading */}
        <div className="mb-16">
          <h1 className="text-6xl md:text-7xl font-light text-gray-900 mb-8 leading-tight tracking-tight">
            Find Your Dream Job.
            <br />
            <span className="font-medium text-gray-800">Hire the Right Talent.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We connect ambitious professionals with forward-thinking companies through intelligent matching and personalized recommendations.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 mb-12 max-w-5xl mx-auto">
          {/* Top Row - 3 Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Skills/Designations Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Skills, Job Title, Company"
                value={formData.searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchTermChange(e.target.value)}
                className="pl-12 h-14 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 text-gray-900 placeholder:text-gray-500 font-medium transition-all bg-white"
              />
            </div>

            {/* Experience Select */}
            <div>
              <Select value={formData.experience} onValueChange={handleExperienceChange}>
                <SelectTrigger className="w-full h-14 border-2 py-6 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 text-gray-900 font-medium bg-white">
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl bg-white">
                  {experienceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="rounded-lg focus:bg-gray-100">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Input */}
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Location or Remote"
                value={formData.location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLocationChange(e.target.value)}
                className="pl-12 h-14 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 text-gray-900 placeholder:text-gray-500 font-medium transition-all bg-white"
              />
            </div>
          </div>

          {/* Bottom Row - Search Button */}
          <div className="mb-6">
            <Button 
              className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={handleSearch}
            >
              Search Opportunities
            </Button>
          </div>

          {/* Popular Searches */}
          <div className="text-center">
            <div className="flex items-center justify-center flex-wrap gap-3">
              <span className="text-sm text-gray-600 font-medium">Popular:</span>
              {popularSearches.map((term) => (
                <Badge
                  key={term}
                  variant="secondary"
                  className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-all duration-200 px-4 py-2 rounded-full text-sm font-medium border border-gray-200"
                  onClick={() => handlePopularSearchClick(term)}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}