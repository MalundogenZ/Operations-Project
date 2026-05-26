import { NextRequest, NextResponse } from 'next/server'
import { updateGoal, deleteGoal } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json()
  return NextResponse.json(updateGoal(parseInt(params.id), data))
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  deleteGoal(parseInt(params.id))
  return NextResponse.json({ ok: true })
}
