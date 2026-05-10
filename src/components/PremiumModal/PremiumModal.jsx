import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Crown, Check, Loader2 } from 'lucide-react'
import './PremiumModal.css'
import subscriptionService from '../../services/subscriptionService'
import authService from '../../services/authService'
import PayPalButtons from '../PayPalButtons'

const PremiumModal = ({ isOpen, onClose, onSuccess, feature = 'projects' }) => {
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState('premium')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadPlans()
    }
  }, [isOpen])

  const loadPlans = async () => {
    setLoading(true)
    const result = await subscriptionService.getPlans()
    if (result.success) {
      setPlans(result.plans.filter((p) => p.plan_id !== 'free'))
    }
    setLoading(false)
  }

  const user = authService.getCurrentUser()

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
            <button type="button" className="modal-close" onClick={onClose}>
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
                    role="button"
                    tabIndex={0}
                    className={`plan-card ${selectedPlan === plan.plan_id ? 'selected' : ''} ${plan.plan_id === 'premium' ? 'recommended' : ''}`}
                    onClick={() => setSelectedPlan(plan.plan_id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setSelectedPlan(plan.plan_id)
                    }}
                  >
                    {plan.plan_id === 'premium' && (
                      <div className="recommended-badge">Most Popular</div>
                    )}

                    <h3>{plan.name}</h3>
                    <div className="plan-price">
                      <span className="currency">₹</span>
                      <span className="amount">{plan.price}</span>
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
                              <span>
                                {value} {formatFeatureName(key)}
                              </span>
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

            {!loading && user?.id && (
              <div className="premium-paypal-wrap">
                <PayPalButtons
                  key={selectedPlan}
                  userId={user.id}
                  planId={selectedPlan}
                  planLabel={plans.find((p) => p.plan_id === selectedPlan)?.name || 'Plan'}
                  onSuccess={() => {
                    onSuccess?.()
                    onClose()
                  }}
                  onError={(msg) => setError(msg || 'Payment failed')}
                />
              </div>
            )}

            {!user?.id && !loading && (
              <p className="payment-note error-banner">Please sign in to upgrade.</p>
            )}

            <p className="payment-note">
              <small>Secure payment with PayPal. Cancel anytime.</small>
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
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default PremiumModal
