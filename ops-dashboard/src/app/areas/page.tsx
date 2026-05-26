import { getAreaTasks } from '@/lib/db'
import AreaBoard from '@/components/areas/AreaBoard'

export const dynamic = 'force-dynamic'

export default function AreasPage() {
  const tasks = getAreaTasks()
  const total = tasks.length
  const done = tasks.filter(t => t.status === 'Done').length

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f0f0f0] tracking-tight">Areas</h1>
        <p className="text-sm text-[#4b5563] mt-0.5">{done}/{total} tasks completed across all areas</p>
      </div>
      <AreaBoard initialTasks={tasks} />
    </div>
  )
}
