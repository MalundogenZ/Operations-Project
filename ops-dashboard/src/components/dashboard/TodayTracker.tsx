'use client'

import { useState } from 'react'
import { Brain, Heart, Dumbbell, BookOpen, CheckCircle2, Circle } from 'lucide-react'

interface WinState {
  mental: boolean
  spiritual: boolean
  physical: boolean
  accountability: boolean
}

interface Props {
  date: string
  initial: WinState
  onUpdate?: (wins: WinState, record: { wins: number; losses: number; streak: number; streakType: 'W' | 'L' }) => void
}

const categories = [
  { key: 'mental' as const, label: 'Mental', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', activeBg: 'bg-purple-500/20 border-purple-500/40' },
  { key: 'spiritual' as const, label: 'Spiritual', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20', activeBg: 'bg-pink-500/20 border-pink-500/40' },
  { key: 'physical' as const, label: 'Physical', icon: Dumbbell, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', activeBg: 'bg-green-500/20 border-green-500/40' },
  { key: 'accountability' as const, label: 'Accountable', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', activeBg: 'bg-blue-500/20 border-blue-500/40' },
]

export default function TodayTracker({ date, initial, onUpdate }: Props) {
  const [wins, setWins] = useState<WinState>(initial)
  const [saving, setSaving] = useState(false)

  const allWon = Object.values(wins).every(Boolean)
  const wonCount = Object.values(wins).filter(Boolean).length

  async function toggle(key: keyof WinState) {
    const next = { ...wins, [key]: !wins[key] }
    setWins(next)
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
        }),
      })
      const data = await res.json()
      onUpdate?.(next, data.record)
    } finally {
      setSaving(false)
    }
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

      <div className="grid grid-cols-2 gap-2">
        {categories.map(({ key, label, icon: Icon, color, bg, activeBg }) => {
          const active = wins[key]
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${active ? activeBg : bg} hover:scale-[1.02] active:scale-[0.98]`}
            >
              <Icon size={16} className={active ? color : 'text-[#374151]'} />
              <span className={`text-sm font-medium ${active ? color : 'text-[#4b5563]'}`}>{label}</span>
              <div className="ml-auto">
                {active
                  ? <CheckCircle2 size={14} className={color} />
                  : <Circle size={14} className="text-[#374151]" />
                }
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
