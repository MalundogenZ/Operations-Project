import { NextRequest, NextResponse } from 'next/server'
import { updateCalendarEntry, deleteCalendarEntry } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json()
  return NextResponse.json(updateCalendarEntry(parseInt(params.id), data))
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  deleteCalendarEntry(parseInt(params.id))
  return NextResponse.json({ ok: true })
}
