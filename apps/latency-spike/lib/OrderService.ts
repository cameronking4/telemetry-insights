/**
 * OrderService - Contains a slow query bug
 * 
 * BUG: The getOrdersByUser() method uses SELECT * without proper indexing
 * or WHERE clause optimization, causing slow queries that timeout.
 */
export class OrderService {
  async getOrdersByUser(userId: string): Promise<any[]> {
    // BUG: SELECT * without WHERE clause optimization
    // This simulates a slow query that would timeout
    // In a real app, this would be a database query like:
    // SELECT * FROM orders WHERE userId = ?
    // Without proper indexing, this becomes slow
    
    // Simulate slow query (2+ seconds)
    await new Promise(resolve => setTimeout(resolve, 2300))
    
    // Simulate fetching all orders without filtering efficiently
    const allOrders = [
      { id: 1, userId: 'user1', total: 100 },
      { id: 2, userId: 'user2', total: 200 },
      { id: 3, userId: 'user1', total: 150 },
    ]
    
    // BUG: Filtering in memory instead of using WHERE clause
    return allOrders.filter(order => order.userId === userId)
  }
  
  async getOrderById(id: number): Promise<any> {
    // Implementation would go here
    return null
  }
}
