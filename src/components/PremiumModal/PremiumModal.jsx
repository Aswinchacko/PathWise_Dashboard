import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Crown, Check, Loader2, CreditCard } from 'lucide-react'
import './PremiumModal.css'
import subscriptionService from '../../services/subscriptionService'
import authService from '../../services/authService'

const PremiumModal = ({ isOpen, onClose, onSuccess, feature = 'projects' }) => {
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadPlans()
      loadRazorpayScript()
    }
  }, [isOpen])

  const loadPlans = async () => {
    setLoading(true)
    const result = await subscriptionService.getPlans()
    if (result.success) {
      // Filter out free plan
      setPlans(result.plans.filter(p => p.plan_id !== 'free'))
    }
    setLoading(false)
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleUpgrade = async (plan) => {
    setError(null)
    setProcessingPayment(true)
    
    try {
      const user = authService.getCurrentUser()
      if (!user || !user.id) {
        setError('User not found. Please login again.')
        setProcessingPayment(false)
        return
      }

      // Create Razorpay order
      const orderResult = await subscriptionService.createOrder(user.id, plan)
      
      if (!orderResult.success) {
        setError(orderResult.error || 'Failed to create order')
        setProcessingPayment(false)
        return
      }

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please try again.')
        setProcessingPayment(false)
        return
      }

      // Configure Razorpay options
      const options = {
        key: orderResult.orderData.key,
        amount: orderResult.orderData.amount,
        currency: orderResult.orderData.currency,
        name: orderResult.orderData.name || 'PathWise Pro',
        description: orderResult.orderData.description || `Upgrade to ${plan} plan`,
        order_id: orderResult.orderData.order_id,
        prefill: orderResult.orderData.prefill,
        theme: orderResult.orderData.theme,
        handler: async function (response) {
          // Payment successful, verify it
          const verifyResult = await subscriptionService.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            user_id: user.id,
            plan: plan
          })

          setProcessingPayment(false)

          if (verifyResult.success) {
            onSuccess && onSuccess()
            onClose()
          } else {
            setError('Payment verification failed. Please contact support.')
          }
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false)
          }
        }
      }

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options)
      razorpay.open()

    } catch (err) {
      console.error('Payment error:', err)
      setError('An error occurred. Please try again.')
      setProcessingPayment(false)
    }
  }

  const handleDummyPayment = async () => {
    // For testing purposes - simulate successful payment
    setError(null)
    setProcessingPayment(true)
    
    try {
      const user = authService.getCurrentUser()
      if (!user || !user.id) {
        setError('User not found. Please login again.')
        setProcessingPayment(false)
        return
      }

      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simulate successful payment verification with dummy data
      const verifyResult = await subscriptionService.verifyPayment({
        razorpay_order_id: 'order_dummy_' + Date.now(),
        razorpay_payment_id: 'pay_dummy_' + Date.now(),
        razorpay_signature: 'dummy_signature_' + Date.now(),
        user_id: user.id,
        plan: selectedPlan
      })

      setProcessingPayment(false)

      if (verifyResult.success) {
        onSuccess && onSuccess()
        onClose()
      } else {
        setError('Payment verification failed. Please try again.')
      }
    } catch (err) {
      console.error('Dummy payment error:', err)
      setError('An error occurred. Please try again.')
      setProcessingPayment(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="premium-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div 
            className="premium-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <button className="modal-close" onClick={onClose}>
              <X size={20} />
            </button>

            <div className="modal-header">
              <div className="premium-icon">
                <Crown size={32} />
              </div>
              <h2>Upgrade to Premium</h2>
              <p>Unlock unlimited projects and all premium features</p>
            </div>

            {error && (
              <div className="error-banner">
                <p>{error}</p>
              </div>
            )}

            {loading ? (
              <div className="loading-state">
                <Loader2 className="spinner" size={32} />
                <p>Loading plans...</p>
              </div>
            ) : (
              <div className="plans-container">
                {plans.map((plan) => (
                  <div 
                    key={plan.plan_id}
                    className={`plan-card ${selectedPlan === plan.plan_id ? 'selected' : ''} ${plan.plan_id === 'pro' ? 'recommended' : ''}`}
                    onClick={() => setSelectedPlan(plan.plan_id)}
                  >
                    {plan.plan_id === 'pro' && (
                      <div className="recommended-badge">Most Popular</div>
                    )}
                    
                    <h3>{plan.name}</h3>
                    <div className="plan-price">
                      <span className="currency">₹</span>
                      <span className="amount">{plan.price / 100}</span>
                      <span className="period">/month</span>
                    </div>
                    <p className="plan-description">{plan.description}</p>
                    
                    <div className="plan-features">
                      {Object.entries(plan.features).map(([key, value]) => {
                        if (typeof value === 'boolean' && value) {
                          return (
                            <div key={key} className="feature-item">
                              <Check size={16} />
                              <span>{formatFeatureName(key)}</span>
                            </div>
                          )
                        } else if (typeof value === 'number' && value === -1) {
                          return (
                            <div key={key} className="feature-item">
                              <Check size={16} />
                              <span>Unlimited {formatFeatureName(key)}</span>
                            </div>
                          )
                        } else if (typeof value === 'number' && value > 0) {
                          return (
                            <div key={key} className="feature-item">
                              <Check size={16} />
                              <span>{value} {formatFeatureName(key)}</span>
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <button 
                className="btn-dummy-payment"
                onClick={handleDummyPayment}
                disabled={processingPayment || loading}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Dummy Payment (Test)
                  </>
                )}
              </button>
              <button 
                className="btn-upgrade"
                onClick={() => handleUpgrade(selectedPlan)}
                disabled={processingPayment || loading}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown size={20} />
                    Pay with Razorpay
                  </>
                )}
              </button>
            </div>

            <p className="payment-note">
              <small>Secure payment powered by Razorpay. Cancel anytime.</small>
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const formatFeatureName = (key) => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default PremiumModal


