'use client'

import { useState, useRef } from 'react'
import { Brain, Heart, Dumbbell, BookOpen, CheckCircle2, Circle } from 'lucide-react'
import type { TrackerEntry } from '@/lib/types'

type WinKey = 'mental' | 'spiritual' | 'physical' | 'accountability'

interface WinState {
  mental: boolean
  spiritual: boolean
  physical: boolean
  accountability: boolean
  mental_note: string
  spiritual_note: string
  physical_note: string
  accountability_note: string
}

interface Props {
  date: string
  initial: WinState
  onUpdate?: (wins: WinState, record: { wins: number; losses: number; streak: number; streakType: 'W' | 'L' }) => void
}

const categories: { key: WinKey; label: string; icon: typeof Brain; color: string; bg: string; activeBg: string; placeholder: string }[] = [
  { key: 'mental', label: 'Mental', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', activeBg: 'bg-purple-500/20 border-purple-500/40', placeholder: 'What was your mental win today?' },
  { key: 'spiritual', label: 'Spiritual', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20', activeBg: 'bg-pink-500/20 border-pink-500/40', placeholder: 'What was your spiritual win today?' },
  { key: 'physical', label: 'Physical', icon: Dumbbell, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', activeBg: 'bg-green-500/20 border-green-500/40', placeholder: 'What was your physical win today?' },
  { key: 'accountability', label: 'Accountable', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', activeBg: 'bg-blue-500/20 border-blue-500/40', placeholder: 'What was your accountability win today?' },
]

export default function TodayTracker({ date, initial, onUpdate }: Props) {
  const [wins, setWins] = useState<WinState>(initial)
  const [saving, setSaving] = useState(false)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const allWon = wins.mental && wins.spiritual && wins.physical && wins.accountability
  const wonCount = [wins.mental, wins.spiritual, wins.physical, wins.accountability].filter(Boolean).length

  async function save(next: WinState) {
    setSaving(true)
    try {
      const res = await fetch(`/api/tracker/${date}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mental: next.mental ? 1 : 0,
          spiritual: next.spiritual ? 1 : 0,
          physical: next.physical ? 1 : 0,
          accountability: next.accountability ? 1 : 0,
          mental_note: next.mental_note,
          spiritual_note: next.spiritual_note,
          physical_note: next.physical_note,
          accountability_note: next.accountability_note,
        }),
      })
      const data = await res.json()
      onUpdate?.(next, data.record)
    } finally {
      setSaving(false)
    }
  }

  function toggle(key: WinKey) {
    const next = { ...wins, [key]: !wins[key] }
    setWins(next)
    save(next)
  }

  function updateNote(key: `${WinKey}_note`, value: string) {
    const next = { ...wins, [key]: value }
    setWins(next)
    // Debounce save
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => save(next), 600)
  }

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#f0f0f0]">Today&apos;s Wins</h3>
          <p className="text-xs text-[#4b5563] mt-0.5">{wonCount}/4 categories</p>
        </div>
        {allWon && (
          <span className="text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-2.5 py-1">
            Day Won ✓
          </span>
        )}
        {saving && <span className="text-xs text-[#4b5563]">Saving...</span>}
      </div>

      <div className="space-y-2">
        {categories.map(({ key, label, icon: Icon, color, bg, activeBg, placeholder }) => {
          const active = wins[key]
          const noteKey = `${key}_note` as `${WinKey}_note`
          const note = wins[noteKey]
          return (
            <div key={key} className={`rounded-lg border transition-all duration-200 ${active ? activeBg : bg}`}>
              <button
                onClick={() => toggle(key)}
                className="flex items-center gap-3 p-3 w-full text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
              >
                <Icon size={16} className={active ? color : 'text-[#374151]'} />
                <span className={`text-sm font-medium flex-1 ${active ? color : 'text-[#4b5563]'}`}>{label}</span>
                <div className="ml-auto">
                  {active
                    ? <CheckCircle2 size={14} className={color} />
                    : <Circle size={14} className="text-[#374151]" />
                  }
                </div>
              </button>
              {active && (
                <div className="px-3 pb-3">
                  <input
                    value={note}
                    onChange={e => updateNote(noteKey, e.target.value)}
                    placeholder={placeholder}
                    className={`w-full text-xs bg-transparent placeholder:text-[#374151] outline-none border-b pb-0.5 transition-colors ${color} border-current/20 focus:border-current/50`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function trackerToWinState(entry: TrackerEntry | null): WinState {
  return {
    mental: !!(entry?.mental),
    spiritual: !!(entry?.spiritual),
    physical: !!(entry?.physical),
    accountability: !!(entry?.accountability),
    mental_note: entry?.mental_note ?? '',
    spiritual_note: entry?.spiritual_note ?? '',
    physical_note: entry?.physical_note ?? '',
    accountability_note: entry?.accountability_note ?? '',
  }
}
