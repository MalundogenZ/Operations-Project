'use client'

import { useState, useRef } from 'react'
import { Plus, Trash2, CheckCircle2, Circle, ChevronLeft, ChevronRight } from 'lucide-react'
import type { QuarterlyPlan, QuarterlyItem } from '@/lib/types'

interface QuarterData {
  plan: QuarterlyPlan | null
  items: QuarterlyItem[]
}

interface Props {
  initialYear: number
  initialData: QuarterData[]
}

const quarters = [
  { q: 1, label: 'Q1', months: 'Jan – Mar', color: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-500' },
  { q: 2, label: 'Q2', months: 'Apr – Jun', color: 'text-green-400', border: 'border-green-500/20', dot: 'bg-green-500' },
  { q: 3, label: 'Q3', months: 'Jul – Sep', color: 'text-yellow-400', border: 'border-yellow-500/20', dot: 'bg-yellow-500' },
  { q: 4, label: 'Q4', months: 'Oct – Dec', color: 'text-orange-400', border: 'border-orange-500/20', dot: 'bg-orange-500' },
]

export default function QuarterlyBoard({ initialYear, initialData }: Props) {
  const [year, setYear] = useState(initialYear)
  const [data, setData] = useState<QuarterData[]>(initialData)
  const saveTimeouts = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const [addingIn, setAddingIn] = useState<number | null>(null)
  const [newItem, setNewItem] = useState('')

  async function loadYear(y: number) {
    const results = await Promise.all(
      [1, 2, 3, 4].map(q => fetch(`/api/quarterly/${y}/${q}`).then(r => r.json()))
    )
    setData(results)
  }

  async function prevYear() { const y = year - 1; setYear(y); await loadYear(y) }
  async function nextYear() { const y = year + 1; setYear(y); await loadYear(y) }

  function getQuarterData(q: number): QuarterData {
    return data[q - 1] || { plan: null, items: [] }
  }

  function updateLocal(q: number, updates: Partial<QuarterData>) {
    setData(prev => {
      const next = [...prev]
      next[q - 1] = { ...next[q - 1], ...updates }
      return next
    })
  }

  async function saveField(q: number, field: 'theme' | 'notes', value: string) {
    const qd = getQuarterData(q)
    const body = {
      theme: field === 'theme' ? value : qd.plan?.theme ?? '',
      notes: field === 'notes' ? value : qd.plan?.notes ?? '',
    }
    const res = await fetch(`/api/quarterly/${year}/${q}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const result = await res.json()
    updateLocal(q, { plan: result.plan, items: result.items })
  }

  function debounceSave(q: number, field: 'theme' | 'notes', value: string) {
    if (saveTimeouts.current[q * 10 + (field === 'notes' ? 1 : 0)]) {
      clearTimeout(saveTimeouts.current[q * 10 + (field === 'notes' ? 1 : 0)])
    }
    saveTimeouts.current[q * 10 + (field === 'notes' ? 1 : 0)] = setTimeout(() => saveField(q, field, value), 700)
  }

  async function addItemTo(q: number) {
    if (!newItem.trim()) return
    const res = await fetch(`/api/quarterly/${year}/${q}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newItem.trim() }),
    })
    const item = await res.json()
    updateLocal(q, { items: [...getQuarterData(q).items, item] })
    setNewItem('')
    setAddingIn(null)
  }

  async function toggleItem(q: number, id: number, completed: number) {
    const res = await fetch(`/api/quarterly/${year}/${q}/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: completed ? 0 : 1 }),
    })
    const updated = await res.json()
    updateLocal(q, { items: getQuarterData(q).items.map(i => i.id === id ? updated : i) })
  }

  async function deleteItem(q: number, id: number) {
    await fetch(`/api/quarterly/${year}/${q}/items/${id}`, { method: 'DELETE' })
    updateLocal(q, { items: getQuarterData(q).items.filter(i => i.id !== id) })
  }

  return (
    <div>
      {/* Year nav */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={prevYear} className="p-1.5 rounded-md border border-[#1e1e2e] text-[#6b7280] hover:text-[#f0f0f0] hover:bg-[#111118] transition-colors">
          <ChevronLeft size={14} />
        </button>
        <h2 className="text-lg font-bold text-[#f0f0f0]">{year}</h2>
        <button onClick={nextYear} className="p-1.5 rounded-md border border-[#1e1e2e] text-[#6b7280] hover:text-[#f0f0f0] hover:bg-[#111118] transition-colors">
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {quarters.map(({ q, label, months, color, border, dot }) => {
          const qd = getQuarterData(q)
          const doneCount = qd.items.filter(i => i.completed).length
          return (
            <div key={q} className={`bg-[#111118] border ${border} rounded-xl p-5`}>
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2 h-2 rounded-full ${dot}`} />
                <span className={`text-sm font-semibold ${color}`}>{label}</span>
                <span className="text-xs text-[#374151]">{months}</span>
                {qd.items.length > 0 && (
                  <span className="text-xs text-[#374151] ml-auto">{doneCount}/{qd.items.length}</span>
                )}
              </div>

              {/* Theme */}
              <input
                defaultValue={qd.plan?.theme ?? ''}
                onBlur={e => debounceSave(q, 'theme', e.target.value)}
                placeholder="Quarter theme..."
                className={`w-full bg-transparent text-sm font-medium placeholder:text-[#2a2a3a] outline-none border-b border-[#1e1e2e] focus:border-current/30 pb-1 mb-4 ${color}`}
              />

              {/* Items */}
              <div className="space-y-1.5 mb-3">
                {qd.items.map(item => (
                  <div key={item.id} className="group flex items-center gap-2.5">
                    <button onClick={() => toggleItem(q, item.id, item.completed)}>
                      {item.completed
                        ? <CheckCircle2 size={14} className="text-green-500" />
                        : <Circle size={14} className="text-[#374151] hover:text-[#6b7280]" />
                      }
                    </button>
                    <span className={`text-sm flex-1 ${item.completed ? 'line-through text-[#374151]' : 'text-[#d1d5db]'}`}>
                      {item.title}
                    </span>
                    <button
                      onClick={() => deleteItem(q, item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[#374151] hover:text-red-400"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}

                {addingIn === q && (
                  <div className="flex items-center gap-2.5">
                    <Circle size={14} className="text-[#374151] flex-shrink-0" />
                    <input
                      autoFocus
                      value={newItem}
                      onChange={e => setNewItem(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addItemTo(q); if (e.key === 'Escape') { setAddingIn(null); setNewItem('') } }}
                      onBlur={() => { if (!newItem.trim()) setAddingIn(null) }}
                      placeholder="Add item..."
                      className="flex-1 text-sm bg-transparent text-[#f0f0f0] placeholder:text-[#374151] outline-none border-b border-[#1e1e2e] pb-0.5"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={() => { setAddingIn(q); setNewItem('') }}
                className="flex items-center gap-1 text-xs text-[#374151] hover:text-[#6b7280] transition-colors mb-4"
              >
                <Plus size={12} /> Add item
              </button>

              {/* Notes */}
              <textarea
                defaultValue={qd.plan?.notes ?? ''}
                onBlur={e => debounceSave(q, 'notes', e.target.value)}
                placeholder="Notes, focus areas, context..."
                rows={3}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-xs text-[#9ca3af] placeholder:text-[#2a2a3a] outline-none resize-none focus:border-[#2e2e3e] transition-colors"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
