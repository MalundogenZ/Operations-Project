'use client'

import { useState, useRef } from 'react'
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react'
import type { DailyTask } from '@/lib/types'

interface Props {
  date: string
  initialTasks: DailyTask[]
}

export default function DailyTasks({ date, initialTasks }: Props) {
  const [tasks, setTasks] = useState<DailyTask[]>(initialTasks)
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const completed = tasks.filter(t => t.completed).length
  const total = tasks.length

  async function addTask() {
    if (!newTitle.trim()) return
    const res = await fetch('/api/daily-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim(), date }),
    })
    const task = await res.json()
    setTasks(prev => [...prev, task])
    setNewTitle('')
    setAdding(false)
  }

  async function toggle(id: number) {
    const res = await fetch(`/api/daily-tasks/${id}`, { method: 'PATCH' })
    const updated = await res.json()
    setTasks(prev => prev.map(t => t.id === id ? updated : t))
  }

  async function remove(id: number) {
    await fetch(`/api/daily-tasks/${id}`, { method: 'DELETE' })
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#f0f0f0]">Daily Tasks</h3>
          <p className="text-xs text-[#4b5563] mt-0.5">{completed}/{total} done</p>
        </div>
        <button
          onClick={() => { setAdding(true); setTimeout(() => inputRef.current?.focus(), 50) }}
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Plus size={13} /> Add
        </button>
      </div>

      {total > 0 && (
        <div className="w-full bg-[#1e1e2e] rounded-full h-1 mb-4">
          <div
            className="bg-blue-500 h-1 rounded-full transition-all duration-500"
            style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
          />
        </div>
      )}

      <div className="space-y-1">
        {tasks.map(task => (
          <div
            key={task.id}
            className="group flex items-center gap-3 py-2 px-1 rounded-md hover:bg-[#1a1a24] transition-colors"
          >
            <button onClick={() => toggle(task.id)} className="flex-shrink-0">
              {task.completed
                ? <CheckCircle2 size={16} className="text-green-500" />
                : <Circle size={16} className="text-[#374151] hover:text-[#6b7280] transition-colors" />
              }
            </button>
            <span className={`text-sm flex-1 ${task.completed ? 'line-through text-[#374151]' : 'text-[#d1d5db]'}`}>
              {task.title}
            </span>
            <button
              onClick={() => remove(task.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[#374151] hover:text-red-400"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}

        {adding && (
          <div className="flex items-center gap-3 py-1.5 px-1">
            <Circle size={16} className="text-[#374151] flex-shrink-0" />
            <input
              ref={inputRef}
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addTask(); if (e.key === 'Escape') { setAdding(false); setNewTitle('') } }}
              onBlur={() => { if (!newTitle.trim()) setAdding(false) }}
              placeholder="New task..."
              className="flex-1 text-sm bg-transparent text-[#f0f0f0] placeholder:text-[#374151] outline-none border-b border-[#1e1e2e] focus:border-blue-500/50 pb-0.5"
            />
          </div>
        )}

        {tasks.length === 0 && !adding && (
          <p className="text-xs text-[#374151] py-2 text-center">No tasks yet — add one above</p>
        )}
      </div>
    </div>
  )
}
