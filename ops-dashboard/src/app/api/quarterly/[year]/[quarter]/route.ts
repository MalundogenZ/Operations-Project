import { NextRequest, NextResponse } from 'next/server'
import { getQuarterlyPlan, upsertQuarterlyPlan, getQuarterlyItems } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { year: string; quarter: string } }) {
  const year = parseInt(params.year)
  const quarter = parseInt(params.quarter)
  const plan = getQuarterlyPlan(year, quarter)
  const items = plan ? getQuarterlyItems(plan.id) : []
  return NextResponse.json({ plan, items })
}

export async function PUT(req: NextRequest, { params }: { params: { year: string; quarter: string } }) {
  const year = parseInt(params.year)
  const quarter = parseInt(params.quarter)
  const { theme = '', notes = '' } = await req.json()
  const plan = upsertQuarterlyPlan(year, quarter, { theme, notes })
  const items = getQuarterlyItems(plan.id)
  return NextResponse.json({ plan, items })
}
