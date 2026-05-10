import { motion, AnimatePresence } from 'framer-motion'
import { Check, User, TrendingUp, Building2, X } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PayPalButtons from '../components/PayPalButtons'
import subscriptionService from '../services/subscriptionService'
import './Subscription.css'

const PLAN_RANK = { free: 0, premium: 1, enterprise: 2 }

/** Avoid truthy whitespace-only ids or raw `{ $oid }` objects from bad localStorage JSON */
function normalizeStoredUserId(user) {
  if (!user || typeof user !== 'object') return null
  const raw = user._id ?? user.id
  if (raw == null || raw === '') return null
  if (typeof raw === 'object' && raw !== null && '$oid' in raw) return String(raw.$oid).trim() || null
  const s = String(raw).trim()
  return s || null
}

const TIERS = [
  {
    backendPlan: 'free',
    marketingName: 'Business',
    audience: 'For solo entrepreneurs',
    Icon: User,
    priceRupee: 0,
    features: [
      'Full learning roadmaps',
      'Community access',
      'Core career toolkit',
      'Email support',
    ],
    popular: false,
  },
  {
    backendPlan: 'premium',
    marketingName: 'Advanced',
    audience: 'As your business scales',
    Icon: TrendingUp,
    priceRupee: 99,
    features: [
      'Everything in Business',
      'Unlimited projects & mentors',
      'AI career chatbot',
      'Job search & applications',
      'Enhanced support',
    ],
    popular: true,
  },
  {
    backendPlan: 'enterprise',
    marketingName: 'Plus',
    audience: 'For more complex businesses',
    Icon: Building2,
    priceRupee: 2999,
    features: [
      'Everything in Advanced',
      'Team collaboration',
      'API access',
      'White-label options',
      'Priority phone support',
    ],
    popular: false,
  },
]

const COMPARISON_ROWS = [
  { label: 'Learning roadmaps', free: true, premium: true, enterprise: true },
  { label: 'Projects & portfolio', free: false, premium: true, enterprise: true },
  { label: 'Mentor matching', free: false, premium: true, enterprise: true },
  { label: 'AI chatbot', free: false, premium: true, enterprise: true },
  { label: 'Job search tools', free: false, premium: true, enterprise: true },
  { label: 'Team & collaboration', free: false, premium: false, enterprise: true },
  { label: 'API access', free: false, premium: false, enterprise: true },
]

function effectivePlan(sub) {
  if (!sub || sub.status !== 'active') return 'free'
  return PLAN_RANK[sub.plan] !== undefined ? sub.plan : 'free'
}

