import { NextRequest, NextResponse } from 'next/server'
import { toggleDailyTask, deleteDailyTask } from '@/lib/db'

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  return NextResponse.json(toggleDailyTask(id))
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  deleteDailyTask(parseInt(params.id))
  return NextResponse.json({ ok: true })
}
