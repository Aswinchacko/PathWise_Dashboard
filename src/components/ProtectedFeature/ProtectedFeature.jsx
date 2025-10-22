import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, Crown, Loader2 } from 'lucide-react'
import './ProtectedFeature.css'
import subscriptionService from '../../services/subscriptionService'
import authService from '../../services/authService'
import PremiumModal from '../PremiumModal/PremiumModal'

const ProtectedFeature = ({ 
  children, 
  feature = 'projects',
  loadingComponent = null,
  blockedComponent = null 
}) => {
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [featureInfo, setFeatureInfo] = useState(null)

  useEffect(() => {
    checkAccess()
  }, [feature])

  const checkAccess = async () => {
    setLoading(true)
    try {
      const user = authService.getCurrentUser()
      if (!user || !user.id) {
        setHasAccess(false)
        setLoading(false)
        return
      }

      const result = await subscriptionService.checkFeatureAccess(user.id, feature)
      if (result.success) {
        setHasAccess(result.access.allowed)
        setFeatureInfo(result.access)
      } else {
        setHasAccess(false)
      }
    } catch (error) {
      console.error('Error checking feature access:', error)
      setHasAccess(false)
    }
    setLoading(false)
  }

  const handleUpgradeSuccess = () => {
    checkAccess()
  }

  if (loading) {
    if (loadingComponent) {
      return loadingComponent
    }
    return (
      <div className="protected-feature-loading">
        <Loader2 className="spinner" size={48} />
        <p>Checking access...</p>
      </div>
    )
  }

  if (!hasAccess) {
    if (blockedComponent) {
      return blockedComponent
    }
    
    return (
      <>
        <motion.div 
          className="protected-feature-blocked"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="blocked-content">
            <div className="blocked-icon">
              <Lock size={64} />
              <div className="crown-badge">
                <Crown size={24} />
              </div>
            </div>
            
            <h2>Premium Feature</h2>
            <p className="blocked-message">
              This feature is available for premium members only. Upgrade now to unlock unlimited projects and all premium features!
            </p>
            
            {featureInfo && (
              <div className="usage-info">
                <p>
                  <strong>Current Plan:</strong> {featureInfo.plan === 'free' ? 'Free' : featureInfo.plan}
                </p>
                {featureInfo.plan === 'free' && (
                  <p className="limit-info">
                    You've used {featureInfo.current_usage} out of {featureInfo.limit} free {feature}
                  </p>
                )}
              </div>
            )}

            <div className="premium-features">
              <h3>What you'll get with Premium:</h3>
              <div className="features-grid">
                <div className="feature-item">
                  <Crown size={20} />
                  <span>Unlimited Projects</span>
                </div>
                <div className="feature-item">
                  <Crown size={20} />
                  <span>Unlimited Roadmaps</span>
                </div>
                <div className="feature-item">
                  <Crown size={20} />
                  <span>Advanced Analytics</span>
                </div>
                <div className="feature-item">
                  <Crown size={20} />
                  <span>Priority Support</span>
                </div>
                <div className="feature-item">
                  <Crown size={20} />
                  <span>Custom Roadmaps</span>
                </div>
                <div className="feature-item">
                  <Crown size={20} />
                  <span>Mentorship Access</span>
                </div>
              </div>
            </div>

            <button 
              className="btn-upgrade-premium"
              onClick={() => setShowPremiumModal(true)}
            >
              <Crown size={20} />
              Upgrade to Premium
            </button>
          </div>
        </motion.div>

        <PremiumModal 
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          onSuccess={handleUpgradeSuccess}
          feature={feature}
        />
      </>
    )
  }

  return children
}

export default ProtectedFeature


