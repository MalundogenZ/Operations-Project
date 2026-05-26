import { NextRequest, NextResponse } from 'next/server'
import { getPathData, updatePathKey } from '@/lib/db'

export async function GET() {
  const rows = getPathData()
  const data: Record<string, unknown> = {}
  for (const row of rows) {
    try { data[row.key] = JSON.parse(row.value) } catch { data[row.key] = row.value }
  }
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  for (const [key, value] of Object.entries(body)) {
    updatePathKey(key, JSON.stringify(value))
  }
  return NextResponse.json({ ok: true })
}
