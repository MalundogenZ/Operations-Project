import { getDailyTasks, getGoals, computeRecord, getTrackerEntry } from '@/lib/db'
import WinRecord from '@/components/dashboard/WinRecord'
import TodayTracker from '@/components/dashboard/TodayTracker'
import DailyTasks from '@/components/dashboard/DailyTasks'
import GoalsSummary from '@/components/dashboard/GoalsSummary'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const today = new Date().toISOString().split('T')[0]
  const month = today.slice(0, 7)
  const record = computeRecord()
  const tasks = getDailyTasks(today)
  const goals = getGoals(month)
  const tracker = getTrackerEntry(today)
  const dayOfWeek = format(new Date(), 'EEEE')
  const dateFormatted = format(new Date(), 'MMMM d, yyyy')

  const winState = {
    mental: !!(tracker?.mental),
    spiritual: !!(tracker?.spiritual),
    physical: !!(tracker?.physical),
    accountability: !!(tracker?.accountability),
  }

  const completedTasks = tasks.filter(t => t.completed).length

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f0f0f0] tracking-tight">
          {dayOfWeek}
        </h1>
        <p className="text-sm text-[#4b5563] mt-0.5">{dateFormatted}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
          <p className="text-xs text-[#4b5563] uppercase tracking-wider mb-1.5">Win Rate</p>
          <p className="text-2xl font-bold text-[#f0f0f0]">
            {record.wins + record.losses > 0 ? Math.round((record.wins / (record.wins + record.losses)) * 100) : 0}%
          </p>
          <p className="text-xs text-[#374151] mt-1">{record.wins}W · {record.losses}L</p>
        </div>
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
          <p className="text-xs text-[#4b5563] uppercase tracking-wider mb-1.5">Streak</p>
          <p className={`text-2xl font-bold ${record.streakType === 'W' ? 'text-green-400' : 'text-red-400'}`}>
            {record.streak}{record.streakType}
          </p>
          <p className="text-xs text-[#374151] mt-1">current run</p>
        </div>
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
          <p className="text-xs text-[#4b5563] uppercase tracking-wider mb-1.5">Tasks Today</p>
          <p className="text-2xl font-bold text-[#f0f0f0]">{completedTasks}/{tasks.length}</p>
          <p className="text-xs text-[#374151] mt-1">completed</p>
        </div>
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
          <p className="text-xs text-[#4b5563] uppercase tracking-wider mb-1.5">Monthly Goals</p>
          <p className="text-2xl font-bold text-[#f0f0f0]">
            {goals.filter(g => g.status === 'Done' || g.status === 'Overachieved').length}/{goals.length}
          </p>
          <p className="text-xs text-[#374151] mt-1">done this month</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Left col */}
        <div className="col-span-2 space-y-4">
          <TodayTracker date={today} initial={winState} />
          <DailyTasks date={today} initialTasks={tasks} />
        </div>

        {/* Right col */}
        <div className="space-y-4">
          <WinRecord
            wins={record.wins}
            losses={record.losses}
            streak={record.streak}
            streakType={record.streakType}
          />
          <GoalsSummary goals={goals} month={month} />
        </div>
      </div>
    </div>
  )
}
