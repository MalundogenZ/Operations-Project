import { getPathData } from '@/lib/db'
import PersonalPathView from '@/components/path/PersonalPathView'

export const dynamic = 'force-dynamic'

export default function PathPage() {
  const rows = getPathData()
  const byKey = Object.fromEntries(rows.map(r => [r.key, JSON.parse(r.value)]))

  const initial = {
    ultimate_goal: byKey.ultimate_goal ?? { goal: '', company: '', year: '' },
    skills_technical: byKey.skills_technical ?? [],
    skills_business: byKey.skills_business ?? [],
    skills_personal: byKey.skills_personal ?? [],
    skills_future: byKey.skills_future ?? [],
    roadmap: byKey.roadmap ?? [],
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f0f0f0] tracking-tight">Personal Path</h1>
        <p className="text-sm text-[#4b5563] mt-0.5">Long-term vision · Skills · Roadmap</p>
      </div>
      <PersonalPathView initial={initial} />
    </div>
  )
}
