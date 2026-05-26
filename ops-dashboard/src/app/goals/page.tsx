import { getGoals } from '@/lib/db'
import GoalsBoard from '@/components/goals/GoalsBoard'

export const dynamic = 'force-dynamic'

export default function GoalsPage() {
  const month = new Date().toISOString().slice(0, 7)
  const goals = getGoals(month)
  const monthLabel = new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f0f0f0] tracking-tight">Goals</h1>
        <p className="text-sm text-[#4b5563] mt-0.5">{monthLabel} · {goals.length} goals</p>
      </div>
      <GoalsBoard initialGoals={goals} month={month} />
    </div>
  )
}
