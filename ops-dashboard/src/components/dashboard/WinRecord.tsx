'use client'

import { Trophy, Flame, TrendingUp } from 'lucide-react'

interface Props {
  wins: number
  losses: number
  streak: number
  streakType: 'W' | 'L'
}

export default function WinRecord({ wins, losses, streak, streakType }: Props) {
  const total = wins + losses
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={14} className="text-yellow-500" />
        <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">Year Record</span>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-bold text-[#f0f0f0]">{wins}</span>
        <span className="text-xl text-[#374151] font-light">-</span>
        <span className="text-3xl font-bold text-[#f0f0f0]">{losses}</span>
      </div>

      <div className="w-full bg-[#1e1e2e] rounded-full h-1.5 mb-4">
        <div
          className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${winRate}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Flame size={13} className={streakType === 'W' ? 'text-orange-400' : 'text-[#4b5563]'} />
          <span className="text-sm font-semibold text-[#f0f0f0]">{streak}{streakType}</span>
          <span className="text-xs text-[#4b5563]">streak</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp size={13} className="text-blue-400" />
          <span className="text-sm text-[#9ca3af]">{winRate}%</span>
        </div>
      </div>
    </div>
  )
}
