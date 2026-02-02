// EducationalPanel - WHY/HOW/WHAT Accordion
import { Target, Cog, Lightbulb } from 'lucide-react'
import type { EducationalContent } from '../types'

interface EducationalPanelProps {
  content: EducationalContent
  accentColor: string
}

const SECTIONS = [
  { key: 'what' as const, label: 'WHAT', icon: Target, description: 'What is this?' },
  { key: 'how' as const, label: 'HOW', icon: Cog, description: 'How does it work?' },
  { key: 'why' as const, label: 'WHY', icon: Lightbulb, description: 'Why does it matter?' },
]

export function EducationalPanel({ content, accentColor }: EducationalPanelProps) {
  // Show ALL sections expanded - no clicking needed!
  return (
    <div className="rounded-xl border-2 border-slate-300 bg-white shadow-sm">
      <div className="grid grid-cols-3 divide-x divide-slate-200">
        {SECTIONS.map(({ key, label, icon: Icon, description }) => (
          <div key={key} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon
                className="h-4 w-4"
                style={{ color: accentColor }}
              />
              <span
                className="text-sm font-bold"
                style={{ color: accentColor }}
              >
                {label}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-700">
              {content[key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
