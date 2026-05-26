import { NextRequest, NextResponse } from 'next/server'
import { updateAreaTask, deleteAreaTask } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json()
  return NextResponse.json(updateAreaTask(parseInt(params.id), data))
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  deleteAreaTask(parseInt(params.id))
  return NextResponse.json({ ok: true })
}
