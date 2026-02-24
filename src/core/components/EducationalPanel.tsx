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
    <div className="rounded-lg border border-slate-300 bg-white shadow-sm">
      <div className="grid grid-cols-3 divide-x divide-slate-200">
        {SECTIONS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="px-3 py-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon
                className="h-3.5 w-3.5"
                style={{ color: accentColor }}
              />
              <span
                className="text-xs font-bold"
                style={{ color: accentColor }}
              >
                {label}
              </span>
            </div>
            <p className="text-xs leading-snug text-slate-700">
              {content[key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
