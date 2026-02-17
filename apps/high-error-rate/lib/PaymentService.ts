/**
 * PaymentService - Contains a null pointer bug
 * 
 * BUG: The validate() method doesn't check if payment is null/undefined
 * before accessing payment.amount, causing NullPointerException when
 * body.payment is null in the API route.
 */
export class PaymentService {
  validate(payment: any): boolean {
    // BUG: No null check - will throw if payment is null/undefined
    if (payment.amount <= 0) {
      return false
    }
    
    if (!payment.currency || payment.currency.length !== 3) {
      return false
    }
    
    return true
  }
  
  process(payment: any): void {
    // Implementation would go here
  }
}
