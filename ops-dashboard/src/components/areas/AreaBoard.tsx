'use client'

import { useState, useRef } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { AreaTask, AreaTaskStatus } from '@/lib/types'

interface AreaConfig {
  key: 'university' | 'fintech' | 'investment' | 'personal'
  label: string
  icon: string
  accent: string
  border: string
}

const areas: AreaConfig[] = [
  { key: 'university', label: 'University', icon: '🎓', accent: 'text-green-400', border: 'border-green-500/20' },
  { key: 'fintech', label: 'Fintech', icon: '₿', accent: 'text-blue-400', border: 'border-blue-500/20' },
  { key: 'investment', label: 'Investment Partners', icon: '📈', accent: 'text-yellow-400', border: 'border-yellow-500/20' },
  { key: 'personal', label: 'Personal', icon: '⚡', accent: 'text-purple-400', border: 'border-purple-500/20' },
]

const statusCycle: Record<AreaTaskStatus, AreaTaskStatus> = {
  'Not started': 'In progress',
  'In progress': 'Done',
  'Done': 'Not started',
}

const statusStyles: Record<AreaTaskStatus, string> = {
  'Not started': 'bg-[#1e1e2e] text-[#4b5563]',
  'In progress': 'bg-blue-500/15 text-blue-400',
  'Done': 'bg-green-500/15 text-green-400',
}

interface Props {
  initialTasks: AreaTask[]
}

export default function AreaBoard({ initialTasks }: Props) {
  const [tasks, setTasks] = useState<AreaTask[]>(initialTasks)
  const [addingIn, setAddingIn] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function cycleStatus(task: AreaTask) {
    const next = statusCycle[task.status]
    const res = await fetch(`/api/areas/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    const updated = await res.json()
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t))
  }

  async function deleteTask(id: number) {
    await fetch(`/api/areas/${id}`, { method: 'DELETE' })
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  async function addTask(area: string) {
    if (!newName.trim()) return
    const res = await fetch('/api/areas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ area, name: newName.trim() }),
    })
    const task = await res.json()
    setTasks(prev => [...prev, task])
    setNewName('')
    setAddingIn(null)
  }

  function startAdding(area: string) {
    setAddingIn(area)
    setNewName('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {areas.map(area => {
        const areaTasks = tasks.filter(t => t.area === area.key)
        const done = areaTasks.filter(t => t.status === 'Done').length
        return (
          <div
            key={area.key}
            className={`bg-[#111118] border border-[#1e1e2e] rounded-xl p-5`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-base">{area.icon}</span>
                <h3 className={`text-sm font-semibold ${area.accent}`}>{area.label}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#374151]">{done}/{areaTasks.length}</span>
                <button
                  onClick={() => startAdding(area.key)}
                  className="text-[#374151] hover:text-[#9ca3af] transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              {areaTasks.map(task => (
                <div
                  key={task.id}
                  className="group flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-[#1a1a24] transition-colors"
                >
                  <button
                    onClick={() => cycleStatus(task)}
                    className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${statusStyles[task.status]}`}
                  >
                    {task.status === 'Not started' ? '○' : task.status === 'In progress' ? '◐' : '●'}
                  </button>
                  <span className={`text-sm flex-1 ${task.status === 'Done' ? 'line-through text-[#374151]' : 'text-[#d1d5db]'}`}>
                    {task.name}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[#374151] hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {addingIn === area.key && (
                <div className="flex items-center gap-2.5 py-1.5 px-2">
                  <span className="text-xs text-[#374151]">○</span>
                  <input
                    ref={inputRef}
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') addTask(area.key)
                      if (e.key === 'Escape') { setAddingIn(null); setNewName('') }
                    }}
                    onBlur={() => { if (!newName.trim()) setAddingIn(null) }}
                    placeholder="Task name..."
                    className="flex-1 text-sm bg-transparent text-[#f0f0f0] placeholder:text-[#374151] outline-none border-b border-[#1e1e2e] focus:border-blue-500/50 pb-0.5"
                  />
                </div>
              )}

              {areaTasks.length === 0 && addingIn !== area.key && (
                <p className="text-xs text-[#2a2a3a] py-2 text-center">No tasks yet</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
