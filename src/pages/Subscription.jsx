import { motion } from 'framer-motion'
import { Check, X, Briefcase, Users, MessageCircle, FolderOpen, Zap, Sparkles } from 'lucide-react'
import './Subscription.css'

const Subscription = () => {
  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free',
      price: '0',
      period: 'month',
      description: 'Get started with learning roadmaps',
      features: {
        roadmaps: { value: 'Full access', included: true },
        projects: { value: 'Not available', included: false },
        mentors: { value: 'Not available', included: false },
        chatbot: { value: 'Not available', included: false },
        jobs: { value: 'Not available', included: false },
      },
      cta: 'Current Plan',
      popular: false,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '99',
      period: 'month',
      currency: '₹',
      description: 'Unlock all features to accelerate your career',
      features: {
        roadmaps: { value: 'Full access', included: true },
        projects: { value: 'Unlimited access', included: true },
        mentors: { value: 'Full access', included: true },
        chatbot: { value: 'Unlimited messages', included: true },
        jobs: { value: 'Full access', included: true },
      },
      cta: 'Upgrade to Premium',
      popular: true,
    },
  ]

  const featureCategories = [
    { id: 'roadmaps', label: 'Learning Roadmaps', icon: Zap },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'mentors', label: 'Mentors', icon: Users },
    { id: 'chatbot', label: 'AI Chatbot', icon: MessageCircle },
    { id: 'jobs', label: 'Job Search', icon: Briefcase },
  ]

  return (
    <div className="subscription-page">
      {/* Hero Section */}
      <motion.div 
        className="pricing-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-badge">
          <Sparkles size={16} />
          <span>Choose Your Path</span>
        </div>
        <h1>Unlock Your Career Potential</h1>
        <p>Start free, upgrade when you're ready to accelerate your growth</p>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Active Users</span>
          </div>
          <div className="stat">
            <span className="stat-number">95%</span>
            <span className="stat-label">Success Rate</span>
          </div>
          <div className="stat">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Support</span>
          </div>
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <div className="pricing-grid-two">
        {subscriptionPlans.map((plan, index) => {
          return (
            <motion.div
              key={plan.id}
              className={`pricing-card ${plan.popular ? 'popular' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 + 0.2, duration: 0.5 }}
            >
              {plan.popular && (
                <div className="popular-ribbon">
                  <Sparkles size={14} />
                  Recommended
                </div>
              )}

              <div className="card-header">
                <div className="plan-icon-wrapper">
                  <div className={`plan-icon ${plan.id}`}>
                    {plan.id === 'free' ? <Zap size={24} /> : <Sparkles size={24} />}
                  </div>
                </div>
                
                <div className="plan-title-section">
                  <div className="plan-subtitle">{plan.id === 'free' ? 'Perfect for beginners' : 'Most popular choice'}</div>
                  <h3>{plan.name}</h3>
                  <p className="plan-description">
                    {plan.id === 'free' ? 'Start your learning journey with our comprehensive roadmaps' : 'Get access to all premium features and accelerate your career'}
                  </p>
                </div>

                <div className="price-section">
                  <div className="price-container">
                    <div className="price">
                      <span className="currency">{plan.currency || '₹'}</span>
                      <span className="amount">{plan.price}</span>
                    </div>
                    <div className="period">per {plan.period}</div>
                  </div>
                  {plan.id === 'premium' && (
                    <div className="savings-badge">
                      <span>Save ₹1,188/year</span>
                    </div>
                  )}
                </div>

                <div className="button-container">
                  <button className={`cta-button ${plan.popular ? 'popular' : ''}`}>
                    {plan.cta}
                    {plan.popular && <Sparkles size={16} />}
                  </button>
                </div>
              </div>

              <div className="card-features">
                <div className="features-header">
                  <h4>What's included</h4>
                </div>
                <div className="features-list">
                  {featureCategories.map((category) => {
                    const feature = plan.features[category.id]
                    const Icon = category.icon
                    return (
                      <div key={category.id} className={`feature-item ${feature.included ? 'included' : 'not-included'}`}>
                        <div className="feature-icon">
                          {feature.included ? (
                            <Check size={18} className="check" />
                          ) : (
                            <X size={18} className="cross" />
                          )}
                        </div>
                        <div className="feature-content">
                          <div className="feature-label">
                            <Icon size={16} />
                            <span>{category.label}</span>
                          </div>
                          <div className="feature-value">{feature.value}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Feature Comparison Table */}
      <motion.div 
        className="comparison-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2>Compare plans</h2>
        <div className="comparison-table">
          <div className="table-header">
            <div className="feature-col">Features</div>
            {subscriptionPlans.map(plan => (
              <div key={plan.id} className="plan-col">
                {plan.name}
              </div>
            ))}
          </div>
          {featureCategories.map((category) => {
            const Icon = category.icon
            return (
              <div key={category.id} className="table-row">
                <div className="feature-col">
                  <Icon size={18} />
                  <span>{category.label}</span>
                </div>
                {subscriptionPlans.map(plan => {
                  const feature = plan.features[category.id]
                  return (
                    <div key={plan.id} className="plan-col">
                      {feature.included ? (
                        <div className="check-cell">
                          <Check size={20} />
                        </div>
                      ) : (
                        <div className="cross-cell">
                          <X size={20} />
                        </div>
                      )}
                      <div className="mobile-label">{feature.value}</div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div 
        className="faq-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h2>Frequently asked questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Can I change plans later?</h4>
            <p>Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
          </div>
          <div className="faq-item">
            <h4>What payment methods do you accept?</h4>
            <p>We accept all major credit cards, PayPal, and bank transfers for enterprise plans.</p>
          </div>
          <div className="faq-item">
            <h4>Is there a free trial?</h4>
            <p>Yes! Pro and Enterprise plans come with a 14-day free trial. No credit card required.</p>
          </div>
          <div className="faq-item">
            <h4>Can I cancel anytime?</h4>
            <p>Absolutely. Cancel anytime with no questions asked. You'll have access until the end of your billing period.</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Subscription

