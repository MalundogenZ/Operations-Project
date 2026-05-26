import { NextRequest, NextResponse } from 'next/server'
import { upsertQuarterlyPlan, addQuarterlyItem } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { year: string; quarter: string } }) {
  const year = parseInt(params.year)
  const quarter = parseInt(params.quarter)
  const { title } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 })
  const plan = upsertQuarterlyPlan(year, quarter, { theme: '', notes: '' })
  const item = addQuarterlyItem(plan.id, title.trim())
  return NextResponse.json(item, { status: 201 })
}
