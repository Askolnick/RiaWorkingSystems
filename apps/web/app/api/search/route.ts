import { NextResponse } from 'next/server'
import { search } from '../../features/search'

export async function GET(req: Request){
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const items = q ? search(q) : []
  return NextResponse.json({ items })
}
