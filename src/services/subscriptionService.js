import { apiUrl } from '../config/apiBase'

const API_BASE_URL = apiUrl('/api/subscription')

class SubscriptionService {
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

  /** Create PayPal order (plan = plan id string or { id }) */
  async createOrder(userId, plan, prefill = {}) {
    const planId = typeof plan === 'string' ? plan : plan?.id
    try {
      const response = await fetch(`${API_BASE_URL}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          plan: planId,
          ...prefill,
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

  /** PayPal SDK config (backend snake_case → camelCase). */
  async getPaymentConfig() {
    try {
      const response = await fetch(`${API_BASE_URL}/config`)
      const data = await response.json()
      if (!response.ok) {
        return { success: false, error: data.detail || 'Failed to load payment config' }
      }
      return {
        success: true,
        mockMode: Boolean(data.mock_mode),
        paypalClientId: data.paypal_client_id || null,
        currency: data.currency || 'INR',
      }
    } catch (error) {
      console.error('Error fetching payment config:', error)
      return { success: false, error: 'Network error' }
    }
  }

  /** Capture PayPal order after approval — body matches backend `CapturePaymentRequest`. */
  async capturePayment(payload) {
    try {
      const response = await fetch(`${API_BASE_URL}/capture-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.detail || 'Failed to capture payment' }
      }
    } catch (error) {
      console.error('Error capturing payment:', error)
      return { success: false, error: 'Network error' }
    }
  }

  /** Process Razorpay / unified payment payload used by PaymentModal */
  async processPayment(paymentPayload) {
    try {
      const response = await fetch(`${API_BASE_URL}/process-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentPayload),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.detail || data.message || 'Payment processing failed' }
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      return { success: false, error: 'Network error' }
    }
  }

  /** Cancel subscription for user */
  async cancelSubscription(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/cancel/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.detail || data.message || 'Cancellation failed' }
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      return { success: false, error: 'Network error' }
    }
  }

}

export default new SubscriptionService()
