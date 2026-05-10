import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Crown, ArrowRight, Sparkles } from 'lucide-react'
import subscriptionService from '../services/subscriptionService'
import authService from '../services/authService'
import './SubscriptionSuccess.css'

const SubscriptionSuccess = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [subscriptionInfo, setSubscriptionInfo] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSubscriptionInfo()
  }, [])

  const loadSubscriptionInfo = async () => {
    try {
      const user = authService.getCurrentUser()
      if (!user) {
        navigate('/login')
        return
      }

      const result = await subscriptionService.getUserSubscription(user.id)
      if (result.success) {
        setSubscriptionInfo(result.data)
      } else {
        setError('Failed to load subscription information')
      }
    } catch (err) {
      setError('Error loading subscription information')
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    navigate('/dashboard')
  }

  const handleSettings = () => {
    navigate('/settings')
  }

  if (loading) {
    return (
      <div className="subscription-success-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your subscription details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="subscription-success-page">
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="continue-btn">
            Continue to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="subscription-success-page">
      <motion.div
        className="success-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="success-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle size={80} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Welcome to PathWise Pro!
        </motion.h1>

        <motion.p
          className="success-message"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Your subscription has been activated successfully. You now have access to all premium features!
        </motion.p>

        {subscriptionInfo && (
          <motion.div
            className="subscription-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="plan-info">
              <Crown className="plan-icon" />
              <div>
                <h3>{subscriptionInfo.plan_details.name}</h3>
                <p>
                  {subscriptionInfo.plan_details.price_display ||
                    `₹${subscriptionInfo.plan_details.price}/month`}
                </p>
              </div>
            </div>
            
            <div className="features-preview">
              <h4>What you get:</h4>
              <ul>
                <li>
                  <Sparkles size={16} />
                  Unlimited custom roadmaps
                </li>
                <li>
                  <Sparkles size={16} />
                  Unlimited project recommendations
                </li>
                <li>
                  <Sparkles size={16} />
                  Access to job opportunities
                </li>
                <li>
                  <Sparkles size={16} />
                  Priority support
                </li>
                <li>
                  <Sparkles size={16} />
                  Advanced analytics
                </li>
              </ul>
            </div>
          </motion.div>
        )}

        <motion.div
          className="action-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <button onClick={handleContinue} className="continue-btn primary">
            <ArrowRight size={20} />
            Start Exploring
          </button>
          <button onClick={handleSettings} className="continue-btn secondary">
            Manage Subscription
          </button>
        </motion.div>

        <motion.div
          className="celebration-animation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="confetti"
              initial={{ y: -100, x: Math.random() * 100 - 50, rotate: 0 }}
              animate={{ 
                y: window.innerHeight + 100, 
                x: Math.random() * 100 - 50,
                rotate: 360
              }}
              transition={{ 
                duration: 3,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default SubscriptionSuccess


