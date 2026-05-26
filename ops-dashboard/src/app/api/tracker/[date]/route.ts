import { NextRequest, NextResponse } from 'next/server'
import { getTrackerEntry, upsertTrackerEntry, computeRecord } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { date: string } }) {
  const entry = getTrackerEntry(params.date)
  const record = computeRecord()
  return NextResponse.json({ entry, record })
}

export async function PUT(req: NextRequest, { params }: { params: { date: string } }) {
  const data = await req.json()
  const entry = upsertTrackerEntry(params.date, data)
  const record = computeRecord()
  return NextResponse.json({ entry, record })
}
