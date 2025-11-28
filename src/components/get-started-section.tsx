"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Briefcase, Search, TrendingUp, LucideIcon } from "lucide-react"

interface Feature {
  icon: React.ReactElement<{ className: string }>
  title: string
  description: string
}

interface Stat {
  value: string
  label: string
}

const features: Feature[] = [
  {
    icon: <Search className="w-12 h-12 text-blue-600" />,
    title: "Smart Job Search",
    description: "Find jobs that match your skills and preferences with our AI-powered recommendation engine."
  },
  {
    icon: <Briefcase className="w-12 h-12 text-blue-600" />,
    title: "Career Growth",
    description: "Access resources and opportunities to advance your career and develop new skills."
  },
  {
    icon: <Users className="w-12 h-12 text-blue-600" />,
    title: "Connect with Companies",
    description: "Build relationships with top employers and get noticed by hiring managers."
  },
  {
    icon: <TrendingUp className="w-12 h-12 text-blue-600" />,
    title: "Market Insights",
    description: "Stay updated with the latest job market trends and salary information."
  }
]

const stats: Stat[] = [
  { value: "10,000+", label: "Active Jobs" },
  { value: "5,000+", label: "Companies" },
  { value: "50,000+", label: "Job Seekers" }
]

export function GetStartedSection(): React.JSX.Element {
  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-light text-gray-900 mb-6 tracking-tight">
            Why Choose Our Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Built for the modern job market with intelligent features that connect the right people with the right opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-gray-50/50 rounded-2xl p-8 h-full transition-all duration-300 hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-200/50">
                <div className="flex justify-center mb-8">
                  <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {React.cloneElement(feature.icon, { className: "w-8 h-8 text-white" })}
                  </div>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-center text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gray-50/50 rounded-3xl p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="group">
                <div className="text-6xl font-light text-gray-900 mb-4 group-hover:scale-110 transition-transform duration-300">{stat.value}</div>
                <div className="text-gray-600 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}