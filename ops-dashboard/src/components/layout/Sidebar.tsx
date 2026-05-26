'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Target, Grid3X3, CalendarDays, Compass, Zap } from 'lucide-react'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/areas', label: 'Areas', icon: Grid3X3 },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/path', label: 'Personal Path', icon: Compass },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-56 flex flex-col border-r border-[#1e1e2e] bg-[#0a0a0f] z-20">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#1e1e2e]">
        <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Zap size={14} className="text-white" />
        </div>
        <span className="font-semibold text-[#f0f0f0] text-sm tracking-tight">Operations</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? 'bg-[#1e1e2e] text-[#f0f0f0] font-medium'
                  : 'text-[#6b7280] hover:text-[#d1d5db] hover:bg-[#111118]'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-[#1e1e2e]">
        <p className="text-xs text-[#4b5563]">Maximus Investments</p>
        <p className="text-xs text-[#374151] mt-0.5">$42B · 2042</p>
      </div>
    </aside>
  )
}
