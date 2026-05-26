import { NextRequest, NextResponse } from 'next/server'
import { getWeeklyReview, upsertWeeklyReview } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { week: string } }) {
  return NextResponse.json(getWeeklyReview(params.week))
}

export async function PUT(req: NextRequest, { params }: { params: { week: string } }) {
  const { went_well = '', improve = '', next_focus = '' } = await req.json()
  return NextResponse.json(upsertWeeklyReview(params.week, { went_well, improve, next_focus }))
}
