import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/PaymentService'

const paymentService = new PaymentService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // BUG: PaymentService.validate() can throw NullPointerException
    // when body.payment is null/undefined
    const isValid = paymentService.validate(body.payment)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment data' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
