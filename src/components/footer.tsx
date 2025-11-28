"use client"

import React from "react"
import { Building2, Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

interface FooterLink {
  href: string
  label: string
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

interface SocialLink {
  icon: React.ReactElement<{ className: string }>
  href: string
  label: string
}

const jobSeekerLinks: FooterLink[] = [
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/career-advice", label: "Career Advice" },
  { href: "/resume-builder", label: "Resume Builder" },
  { href: "/salary-guide", label: "Salary Guide" }
]

const employerLinks: FooterLink[] = [
  { href: "/post-job", label: "Post Jobs" },
  { href: "/search-resumes", label: "Search Resumes" },
  { href: "/employer-branding", label: "Employer Branding" },
  { href: "/pricing", label: "Pricing" }
]

const companyLinks: FooterLink[] = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" }
]

const socialLinks: SocialLink[] = [
  {
    icon: <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />,
    href: "https://facebook.com",
    label: "Facebook"
  },
  {
    icon: <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />,
    href: "https://twitter.com",
    label: "Twitter"
  },
  {
    icon: <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />,
    href: "https://linkedin.com",
    label: "LinkedIn"
  },
  {
    icon: <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />,
    href: "https://instagram.com",
    label: "Instagram"
  }
]

const footerSections: FooterSection[] = [
  { title: "For Job Seekers", links: jobSeekerLinks },
  { title: "For Employers", links: employerLinks },
  { title: "Company", links: companyLinks }
]

export function Footer(): React.JSX.Element {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6 col-span-1 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-gray-900" />
              </div>
              <span className="text-2xl font-light tracking-tight">
                Talent HR Corner
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Connecting ambitious professionals with forward-thinking companies using smart recommendations.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="inline-block"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2 text-gray-400">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} Talent Corner JobPortal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}