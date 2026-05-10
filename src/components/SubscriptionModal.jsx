import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Crown, Zap, Users, Star, CreditCard, Loader2, AlertCircle } from 'lucide-react'
import subscriptionService from '../services/subscriptionService'
import PayPalButtons from './PayPalButtons'
import './SubscriptionModal.css'

const SubscriptionModal = ({ isOpen, onClose, userId, currentPlan = 'free' }) => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkoutPlanId, setCheckoutPlanId] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadPlans()
      setCheckoutPlanId(null)
    }
  }, [isOpen])

  const loadPlans = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await subscriptionService.getPlans()
      if (result.success) {
        setPlans(result.plans)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to load subscription plans')
    } finally {
      setLoading(false)
    }
  }

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'free':
        return <Star className="plan-icon" />
      case 'premium':
        return <Crown className="plan-icon" />
      case 'enterprise':
        return <Users className="plan-icon" />
      default:
        return <Zap className="plan-icon" />
    }
  }

  const formatFeature = (key, value) => {
    if (typeof value === 'boolean') {
      return value ? '✓ Included' : '✗ Not included'
    }
    if (value === -1) {
      return 'Unlimited'
    }
    if (typeof value === 'number') {
      return `${value} per month`
    }
    return value.toString()
  }

  const getFeatureDisplayName = (key) => {
    const names = {
      roadmaps: 'Custom Roadmaps',
      projects: 'Project Recommendations',
      resources: 'Learning Resources',
      opportunities: 'Job Opportunities',
      mentorship: 'Mentorship Access',
      advanced_analytics: 'Advanced Analytics',
      priority_support: 'Priority Support',
      custom_roadmaps: 'AI-Powered Roadmaps',
      team_collaboration: 'Team Collaboration',
      api_access: 'API Access',
      white_label: 'White Label Solution',
    }
    return names[key] || key.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (!isOpen) return null

  const checkoutPlan = plans.find((p) => p.plan_id === checkoutPlanId)

  return (
    <AnimatePresence>
      <div className="subscription-modal-overlay" onClick={onClose}>
        <motion.div
          className="subscription-modal"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="modal-header">
            <h2>Choose Your Plan</h2>
            <p>Unlock the full potential of PathWise</p>
            <button type="button" className="close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="modal-content">
            {error && (
              <div className="error-message">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {loading ? (
              <div className="loading-state">
                <Loader2 className="spinning" size={32} />
                <p>Loading subscription plans...</p>
              </div>
            ) : (
              <>
                <div className="plans-grid">
                  {plans.map((plan) => (
                    <motion.div
                      key={plan.plan_id}
                      className={`plan-card ${plan.plan_id === currentPlan ? 'current-plan' : ''} ${plan.plan_id === 'premium' ? 'popular' : ''} ${checkoutPlanId === plan.plan_id ? 'checkout-selected' : ''}`}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      {plan.plan_id === 'premium' && (
                        <div className="popular-badge">
                          <Star size={16} />
                          Most Popular
                        </div>
                      )}

                      <div className="plan-header">
                        {getPlanIcon(plan.plan_id)}
                        <h3>{plan.name}</h3>
                        <div className="plan-price">
                          <span className="price">
                            {plan.price_display || (plan.price > 0 ? `₹${plan.price}` : 'Free')}
                          </span>
                          {plan.price > 0 && <span className="period">/month</span>}
                        </div>
                        <p className="plan-description">{plan.description}</p>
                      </div>

                      <div className="plan-features">
                        {Object.entries(plan.features).map(([key, value]) => (
                          <div key={key} className="feature-item">
                            <Check size={16} className="feature-check" />
                            <span className="feature-name">{getFeatureDisplayName(key)}</span>
                            <span className="feature-value">{formatFeature(key, value)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="plan-footer">
                        {plan.plan_id === currentPlan ? (
                          <button type="button" className="plan-btn current" disabled>
                            Current Plan
                          </button>
                        ) : plan.plan_id === 'free' ? (
                          <button type="button" className="plan-btn secondary" disabled>
                            Downgrade
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={`plan-btn ${plan.plan_id === 'premium' ? 'primary' : 'secondary'}`}
                            onClick={() => setCheckoutPlanId(plan.plan_id)}
                          >
                            <CreditCard size={16} />
                            Pay with PayPal
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {checkoutPlanId && userId && checkoutPlan && (
                  <div className="subscription-modal-paypal">
                    <p className="subscription-modal-paypal-label">
                      Checkout: {checkoutPlan.name}
                    </p>
                    <PayPalButtons
                      key={checkoutPlanId}
                      userId={userId}
                      planId={checkoutPlanId}
                      planLabel={checkoutPlan.name}
                      onSuccess={() => {
                        window.location.href = '/subscription/success'
                      }}
                      onError={(msg) => setError(msg || 'Payment failed')}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal-footer">
            <div className="security-notice">
              <div className="security-badges">
                <div className="badge">
                  <CreditCard size={16} />
                  <span>Secure Payment</span>
                </div>
                <div className="badge">
                  <Star size={16} />
                  <span>Cancel Anytime</span>
                </div>
                <div className="badge">
                  <Crown size={16} />
                  <span>30-Day Guarantee</span>
                </div>
              </div>
              <p>Payments are processed securely through PayPal. You can cancel your subscription at any time.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default SubscriptionModal
