import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { XCircle, ArrowLeft, Crown, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import './SubscriptionCancel.css'

const SubscriptionCancel = () => {
  const navigate = useNavigate()
  const [feedback, setFeedback] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const handleRetry = () => {
    navigate('/settings')
  }

  const handleContinue = () => {
    navigate('/dashboard')
  }

  const handleFeedbackSubmit = () => {
    // Here you would typically send the feedback to your backend
    console.log('User feedback:', feedback)
    setFeedbackSubmitted(true)
    setTimeout(() => {
      setFeedbackSubmitted(false)
      setFeedback('')
    }, 3000)
  }

  return (
    <div className="subscription-cancel-page">
      <motion.div
        className="cancel-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="cancel-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <XCircle size={80} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Payment Cancelled
        </motion.h1>

        <motion.p
          className="cancel-message"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          No worries! Your payment was cancelled and you haven't been charged. You can try again anytime or continue with the free plan.
        </motion.p>

        <motion.div
          className="what-you-missed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="missed-features">
            <Crown className="crown-icon" />
            <h3>What you would have unlocked:</h3>
            <ul>
              <li>✨ Unlimited custom roadmaps</li>
              <li>🚀 Unlimited project recommendations</li>
              <li>💼 Access to job opportunities</li>
              <li>📊 Advanced analytics and insights</li>
              <li>🎯 Priority support</li>
              <li>🔮 AI-powered career guidance</li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          className="feedback-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <h4>Help us improve</h4>
          <p>What made you change your mind? Your feedback helps us make PathWise better.</p>
          <div className="feedback-form">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what happened... (optional)"
              rows={3}
            />
            <button 
              onClick={handleFeedbackSubmit}
              className="feedback-btn"
              disabled={!feedback.trim() || feedbackSubmitted}
            >
              <MessageCircle size={16} />
              {feedbackSubmitted ? 'Thanks for your feedback!' : 'Send Feedback'}
            </button>
          </div>
        </motion.div>

        <motion.div
          className="action-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <button onClick={handleRetry} className="retry-btn">
            <Crown size={20} />
            Try Again
          </button>
          <button onClick={handleContinue} className="continue-btn">
            <ArrowLeft size={20} />
            Continue with Free Plan
          </button>
        </motion.div>

        <motion.div
          className="reassurance"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <p>
            <strong>Still interested?</strong> You can upgrade anytime from your settings page. 
            We also offer a 30-day money-back guarantee!
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default SubscriptionCancel


