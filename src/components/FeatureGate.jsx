import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, Crown, Zap, ArrowRight } from 'lucide-react'
import subscriptionService from '../services/subscriptionService'
import SubscriptionModal from './SubscriptionModal'
import './FeatureGate.css'

const FeatureGate = ({ 
  userId, 
  feature, 
  children, 
  fallback = null,
  showUpgradePrompt = true,
  className = ''
}) => {
  const [hasAccess, setHasAccess] = useState(true) // Default to true to avoid flash
  const [loading, setLoading] = useState(true)
  const [featureInfo, setFeatureInfo] = useState(null)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  useEffect(() => {
    if (userId && feature) {
      checkAccess()
    }
  }, [userId, feature])

  const checkAccess = async () => {
    setLoading(true)
    try {
      const result = await subscriptionService.checkFeatureAccess(userId, feature)
      if (result.success) {
        setHasAccess(result.access.allowed)
        setFeatureInfo(result.access)
      } else {
        // If check fails, allow access to avoid blocking user
        setHasAccess(true)
      }
    } catch (error) {
      console.error('Error checking feature access:', error)
      // If check fails, allow access to avoid blocking user
      setHasAccess(true)
    } finally {
      setLoading(false)
    }
  }

  const getFeatureDisplayName = (feature) => {
    const names = {
      roadmaps: 'Custom Roadmaps',
      projects: 'Project Recommendations',
      resources: 'Learning Resources',
      opportunities: 'Job Opportunities',
      mentorship: 'Mentorship Access',
      advanced_analytics: 'Advanced Analytics'
    }
    return names[feature] || feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Show loading state
  if (loading) {
    return (
      <div className={`feature-gate-loading ${className}`}>
        {children}
      </div>
    )
  }

  // If user has access, render children
  if (hasAccess) {
    return <div className={className}>{children}</div>
  }

  // If fallback is provided, use it
  if (fallback) {
    return <div className={className}>{fallback}</div>
  }

  // Show upgrade prompt if enabled
  if (showUpgradePrompt) {
    return (
      <>
        <motion.div 
          className={`feature-gate-prompt ${className}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="feature-gate-content">
            <div className="feature-gate-icon">
              <Lock size={32} />
            </div>
            
            <div className="feature-gate-info">
              <h3>Unlock {getFeatureDisplayName(feature)}</h3>
              <p>
                {featureInfo && featureInfo.current_usage >= featureInfo.limit 
                  ? `You've reached your limit of ${featureInfo.limit} ${feature} on the ${featureInfo.plan} plan.`
                  : `This feature is not available on your current plan.`
                }
              </p>
              
              {featureInfo && (
                <div className="usage-info">
                  <div className="usage-bar">
                    <div 
                      className="usage-fill"
                      style={{ 
                        width: `${Math.min((featureInfo.current_usage / featureInfo.limit) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <span className="usage-text">
                    {featureInfo.current_usage} / {featureInfo.limit === 999999 ? '∞' : featureInfo.limit}
                  </span>
                </div>
              )}
            </div>
            
            <button 
              className="upgrade-btn"
              onClick={() => setShowSubscriptionModal(true)}
            >
              <Crown size={20} />
              Upgrade to Pro
              <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="feature-gate-benefits">
            <div className="benefit-item">
              <Zap size={16} />
              <span>Unlimited access to all features</span>
            </div>
            <div className="benefit-item">
              <Crown size={16} />
              <span>Priority support & advanced analytics</span>
            </div>
          </div>
        </motion.div>

        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          userId={userId}
          currentPlan={featureInfo?.plan || 'free'}
        />
      </>
    )
  }

  // Default: don't render anything
  return null
}

export default FeatureGate


