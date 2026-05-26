import { NextRequest, NextResponse } from 'next/server'
import { getGoals, addGoal } from '@/lib/db'

export async function GET(req: NextRequest) {
  const month = req.nextUrl.searchParams.get('month') || undefined
  return NextResponse.json(getGoals(month))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, status = 'Not started', task_types = '[]', due_date = null, description = null, month } = body
  if (!name?.trim() || !month) return NextResponse.json({ error: 'name and month required' }, { status: 400 })
  return NextResponse.json(addGoal({ name: name.trim(), status, task_types, due_date, description, month }), { status: 201 })
}
