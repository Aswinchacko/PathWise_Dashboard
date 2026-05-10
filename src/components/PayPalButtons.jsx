import { useEffect, useRef, useState } from 'react'
import subscriptionService from '../services/subscriptionService'
import './PayPalButtons.css'

function loadPayPalSdk(clientId, currency) {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.paypal) {
      resolve()
      return
    }
    const existing = document.querySelector('script[data-paypal-sdk]')
    if (existing) {
      if (window.paypal) {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', reject)
      return
    }
    const script = document.createElement('script')
    script.dataset.paypalSdk = '1'
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load PayPal SDK'))
    document.body.appendChild(script)
  })
}

/**
 * PayPal Smart Buttons, or dev mock activator when PAYPAL_MOCK_MODE / no credentials.
 */
export default function PayPalButtons({ userId, planId, planLabel = 'Plan', onSuccess, onError }) {
  const hostRef = useRef(null)
  const [devBusy, setDevBusy] = useState(false)
  const [mode, setMode] = useState('loading')

  useEffect(() => {
    let destroyed = false

    async function run() {
      const cfg = await subscriptionService.getPaymentConfig()
      if (!cfg.success) {
        onError?.(cfg.error || 'Config failed')
        setMode('mock')
        return
      }

      if (cfg.mockMode) {
        setMode('mock')
        return
      }

      if (!cfg.paypalClientId) {
        onError?.('PayPal client id missing. Set PAYPAL_CLIENT_ID in subscription_service .env.')
        setMode('mock')
        return
      }

      try {
        await loadPayPalSdk(cfg.paypalClientId, cfg.currency || 'INR')
      } catch (e) {
        onError?.(e.message)
        setMode('mock')
        return
      }

      if (destroyed || !hostRef.current || !window.paypal) return

      hostRef.current.innerHTML = ''

      window.paypal
        .Buttons({
          style: { layout: 'vertical', shape: 'rect', label: 'pay' },
          createOrder: async () => {
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            const prefill = {
              email: user.email || undefined,
              name:
                user.full_name ||
                [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
                undefined,
              contact: user.phone || undefined,
            }
            const res = await subscriptionService.createOrder(userId, planId, prefill)
            if (!res.success) {
              throw new Error(res.error || 'Could not create order')
            }
            return res.orderData.paypal_order_id
          },
          onApprove: async (data) => {
            const cap = await subscriptionService.capturePayment({
              paypal_order_id: data.orderID,
              user_id: userId,
              plan: planId,
            })
            if (cap.success) {
              onSuccess?.()
            } else {
              onError?.(cap.error || 'Capture failed')
            }
          },
          onError: (err) => {
            onError?.(err?.message || 'PayPal error')
          },
        })
        .render(hostRef.current)

      setMode('sdk')
    }

    run()
    return () => {
      destroyed = true
      if (hostRef.current) {
        hostRef.current.innerHTML = ''
      }
    }
  }, [userId, planId])

  const runMockActivate = async () => {
    setDevBusy(true)
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const prefill = {
        email: user.email || undefined,
        name:
          user.full_name ||
          [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
          undefined,
        contact: user.phone || undefined,
      }
      const res = await subscriptionService.createOrder(userId, planId, prefill)
      if (!res.success) {
        throw new Error(res.error || 'Create order failed')
      }
      const cap = await subscriptionService.capturePayment({
        paypal_order_id: res.orderData.paypal_order_id,
        user_id: userId,
        plan: planId,
      })
      if (cap.success) {
        onSuccess?.()
      } else {
        onError?.(cap.error || 'Capture failed')
      }
    } catch (e) {
      onError?.(e.message || 'Mock checkout failed')
    } finally {
      setDevBusy(false)
    }
  }

  if (mode === 'mock') {
    return (
      <div className="paypal-mock-panel">
        <p className="paypal-mock-hint">
          PayPal mock / dev mode — no real PayPal window. Add sandbox credentials for full checkout.
        </p>
        <button
          type="button"
          className="paypal-mock-btn"
          disabled={devBusy}
          onClick={runMockActivate}
        >
          {devBusy ? 'Activating…' : `Activate ${planLabel} (dev)`}
        </button>
      </div>
    )
  }

  return (
    <div className="paypal-buttons-wrap">
      {mode === 'loading' && <p className="paypal-loading">Loading PayPal…</p>}
      <div ref={hostRef} className="paypal-button-host" />
    </div>
  )
}
