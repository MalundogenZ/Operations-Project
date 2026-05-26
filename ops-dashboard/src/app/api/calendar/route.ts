import { NextRequest, NextResponse } from 'next/server'
import { getCalendarEntries, addCalendarEntry } from '@/lib/db'

export async function GET(req: NextRequest) {
  const year = parseInt(req.nextUrl.searchParams.get('year') || String(new Date().getFullYear()))
  const month = parseInt(req.nextUrl.searchParams.get('month') || String(new Date().getMonth() + 1))
  return NextResponse.json(getCalendarEntries(year, month))
}

export async function POST(req: NextRequest) {
  const { name, date, tags = '[]' } = await req.json()
  if (!name?.trim() || !date) return NextResponse.json({ error: 'name and date required' }, { status: 400 })
  return NextResponse.json(addCalendarEntry(name.trim(), date, tags), { status: 201 })
}
