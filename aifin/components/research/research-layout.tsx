"use client"

import React from "react"

interface ResearchLayoutSection {
  id: string
  component: React.ReactNode
}

/**
 * Legacy ResearchLayout for sections array
 */
export function ResearchLayout({
  sections,
  children,
}: {
  sections?: ResearchLayoutSection[]
  children?: React.ReactNode
}) {
  // If children provided, use simple wrapper mode
  if (children) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-4xl px-8 py-12">
          {children}
        </div>
      </div>
    )
  }

  // Otherwise use sections mode
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-8 py-12 space-y-6">
        {sections?.map((section) => (
          <div
            key={section.id}
            className="animate-in fade-in duration-500"
          >
            {section.component}
          </div>
        ))}
      </div>
    </div>
  )
}
