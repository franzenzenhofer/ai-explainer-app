// Overlay listing known attention head types grouped by category
import { motion } from 'motion/react'
import { AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import { KNOWN_HEAD_TYPES } from './headTypes'

interface HeadTypesOverlayProps {
  open: boolean
  onClose: () => void
}

export function HeadTypesOverlay({ open, onClose }: HeadTypesOverlayProps) {
  const categories = Array.from(new Set(KNOWN_HEAD_TYPES.map((h) => h.category)))

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-indigo-200 bg-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-indigo-100 bg-indigo-50 px-4 py-3">
              <div>
                <h3 className="text-sm font-bold text-indigo-900">Known Attention Head Types</h3>
                <p className="text-[11px] text-indigo-700">
                  {KNOWN_HEAD_TYPES.length} types discovered through mechanistic interpretability research
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-indigo-500 hover:bg-indigo-100 hover:text-indigo-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 py-2">
              {categories.map((category) => (
                <div key={category} className="mb-3 last:mb-0">
                  <h4 className="sticky top-12 z-[5] -mx-4 mb-1.5 border-b border-indigo-100 bg-white/95 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600 backdrop-blur-sm">
                    {category}
                  </h4>
                  <div className="divide-y divide-indigo-50">
                    {KNOWN_HEAD_TYPES.filter((h) => h.category === category).map((head) => (
                      <div key={head.name} className="py-2">
                        <h5 className="text-xs font-bold text-indigo-900">{head.name}</h5>
                        <p className="mt-0.5 text-[11px] leading-snug text-slate-700">{head.what}</p>
                        <p className="mt-1 rounded border border-indigo-100 bg-indigo-50/50 px-2 py-1 text-[11px] italic text-indigo-800">
                          {head.example}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 border-t border-indigo-100 bg-slate-50 px-4 py-2.5">
              <p className="text-[10px] text-slate-500">
                Real models contain hundreds of heads, many with overlapping or as-yet-unnamed behaviors.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
