import { NextRequest, NextResponse } from 'next/server'
import { getTrackerEntry, upsertTrackerEntry, computeRecord } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { date: string } }) {
  const entry = getTrackerEntry(params.date)
  const record = computeRecord()
  return NextResponse.json({ entry, record })
}

export async function PUT(req: NextRequest, { params }: { params: { date: string } }) {
  const data = await req.json()
  const entry = upsertTrackerEntry(params.date, {
    mental: data.mental ?? 0,
    spiritual: data.spiritual ?? 0,
    physical: data.physical ?? 0,
    accountability: data.accountability ?? 0,
    mental_note: data.mental_note ?? '',
    spiritual_note: data.spiritual_note ?? '',
    physical_note: data.physical_note ?? '',
    accountability_note: data.accountability_note ?? '',
  })
  const record = computeRecord()
  return NextResponse.json({ entry, record })
}
