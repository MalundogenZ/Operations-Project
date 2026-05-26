'use client'

import { useState } from 'react'
import { Star, ArrowRight, Pencil, Check, Plus, Trash2, X } from 'lucide-react'

interface SkillItem { name: string; desc: string }
interface RoadmapStage { phase: string; color: string; accent: string; items: string[] }
interface UltimateGoal { goal: string; company: string; year: string }

interface PathState {
  ultimate_goal: UltimateGoal
  skills_technical: SkillItem[]
  skills_business: SkillItem[]
  skills_personal: SkillItem[]
  skills_future: SkillItem[]
  roadmap: RoadmapStage[]
}

interface Props {
  initial: PathState
}

const skillSections: { key: keyof Pick<PathState, 'skills_technical' | 'skills_business' | 'skills_personal' | 'skills_future'>; title: string; color: string }[] = [
  { key: 'skills_technical', title: 'Technical Skills', color: 'text-blue-400' },
  { key: 'skills_business', title: 'Business Skills', color: 'text-green-400' },
  { key: 'skills_personal', title: 'Personal Skills', color: 'text-purple-400' },
  { key: 'skills_future', title: 'Future Trends', color: 'text-yellow-400' },
]

export default function PersonalPathView({ initial }: Props) {
  const [editing, setEditing] = useState(false)
  const [state, setState] = useState<PathState>(initial)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await fetch('/api/path', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    })
    setSaving(false)
    setEditing(false)
  }

  function updateGoal(field: keyof UltimateGoal, value: string) {
    setState(s => ({ ...s, ultimate_goal: { ...s.ultimate_goal, [field]: value } }))
  }

  function updateSkill(key: keyof Pick<PathState, 'skills_technical' | 'skills_business' | 'skills_personal' | 'skills_future'>, idx: number, field: keyof SkillItem, value: string) {
    setState(s => {
      const arr = [...s[key]]
      arr[idx] = { ...arr[idx], [field]: value }
      return { ...s, [key]: arr }
    })
  }

  function addSkill(key: keyof Pick<PathState, 'skills_technical' | 'skills_business' | 'skills_personal' | 'skills_future'>) {
    setState(s => ({ ...s, [key]: [...s[key], { name: '', desc: '' }] }))
  }

  function removeSkill(key: keyof Pick<PathState, 'skills_technical' | 'skills_business' | 'skills_personal' | 'skills_future'>, idx: number) {
    setState(s => ({ ...s, [key]: s[key].filter((_, i) => i !== idx) }))
  }

  function updateRoadmapItem(stageIdx: number, itemIdx: number, value: string) {
    setState(s => {
      const roadmap = s.roadmap.map((stage, si) => {
        if (si !== stageIdx) return stage
        const items = [...stage.items]
        items[itemIdx] = value
        return { ...stage, items }
      })
      return { ...s, roadmap }
    })
  }

  function addRoadmapItem(stageIdx: number) {
    setState(s => {
      const roadmap = s.roadmap.map((stage, si) =>
        si !== stageIdx ? stage : { ...stage, items: [...stage.items, ''] }
      )
      return { ...s, roadmap }
    })
  }

  function removeRoadmapItem(stageIdx: number, itemIdx: number) {
    setState(s => {
      const roadmap = s.roadmap.map((stage, si) =>
        si !== stageIdx ? stage : { ...stage, items: stage.items.filter((_, i) => i !== itemIdx) }
      )
      return { ...s, roadmap }
    })
  }

  return (
    <div className="space-y-10">
      {/* Edit toggle */}
      <div className="flex justify-end">
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={() => { setState(initial); setEditing(false) }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#6b7280] border border-[#1e1e2e] rounded-lg hover:text-[#f0f0f0] transition-colors"
            >
              <X size={12} /> Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Check size={12} /> {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#6b7280] border border-[#1e1e2e] rounded-lg hover:text-[#f0f0f0] hover:bg-[#111118] transition-colors"
          >
            <Pencil size={12} /> Edit
          </button>
        )}
      </div>

      {/* Ultimate Goal */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Star size={16} className="text-yellow-400" />
          <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">Ultimate Goal</span>
        </div>
        {editing ? (
          <div className="space-y-2">
            <input
              value={state.ultimate_goal.goal}
              onChange={e => updateGoal('goal', e.target.value)}
              className="w-full bg-transparent text-3xl font-bold text-[#f0f0f0] outline-none border-b border-purple-500/30 pb-1"
            />
            <div className="flex gap-3">
              <input
                value={state.ultimate_goal.company}
                onChange={e => updateGoal('company', e.target.value)}
                placeholder="Company name"
                className="flex-1 bg-transparent text-sm text-[#6b7280] outline-none border-b border-[#1e1e2e] pb-0.5"
              />
              <input
                value={state.ultimate_goal.year}
                onChange={e => updateGoal('year', e.target.value)}
                placeholder="Year"
                className="w-24 bg-transparent text-sm text-[#6b7280] outline-none border-b border-[#1e1e2e] pb-0.5"
              />
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-[#f0f0f0] mb-1">{state.ultimate_goal.goal}</h2>
            <p className="text-[#6b7280]">{state.ultimate_goal.company} · Target year {state.ultimate_goal.year}</p>
          </>
        )}
      </div>

      {/* Roadmap */}
      <div>
        <h2 className="text-base font-semibold text-[#f0f0f0] mb-4">Long View Roadmap</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {state.roadmap.map((stage, si) => (
            <div key={si} className="flex items-start gap-3 flex-shrink-0">
              <div className={`border rounded-xl p-4 w-52 ${stage.color}`}>
                <p className={`text-xs font-semibold mb-3 ${stage.accent}`}>{stage.phase}</p>
                <ul className="space-y-1.5">
                  {stage.items.map((item, ii) => (
                    <li key={ii} className="flex items-start gap-2 text-xs text-[#9ca3af]">
                      <span className="mt-0.5 flex-shrink-0 text-[#374151]">·</span>
                      {editing ? (
                        <div className="flex-1 flex gap-1">
                          <input
                            value={item}
                            onChange={e => updateRoadmapItem(si, ii, e.target.value)}
                            className="flex-1 bg-transparent text-xs text-[#9ca3af] outline-none border-b border-[#2e2e3e] pb-0.5"
                          />
                          <button onClick={() => removeRoadmapItem(si, ii)} className="text-[#374151] hover:text-red-400">
                            <X size={10} />
                          </button>
                        </div>
                      ) : item}
                    </li>
                  ))}
                  {editing && (
                    <li>
                      <button
                        onClick={() => addRoadmapItem(si)}
                        className="flex items-center gap-1 text-xs text-[#374151] hover:text-[#6b7280]"
                      >
                        <Plus size={10} /> Add
                      </button>
                    </li>
                  )}
                </ul>
              </div>
              {si < state.roadmap.length - 1 && (
                <ArrowRight size={14} className="text-[#374151] mt-6 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-base font-semibold text-[#f0f0f0] mb-4">Skills to Develop</h2>
        <div className="grid grid-cols-2 gap-4">
          {skillSections.map(section => (
            <div key={section.key} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${section.color}`}>
                {section.title}
              </h3>
              <div className="space-y-3">
                {state[section.key].map((skill, idx) => (
                  <div key={idx} className="group flex flex-col gap-0.5">
                    {editing ? (
                      <div className="flex gap-2 items-start">
                        <div className="flex-1 space-y-1">
                          <input
                            value={skill.name}
                            onChange={e => updateSkill(section.key, idx, 'name', e.target.value)}
                            placeholder="Skill name"
                            className="w-full bg-transparent text-sm font-medium text-[#d1d5db] outline-none border-b border-[#1e1e2e] pb-0.5"
                          />
                          <input
                            value={skill.desc}
                            onChange={e => updateSkill(section.key, idx, 'desc', e.target.value)}
                            placeholder="Description"
                            className="w-full bg-transparent text-xs text-[#4b5563] outline-none border-b border-[#1e1e2e] pb-0.5"
                          />
                        </div>
                        <button onClick={() => removeSkill(section.key, idx)} className="text-[#374151] hover:text-red-400 mt-1">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-[#d1d5db]">{skill.name}</span>
                        <span className="text-xs text-[#4b5563]">{skill.desc}</span>
                      </>
                    )}
                  </div>
                ))}
                {editing && (
                  <button
                    onClick={() => addSkill(section.key)}
                    className="flex items-center gap-1 text-xs text-[#374151] hover:text-[#6b7280] transition-colors mt-1"
                  >
                    <Plus size={12} /> Add skill
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
