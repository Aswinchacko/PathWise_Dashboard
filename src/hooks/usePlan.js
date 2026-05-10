import { useCallback, useEffect, useState } from 'react'
import subscriptionService from '../services/subscriptionService'

const PLAN_RANK = { free: 0, premium: 1, enterprise: 2 }

const PAID_FEATURES = new Set([
  'projects',
  'mentors',
  'jobs',
  'micro-learning',
  'micro_learning',
  'microlearning',
])

function readStoredUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user || typeof user !== 'object') return null
    const raw = user._id ?? user.id
    if (raw == null || raw === '') return null
    if (typeof raw === 'object' && '$oid' in raw) return String(raw.$oid).trim() || null
    const s = String(raw).trim()
    return s || null
  } catch {
    return null
  }
}

export default function usePlan() {
  const [plan, setPlan] = useState('free')
  const [status, setStatus] = useState('inactive')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

  const fetchPlan = useCallback(async () => {
    const uid = readStoredUserId()
    setUserId(uid)
    if (!uid) {
      setPlan('free')
      setStatus('inactive')
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await subscriptionService.getUserSubscription(uid)
      if (res.success && res.data?.subscription) {
        const sub = res.data.subscription
        const effective =
          sub.status === 'active' && PLAN_RANK[sub.plan] !== undefined ? sub.plan : 'free'
        setPlan(effective)
        setStatus(sub.status || 'inactive')
      } else {
        setPlan('free')
        setStatus('inactive')
      }
    } catch (e) {
      console.error('usePlan: failed to load subscription', e)
      setPlan('free')
      setStatus('inactive')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlan()
    const onStorage = (ev) => {
      if (ev.key === 'user' || ev.key === 'token') fetchPlan()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [fetchPlan])

  const rank = PLAN_RANK[plan] ?? 0
  const isPaid = rank >= 1
  const isEnterprise = rank >= 2

  const hasFeature = useCallback(
    (feature) => {
      if (!feature) return true
      if (PAID_FEATURES.has(feature)) return isPaid
      return true
    },
    [isPaid]
  )

  return {
    plan,
    status,
    loading,
    userId,
    isPaid,
    isEnterprise,
    hasFeature,
    refresh: fetchPlan,
  }
}

export { PLAN_RANK, PAID_FEATURES }