const Subscription = () => {
  const navigate = useNavigate()
  const [userSubscription, setUserSubscription] = useState(null)
  const [userId, setUserId] = useState(null)
  const [checkoutTier, setCheckoutTier] = useState(null)
  const [paymentError, setPaymentError] = useState(null)

  const fetchUserSubscription = useCallback(async (uid) => {
    if (!uid) return
    try {
      const result = await subscriptionService.getUserSubscription(uid)
      if (result.success && result.data?.subscription) {
        setUserSubscription(result.data.subscription)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }, [])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const uid = normalizeStoredUserId(user)
    setUserId(uid)
    if (uid) fetchUserSubscription(uid)
  }, [fetchUserSubscription])

  const current = effectivePlan(userSubscription)

  const handlePayPalSuccess = useCallback(async () => {
    if (userId) await fetchUserSubscription(userId)
    setCheckoutTier(null)
    navigate('/subscription/success')
  }, [userId, fetchUserSubscription, navigate])

  const openCheckout = (tier) => {
    setPaymentError(null)
    if (!userId) {
      setPaymentError('Please sign in to subscribe.')
      return
    }
    if (tier.backendPlan === 'free') return
    setCheckoutTier(tier)
  }

  const tierCta = (tier) => {
    const r = PLAN_RANK[tier.backendPlan]
    const c = PLAN_RANK[current]
    if (r === c) {
      return { label: 'Current plan', disabled: true, variant: 'muted' }
    }
    if (r < c) {
      return { label: 'Lower tier', disabled: true, variant: 'ghost' }
    }
    return {
      label: `Subscribe with PayPal`,
      disabled: false,
      variant: tier.popular ? 'primary' : 'outline',
    }
  }

  return (
    <div className="sub-page">
      <motion.header
        className="sub-hero"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <p className="sub-hero-kicker">
          {current === 'free' ? 'Pricing' : 'Your subscription'}
        </p>
        <h1 className="sub-hero-title">
          {current === 'free'
            ? 'Plans that grow with you'
            : 'Manage your PathWise plan'}
        </h1>
        <p className="sub-hero-lead">
          {current === 'free'
            ? 'Start free and upgrade when you need more power. Secure checkout with PayPal.'
            : 'You are on a paid PathWise tier. Upgrade further or keep enjoying full access.'}
        </p>
      </motion.header>

      {paymentError && (
        <div className="sub-alert" role="alert">
          {paymentError}
        </div>
      )}

      <div className="sub-tiers">
        {TIERS.map((tier, index) => {
          const { Icon } = tier
          const cta = tierCta(tier)
          return (
            <motion.article
              key={tier.backendPlan}
              className={`sub-tier ${tier.popular ? 'sub-tier--popular' : ''}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * index, duration: 0.4 }}
            >
              {tier.popular && (
                <span className="sub-tier-popular-pill" aria-label="Popular plan">
                  POPULAR
                </span>
              )}
              <div className="sub-tier-head">
                <div className="sub-tier-icon-wrap" aria-hidden>
                  <Icon className="sub-tier-icon" strokeWidth={1.75} size={22} />
                </div>
                <div>
                  <h2 className="sub-tier-name">{tier.marketingName}</h2>
                  <p className="sub-tier-audience">{tier.audience}</p>
                </div>
              </div>

              <div className="sub-tier-price-block">
                <div className="sub-tier-price">
                  <span className="sub-tier-currency">₹</span>
                  <span className="sub-tier-amount">
                    {tier.priceRupee.toLocaleString('en-IN')}
                  </span>
                  <span className="sub-tier-period">/month</span>
                </div>
              </div>

              <button
                type="button"
                className={`sub-tier-cta sub-tier-cta--${cta.variant}`}
                disabled={cta.disabled}
                onClick={() => openCheckout(tier)}
              >
                {cta.label}
              </button>

              <ul className="sub-tier-features">
                {tier.features.map((f) => (
                  <li key={f}>
                    <span className="sub-tier-check" aria-hidden>
                      <Check size={14} strokeWidth={2.5} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.article>
          )
        })}
      </div>

      <AnimatePresence>
        {checkoutTier && userId && (
          <motion.div
            className="sub-paypal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCheckoutTier(null)}
          >
            <motion.div
              className="sub-paypal-modal"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="sub-paypal-close"
                aria-label="Close"
                onClick={() => setCheckoutTier(null)}
              >
                <X size={20} />
              </button>
              <h3 className="sub-paypal-title">Pay with PayPal</h3>
              <p className="sub-paypal-sub">
                {checkoutTier.marketingName} — ₹
                {checkoutTier.priceRupee.toLocaleString('en-IN')}/month
              </p>
              <PayPalButtons
                key={checkoutTier.backendPlan}
                userId={userId}
                planId={checkoutTier.backendPlan}
                planLabel={checkoutTier.marketingName}
                onSuccess={handlePayPalSuccess}
                onError={(msg) => setPaymentError(msg)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section
        className="sub-compare"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <h2 className="sub-section-title">Compare plans</h2>
        <div className="sub-compare-table-wrap">
          <table className="sub-compare-table">
            <thead>
              <tr>
                <th scope="col">Features</th>
                <th scope="col">Business</th>
                <th scope="col">Advanced</th>
                <th scope="col">Plus</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>
                    {row.free ? (
                      <Check className="sub-compare-yes" size={20} />
                    ) : (
                      <span className="sub-compare-no">—</span>
                    )}
                  </td>
                  <td>
                    {row.premium ? (
                      <Check className="sub-compare-yes" size={20} />
                    ) : (
                      <span className="sub-compare-no">—</span>
                    )}
                  </td>
                  <td>
                    {row.enterprise ? (
                      <Check className="sub-compare-yes" size={20} />
                    ) : (
                      <span className="sub-compare-no">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      <motion.section
        className="sub-faq"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        <h2 className="sub-section-title">Frequently asked questions</h2>
        <div className="sub-faq-grid">
          <div className="sub-faq-item">
            <h3>How do I pay?</h3>
            <p>
              Use your PayPal account or pay as a guest with a card where PayPal allows it. Currency
              is charged in INR for these plans.
            </p>
          </div>
          <div className="sub-faq-item">
            <h3>Can I cancel?</h3>
            <p>
              Yes. Cancel from Settings → Subscription. You keep access until the end of the paid
              period where applicable.
            </p>
          </div>
          <div className="sub-faq-item">
            <h3>Is my payment secure?</h3>
            <p>
              Payment is processed by PayPal. PathWise does not receive or store your full card
              number.
            </p>
          </div>
          <div className="sub-faq-item">
            <h3>Can I change plans later?</h3>
            <p>
              You can move to a higher tier anytime. Downgrades may need support so billing stays
              accurate.
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

export default Subscription
