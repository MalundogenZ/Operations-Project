import { getCalendarEntries } from '@/lib/db'
import CalendarView from '@/components/calendar/CalendarView'

export const dynamic = 'force-dynamic'

export default function CalendarPage() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const entries = getCalendarEntries(year, month)

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f0f0f0] tracking-tight">Calendar</h1>
        <p className="text-sm text-[#4b5563] mt-0.5">Journal & schedule</p>
      </div>
      <CalendarView initialEntries={entries} initialYear={year} initialMonth={month} />
    </div>
  )
}
