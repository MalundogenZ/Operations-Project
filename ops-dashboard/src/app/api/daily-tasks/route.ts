import { NextRequest, NextResponse } from 'next/server'
import { getDailyTasks, addDailyTask } from '@/lib/db'

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date') || new Date().toISOString().split('T')[0]
  return NextResponse.json(getDailyTasks(date))
}

export async function POST(req: NextRequest) {
  const { title, date } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })
  const d = date || new Date().toISOString().split('T')[0]
  return NextResponse.json(addDailyTask(title.trim(), d), { status: 201 })
}
