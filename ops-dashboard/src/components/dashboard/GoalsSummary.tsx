import Link from 'next/link'
import { ArrowRight, Target } from 'lucide-react'
import type { Goal } from '@/lib/types'

interface Props {
  goals: Goal[]
  month: string
}

const statusOrder = ['Not started', 'In progress', 'Done', 'Overachieved'] as const
const statusColors: Record<string, string> = {
  'Not started': 'bg-[#374151]',
  'In progress': 'bg-blue-500',
  'Done': 'bg-green-500',
  'Overachieved': 'bg-red-500',
}

export default function GoalsSummary({ goals, month }: Props) {
  const counts = statusOrder.reduce((acc, s) => {
    acc[s] = goals.filter(g => g.status === s).length
    return acc
  }, {} as Record<string, number>)

  const done = goals.filter(g => g.status === 'Done' || g.status === 'Overachieved').length
  const total = goals.length

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-[#f0f0f0]">
            {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Goals
          </h3>
        </div>
        <Link href="/goals" className="flex items-center gap-1 text-xs text-[#4b5563] hover:text-blue-400 transition-colors">
          View all <ArrowRight size={11} />
        </Link>
      </div>

      <div className="flex items-center gap-1.5 mb-4">
        {goals.map((g, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${statusColors[g.status] || 'bg-[#374151]'}`}
            title={g.name}
          />
        ))}
        {goals.length === 0 && <div className="h-1.5 flex-1 rounded-full bg-[#1e1e2e]" />}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {statusOrder.map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColors[s]}`} />
            <span className="text-xs text-[#6b7280] flex-1">{s}</span>
            <span className="text-xs font-medium text-[#9ca3af]">{counts[s]}</span>
          </div>
        ))}
      </div>

      {total > 0 && (
        <p className="text-xs text-[#4b5563] mt-3 pt-3 border-t border-[#1e1e2e]">
          {done}/{total} completed · {Math.round((done / total) * 100)}% done
        </p>
      )}
    </div>
  )
}
