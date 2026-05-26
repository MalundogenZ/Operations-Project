'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react'
import { format, endOfMonth, eachDayOfInterval, getDay, isToday, parseISO } from 'date-fns'
import type { CalendarEntry, DayResult } from '@/lib/types'

interface Props {
  initialEntries: CalendarEntry[]
  initialResults: DayResult[]
  initialYear: number
  initialMonth: number
}

export default function CalendarView({ initialEntries, initialResults, initialYear, initialMonth }: Props) {
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [entries, setEntries] = useState<CalendarEntry[]>(initialEntries)
  const [results, setResults] = useState<DayResult[]>(initialResults)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [addingEntry, setAddingEntry] = useState(false)
  const [newName, setNewName] = useState('')

  const firstDay = new Date(year, month - 1, 1)
  const lastDay = endOfMonth(firstDay)
  const days = eachDayOfInterval({ start: firstDay, end: lastDay })
  const startPad = getDay(firstDay)

  const resultMap = new Map(results.map(r => [r.date, r.result]))

  async function loadMonth(y: number, m: number) {
    const [entriesRes, resultsRes] = await Promise.all([
      fetch(`/api/calendar?year=${y}&month=${m}`),
      fetch(`/api/day-results?year=${y}&month=${m}`),
    ])
    setEntries(await entriesRes.json())
    setResults(await resultsRes.json())
  }

  async function prev() {
    const ny = month === 1 ? year - 1 : year
    const nm = month === 1 ? 12 : month - 1
    setYear(ny); setMonth(nm)
    await loadMonth(ny, nm)
  }

  async function next() {
    const ny = month === 12 ? year + 1 : year
    const nm = month === 12 ? 1 : month + 1
    setYear(ny); setMonth(nm)
    await loadMonth(ny, nm)
  }

  async function addEntry() {
    if (!newName.trim() || !selectedDate) return
    const res = await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), date: selectedDate, tags: '[]' }),
    })
    const entry = await res.json()
    setEntries(prev => [...prev, entry])
    setNewName('')
    setAddingEntry(false)
  }

  async function removeEntry(id: number) {
    await fetch(`/api/calendar/${id}`, { method: 'DELETE' })
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const selectedEntries = selectedDate ? entries.filter(e => e.date === selectedDate) : []

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-[#f0f0f0]">
            {format(firstDay, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={prev} className="p-1.5 rounded-md border border-[#1e1e2e] text-[#6b7280] hover:text-[#f0f0f0] hover:bg-[#111118] transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button onClick={next} className="p-1.5 rounded-md border border-[#1e1e2e] text-[#6b7280] hover:text-[#f0f0f0] hover:bg-[#111118] transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs text-[#374151] py-1 font-medium">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const ds = format(day, 'yyyy-MM-dd')
            const dayEntries = entries.filter(e => e.date === ds)
            const selected = selectedDate === ds
            const today = isToday(day)
            const result = resultMap.get(ds)
            return (
              <button
                key={ds}
                onClick={() => setSelectedDate(selected ? null : ds)}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors relative gap-0.5
                  ${selected ? 'bg-blue-600 text-white' : today ? 'bg-[#1e1e2e] text-blue-400' : 'hover:bg-[#111118] text-[#9ca3af]'}
                `}
              >
                <span className="font-medium text-xs">{format(day, 'd')}</span>
                {result && (
                  <span className={`text-[10px] font-bold leading-none ${
                    selected ? 'text-white/80' : result === 'W' ? 'text-green-400' : 'text-red-400'
                  }`}>{result}</span>
                )}
                {!result && dayEntries.length > 0 && (
                  <div className="flex gap-0.5">
                    {dayEntries.slice(0, 2).map((_, i) => (
                      <div key={i} className={`w-1 h-1 rounded-full ${selected ? 'bg-white/70' : 'bg-blue-500'}`} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-green-400">W</span>
            <span className="text-xs text-[#4b5563]">All wins + tasks done</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-red-400">L</span>
            <span className="text-xs text-[#4b5563]">Incomplete</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-xs text-[#4b5563]">Journal entries</span>
          </div>
        </div>
      </div>

      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
        {selectedDate ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#f0f0f0]">
                  {format(parseISO(selectedDate), 'MMMM d')}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-[#4b5563]">{format(parseISO(selectedDate), 'EEEE')}</p>
                  {resultMap.get(selectedDate) && (
                    <span className={`text-xs font-bold ${resultMap.get(selectedDate) === 'W' ? 'text-green-400' : 'text-red-400'}`}>
                      {resultMap.get(selectedDate)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setAddingEntry(true)} className="text-blue-400 hover:text-blue-300 transition-colors">
                  <Plus size={15} />
                </button>
                <button onClick={() => setSelectedDate(null)} className="text-[#374151] hover:text-[#6b7280]">
                  <X size={14} />
                </button>
              </div>
            </div>

            {addingEntry && (
              <div className="mb-4">
                <input
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addEntry(); if (e.key === 'Escape') setAddingEntry(false) }}
                  placeholder="Add entry..."
                  className="w-full bg-[#0a0a0f] border border-blue-500/30 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] placeholder:text-[#374151] outline-none"
                />
              </div>
            )}

            <div className="space-y-2">
              {selectedEntries.map(entry => (
                <div key={entry.id} className="group flex items-start gap-2.5 p-2.5 bg-[#0a0a0f] rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-[#d1d5db] flex-1">{entry.name}</p>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[#374151] hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {selectedEntries.length === 0 && !addingEntry && (
                <p className="text-xs text-[#2a2a3a] text-center py-4">Nothing here yet</p>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="w-10 h-10 rounded-full bg-[#1e1e2e] flex items-center justify-center mb-3">
              <Plus size={16} className="text-[#374151]" />
            </div>
            <p className="text-sm text-[#4b5563]">Select a day</p>
            <p className="text-xs text-[#2a2a3a] mt-1">to view or add entries</p>
          </div>
        )}
      </div>
    </div>
  )
}
