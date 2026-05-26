import PersonalPathView from '@/components/path/PersonalPathView'

export default function PathPage() {
  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f0f0f0] tracking-tight">Personal Path</h1>
        <p className="text-sm text-[#4b5563] mt-0.5">Long-term vision · Skills · Roadmap</p>
      </div>
      <PersonalPathView />
    </div>
  )
}
