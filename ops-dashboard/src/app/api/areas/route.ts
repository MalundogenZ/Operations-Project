import { NextRequest, NextResponse } from 'next/server'
import { getAreaTasks, addAreaTask } from '@/lib/db'

export async function GET(req: NextRequest) {
  const area = req.nextUrl.searchParams.get('area') || undefined
  return NextResponse.json(getAreaTasks(area))
}

export async function POST(req: NextRequest) {
  const { area, name } = await req.json()
  if (!area || !name?.trim()) return NextResponse.json({ error: 'area and name required' }, { status: 400 })
  return NextResponse.json(addAreaTask(area, name.trim()), { status: 201 })
}
