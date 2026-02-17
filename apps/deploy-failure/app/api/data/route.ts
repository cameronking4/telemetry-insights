import { NextRequest, NextResponse } from 'next/server'
import { processData } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // This will fail at build time because lodash is not in package.json
    const processed = processData(body.items || [])
    
    return NextResponse.json({ processed })
  } catch (error) {
    console.error('Data processing error:', error)
    return NextResponse.json(
      { error: 'Build failed: Module not found' },
      { status: 500 }
    )
  }
}
