import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { getDayResults, getWeeklyReview } from '@/lib/db'
import WeeklyReview from '@/components/weekly-review/WeeklyReview'

export const dynamic = 'force-dynamic'

export default function WeeklyReviewPage() {
  const now = new Date()
  const weekStartDate = startOfWeek(now, { weekStartsOn: 1 })
  const weekStart = format(weekStartDate, 'yyyy-MM-dd')
  const weekEnd = endOfWeek(weekStartDate, { weekStartsOn: 1 })

  const year = weekStartDate.getFullYear()
  const month = weekStartDate.getMonth() + 1
  const monthResults = getDayResults(year, month)
  const resultMap = new Map(monthResults.map(r => [r.date, r.result as 'W' | 'L' | null]))

  const dates = eachDayOfInterval({ start: weekStartDate, end: weekEnd }).map(d => format(d, 'yyyy-MM-dd'))
  const days = dates.map(date => ({
    date,
    result: resultMap.get(date) ?? null,
    tracker: null,
  }))

  const review = getWeeklyReview(weekStart)

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f0f0f0] tracking-tight">Weekly Review</h1>
        <p className="text-sm text-[#4b5563] mt-0.5">Reflect, reset, refocus</p>
      </div>
      <WeeklyReview initialWeekStart={weekStart} initialDays={days} initialReview={review} />
    </div>
  )
}
