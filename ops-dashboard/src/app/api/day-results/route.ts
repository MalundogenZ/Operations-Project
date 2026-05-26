import { NextRequest, NextResponse } from 'next/server'
import { getDayResults } from '@/lib/db'

export async function GET(req: NextRequest) {
  const year = parseInt(req.nextUrl.searchParams.get('year') || String(new Date().getFullYear()))
  const month = parseInt(req.nextUrl.searchParams.get('month') || String(new Date().getMonth() + 1))
  return NextResponse.json(getDayResults(year, month))
}
