import { getQuarterlyPlan, getQuarterlyItems } from '@/lib/db'
import QuarterlyBoard from '@/components/quarterly/QuarterlyBoard'

export const dynamic = 'force-dynamic'

export default function QuarterlyPage() {
  const year = new Date().getFullYear()
  const data = [1, 2, 3, 4].map(q => {
    const plan = getQuarterlyPlan(year, q)
    const items = plan ? getQuarterlyItems(plan.id) : []
    return { plan, items }
  })

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f0f0f0] tracking-tight">Quarterly Plan</h1>
        <p className="text-sm text-[#4b5563] mt-0.5">Plan each quarter of the year</p>
      </div>
      <QuarterlyBoard initialYear={year} initialData={data} />
    </div>
  )
}
