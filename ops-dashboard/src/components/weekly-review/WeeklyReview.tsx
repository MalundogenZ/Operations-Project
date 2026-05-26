'use client'

import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Brain, Heart, Dumbbell, BookOpen } from 'lucide-react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, parseISO } from 'date-fns'
import type { DayResult, TrackerEntry, WeeklyReview as WR } from '@/lib/types'

interface DayData {
  date: string
  result: 'W' | 'L' | null
  tracker: TrackerEntry | null
}

interface Props {
  initialWeekStart: string
  initialDays: DayData[]
  initialReview: WR | null
}

const winCategories = [
  { key: 'mental' as const, label: 'Mental', icon: Brain, color: 'text-purple-400' },
  { key: 'spiritual' as const, label: 'Spiritual', icon: Heart, color: 'text-pink-400' },
  { key: 'physical' as const, label: 'Physical', icon: Dumbbell, color: 'text-green-400' },
  { key: 'accountability' as const, label: 'Accountable', icon: BookOpen, color: 'text-blue-400' },
]

export default function WeeklyReview({ initialWeekStart, initialDays, initialReview }: Props) {
  const [weekStart, setWeekStart] = useState(initialWeekStart)
  const [days, setDays] = useState<DayData[]>(initialDays)
  const [, setReview] = useState<WR | null>(initialReview)
  const [form, setForm] = useState({
    went_well: initialReview?.went_well ?? '',
    improve: initialReview?.improve ?? '',
    next_focus: initialReview?.next_focus ?? '',
  })
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function loadWeek(ws: string) {
    const res = await fetch(`/api/weekly-review/${ws}`)
    const r = await res.json()
    setReview(r)
    setForm({ went_well: r?.went_well ?? '', improve: r?.improve ?? '', next_focus: r?.next_focus ?? '' })
    // Fetch day data for the week
    const start = parseISO(ws)
    const end = endOfWeek(start, { weekStartsOn: 1 })
    const dates = eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'))
    const dayRes = await fetch(`/api/day-results?year=${ws.slice(0, 4)}&month=${ws.slice(5, 7)}`)
    const monthResults: DayResult[] = await dayRes.json()
    const resultMap = new Map(monthResults.map(r => [r.date, r.result]))
    setDays(dates.map(date => ({ date, result: resultMap.get(date) ?? null, tracker: null })))
  }

  async function navigate(direction: 'prev' | 'next') {
    const current = parseISO(weekStart)
    const next = direction === 'prev' ? subWeeks(current, 1) : addWeeks(current, 1)
    const ns = format(startOfWeek(next, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    setWeekStart(ns)
    await loadWeek(ns)
  }

  function updateField(field: keyof typeof form, value: string) {
    const next = { ...form, [field]: value }
    setForm(next)
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(async () => {
      const res = await fetch(`/api/weekly-review/${weekStart}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
      setReview(await res.json())
    }, 700)
  }

  const wins = days.filter(d => d.result === 'W').length
  const losses = days.filter(d => d.result === 'L').length
  const weekLabel = `${format(parseISO(weekStart), 'MMM d')} – ${format(endOfWeek(parseISO(weekStart), { weekStartsOn: 1 }), 'MMM d, yyyy')}`

  return (
    <div className="space-y-6">
      {/* Week nav */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#f0f0f0]">{weekLabel}</h2>
          <p className="text-xs text-[#4b5563] mt-0.5">{wins}W · {losses}L this week</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('prev')} className="p-1.5 rounded-md border border-[#1e1e2e] text-[#6b7280] hover:text-[#f0f0f0] hover:bg-[#111118] transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => navigate('next')} className="p-1.5 rounded-md border border-[#1e1e2e] text-[#6b7280] hover:text-[#f0f0f0] hover:bg-[#111118] transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Day cards */}
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const d = parseISO(day.date)
          const isResult = day.result !== null
          return (
            <div
              key={day.date}
              className={`bg-[#111118] border rounded-xl p-3 text-center transition-colors ${
                isResult
                  ? day.result === 'W'
                    ? 'border-green-500/30'
                    : 'border-red-500/30'
                  : 'border-[#1e1e2e]'
              }`}
            >
              <p className="text-xs text-[#4b5563] mb-1">{format(d, 'EEE')}</p>
              <p className="text-sm font-semibold text-[#f0f0f0] mb-2">{format(d, 'd')}</p>
              {isResult ? (
                <span className={`text-sm font-bold ${day.result === 'W' ? 'text-green-400' : 'text-red-400'}`}>
                  {day.result}
                </span>
              ) : (
                <span className="text-sm text-[#2a2a3a]">—</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Win category totals */}
      <div className="grid grid-cols-4 gap-3">
        {winCategories.map(({ key, label, icon: Icon, color }) => {
          const count = days.filter(d => d.result === 'W').length
          return (
            <div key={key} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 text-center">
              <Icon size={16} className={`${color} mx-auto mb-2`} />
              <p className="text-xs text-[#4b5563]">{label}</p>
              <p className={`text-lg font-bold mt-1 ${color}`}>{count}/7</p>
            </div>
          )
        })}
      </div>

      {/* Reflection */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { field: 'went_well' as const, label: 'What went well?', placeholder: 'Wins, breakthroughs, proud moments...' },
          { field: 'improve' as const, label: 'What to improve?', placeholder: 'Habits to fix, mistakes to avoid...' },
          { field: 'next_focus' as const, label: 'Focus for next week', placeholder: 'Top priority, theme, intention...' },
        ].map(({ field, label, placeholder }) => (
          <div key={field} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-3">{label}</p>
            <textarea
              value={form[field]}
              onChange={e => updateField(field, e.target.value)}
              placeholder={placeholder}
              rows={5}
              className="w-full bg-transparent text-sm text-[#d1d5db] placeholder:text-[#2a2a3a] outline-none resize-none"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
