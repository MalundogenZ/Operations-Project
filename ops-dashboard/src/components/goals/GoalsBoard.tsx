'use client'

import { useState } from 'react'
import { Plus, X, Calendar, Trash2 } from 'lucide-react'
import type { Goal, GoalStatus } from '@/lib/types'

interface Props {
  initialGoals: Goal[]
  month: string
}

const columns: { status: GoalStatus; label: string; color: string; dot: string }[] = [
  { status: 'Not started', label: 'Not Started', color: 'text-[#6b7280]', dot: 'bg-[#374151]' },
  { status: 'In progress', label: 'In Progress', color: 'text-blue-400', dot: 'bg-blue-500' },
  { status: 'Done', label: 'Done', color: 'text-green-400', dot: 'bg-green-500' },
  { status: 'Overachieved', label: 'Overachieved', color: 'text-red-400', dot: 'bg-red-500' },
]

const typeColors: Record<string, string> = {
  Business: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  University: 'bg-green-500/15 text-green-400 border-green-500/20',
  Finance: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  Personal: 'bg-red-500/15 text-red-400 border-red-500/20',
}

export default function GoalsBoard({ initialGoals, month }: Props) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [filter, setFilter] = useState<string>('All')
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTypes, setNewTypes] = useState<string[]>([])
  const [newDue, setNewDue] = useState('')

  const types = ['Business', 'University', 'Finance', 'Personal']
  const filtered = filter === 'All' ? goals : goals.filter(g => {
    const types = JSON.parse(g.task_types || '[]') as string[]
    return types.includes(filter)
  })

  async function moveGoal(id: number, status: GoalStatus) {
    const res = await fetch(`/api/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const updated = await res.json()
    setGoals(prev => prev.map(g => g.id === id ? updated : g))
  }

  async function deleteGoal(id: number) {
    await fetch(`/api/goals/${id}`, { method: 'DELETE' })
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  async function addGoal() {
    if (!newName.trim()) return
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName.trim(),
        status: 'Not started',
        task_types: JSON.stringify(newTypes),
        due_date: newDue || null,
        description: null,
        month,
      }),
    })
    const goal = await res.json()
    setGoals(prev => [...prev, goal])
    setNewName('')
    setNewTypes([])
    setNewDue('')
    setAdding(false)
  }

  function toggleType(t: string) {
    setNewTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-6">
        {['All', ...types].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === t
                ? 'bg-blue-600 text-white'
                : 'bg-[#111118] border border-[#1e1e2e] text-[#6b7280] hover:text-[#d1d5db]'
            }`}
          >
            {t}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
        >
          <Plus size={13} /> Add Goal
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-[#111118] border border-blue-500/30 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#f0f0f0]">New Goal</h3>
            <button onClick={() => setAdding(false)} className="text-[#4b5563] hover:text-[#9ca3af]">
              <X size={15} />
            </button>
          </div>
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addGoal()}
            placeholder="Goal name..."
            className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#f0f0f0] placeholder:text-[#374151] outline-none focus:border-blue-500/50 mb-3"
          />
          <div className="flex flex-wrap gap-2 mb-3">
            {types.map(t => (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
                  newTypes.includes(t) ? typeColors[t] : 'bg-transparent border-[#1e1e2e] text-[#4b5563]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={newDue}
              onChange={e => setNewDue(e.target.value)}
              className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-xs text-[#6b7280] outline-none focus:border-blue-500/50"
            />
            <button
              onClick={addGoal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Add Goal
            </button>
          </div>
        </div>
      )}

      {/* Kanban */}
      <div className="grid grid-cols-4 gap-4">
        {columns.map(col => {
          const colGoals = filtered.filter(g => g.status === col.status)
          return (
            <div key={col.status} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1 mb-1">
                <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className={`text-xs font-medium ${col.color}`}>{col.label}</span>
                <span className="text-xs text-[#374151] ml-auto">{colGoals.length}</span>
              </div>

              {colGoals.map(goal => {
                const goalTypes = JSON.parse(goal.task_types || '[]') as string[]
                return (
                  <div
                    key={goal.id}
                    className="group bg-[#111118] border border-[#1e1e2e] rounded-lg p-3 hover:border-[#2e2e3e] transition-colors"
                  >
                    <p className="text-sm text-[#d1d5db] mb-2 leading-snug">{goal.name}</p>
                    {goalTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {goalTypes.map(t => (
                          <span key={t} className={`text-xs px-1.5 py-0.5 rounded border ${typeColors[t] || ''}`}>{t}</span>
                        ))}
                      </div>
                    )}
                    {goal.due_date && (
                      <div className="flex items-center gap-1 mb-2">
                        <Calendar size={11} className="text-[#374151]" />
                        <span className="text-xs text-[#4b5563]">{goal.due_date}</span>
                      </div>
                    )}
                    <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {columns.filter(c => c.status !== col.status).map(c => (
                        <button
                          key={c.status}
                          onClick={() => moveGoal(goal.id, c.status)}
                          className={`flex-1 text-xs py-1 rounded border border-[#1e1e2e] text-[#4b5563] hover:text-[#9ca3af] hover:bg-[#1a1a24] transition-colors truncate px-1`}
                          title={`Move to ${c.label}`}
                        >
                          {c.label.split(' ')[0]}
                        </button>
                      ))}
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1 rounded border border-[#1e1e2e] text-[#374151] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                )
              })}

              {colGoals.length === 0 && (
                <div className="border border-dashed border-[#1e1e2e] rounded-lg p-4 text-center">
                  <p className="text-xs text-[#2a2a3a]">Empty</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
