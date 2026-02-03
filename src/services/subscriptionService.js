const API_BASE_URL = 'http://localhost:8006/api/subscription'

class SubscriptionService {
  // Get all subscription plans
  async getPlans() {
    try {
      const response = await fetch(`${API_BASE_URL}/plans`)
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, plans: data }
      } else {
        return { success: false, error: data.detail || 'Failed to fetch plans' }
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error)
      return { success: false, error: 'Network error' }
    }
  }

  // Get user's subscription info
  async getUserSubscription(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}`)
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.detail || 'Failed to fetch subscription' }
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error)
      return { success: false, error: 'Network error' }
    }
  }

  // Check feature access
  async checkFeatureAccess(userId, feature) {
    try {
      const response = await fetch(`${API_BASE_URL}/feature-access/${userId}/${feature}`)
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, access: data }
      } else {
        return { success: false, error: data.detail || 'Failed to check access' }
      }
    } catch (error) {
      console.error('Error checking feature access:', error)
      return { success: false, error: 'Network error' }
    }
  }

  // Create Razorpay order
  async createOrder(userId, plan) {
    try {
      const response = await fetch(`${API_BASE_URL}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          plan
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, orderData: data }
      } else {
        return { success: false, error: data.detail || 'Failed to create order' }
      }
    } catch (error) {
      console.error('Error creating order:', error)
      return { success: false, error: 'Network error' }
    }
  }

  // Verify payment
  async verifyPayment(paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.detail || 'Payment verification failed' }
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      return { success: false, error: 'Network error' }
    }
  }

  // Cancel subscription
  async cancelSubscription(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/cancel/${userId}`, {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.detail || 'Failed to cancel subscription' }
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
      return { success: false, error: 'Network error' }
    }
  }

  // Get Razorpay config
  async getRazorpayConfig() {
    try {
      const response = await fetch(`${API_BASE_URL}/config`)
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, keyId: data.key_id }
      } else {
        return { success: false, error: 'Failed to get Razorpay config' }
      }
    } catch (error) {
      console.error('Error fetching Razorpay config:', error)
      return { success: false, error: 'Network error' }
    }
  }

  // Helper method to check if user has access to a feature
  async hasFeatureAccess(userId, feature) {
    const result = await this.checkFeatureAccess(userId, feature)
    return result.success ? result.access.allowed : false
  }

  // Helper method to get feature usage info
  async getFeatureUsage(userId, feature) {
    const result = await this.checkFeatureAccess(userId, feature)
    if (result.success) {
      return {
        current: result.access.current_usage,
        limit: result.access.limit,
        allowed: result.access.allowed,
        plan: result.access.plan
      }
    }
    return null
  }
}

const subscriptionService = new SubscriptionService()
export default subscriptionService
