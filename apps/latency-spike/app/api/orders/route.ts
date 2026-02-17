import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/OrderService'

const orderService = new OrderService()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    
    // BUG: This will trigger a slow query that times out
    const orders = await orderService.getOrdersByUser(userId || '')
    
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json(
      { error: 'Request timeout' },
      { status: 504 }
    )
  }
}
