import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import './PaymentModal.css'

const PaymentModal = ({ isOpen, onClose, plan, userId, onSuccess }) => {
  const [step, setStep] = useState('form') // 'form', 'processing', 'success', 'error'
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    email: '',
    phone: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
      if (formattedValue.length > 19) return // Max 16 digits + 3 spaces
    }

    // Format expiry month/year
    if (name === 'expiryMonth' || name === 'expiryYear') {
      formattedValue = value.replace(/\D/g, '')
      if (name === 'expiryMonth' && formattedValue.length > 2) return
      if (name === 'expiryYear' && formattedValue.length > 2) return
    }

    // Format CVV
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '')
      if (formattedValue.length > 4) return
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Card number is required'
    } else if (formData.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Invalid card number'
    }

    if (!formData.expiryMonth) {
      newErrors.expiryMonth = 'Expiry month is required'
    } else if (formData.expiryMonth.length !== 2) {
      newErrors.expiryMonth = 'Invalid month'
    }

    if (!formData.expiryYear) {
      newErrors.expiryYear = 'Expiry year is required'
    } else if (formData.expiryYear.length !== 2) {
      newErrors.expiryYear = 'Invalid year'
    }

    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required'
    } else if (formData.cvv.length < 3) {
      newErrors.cvv = 'Invalid CVV'
    }

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setStep('processing')

    try {
      const response = await fetch('http://localhost:8006/api/subscription/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          plan: plan.id,
          payment_method: 'card',
          card_number: formData.cardNumber.replace(/\s/g, ''),
          expiry_month: formData.expiryMonth,
          expiry_year: formData.expiryYear,
          cvv: formData.cvv,
          cardholder_name: formData.cardholderName,
          email: formData.email,
          phone: formData.phone
        })
      })

      const result = await response.json()

      if (response.ok) {
        setStep('success')
        setTimeout(() => {
          onSuccess(result)
          onClose()
        }, 2000)
      } else {
        setStep('error')
        setTimeout(() => {
          setStep('form')
          setIsLoading(false)
        }, 3000)
      }
    } catch (error) {
      console.error('Payment error:', error)
      setStep('error')
      setTimeout(() => {
        setStep('form')
        setIsLoading(false)
      }, 3000)
    }
  }

  const handleClose = () => {
    if (step === 'processing') return // Don't allow closing during processing
    setStep('form')
    setFormData({
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: '',
      email: '',
      phone: ''
    })
    setErrors({})
    setIsLoading(false)
    onClose()
  }

  const renderForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="payment-form"
    >
      <div className="payment-header">
        <div className="plan-info">
          <h3>Upgrade to {plan.name}</h3>
          <div className="plan-price">
            <span className="currency">₹</span>
            <span className="amount">{plan.price}</span>
            <span className="period">/month</span>
          </div>
        </div>
        <button className="close-btn" onClick={handleClose}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="payment-form-content">
        <div className="form-section">
          <h4>Payment Information</h4>
          
          <div className="form-group">
            <label>Card Number</label>
            <div className="input-wrapper">
              <CreditCard size={20} className="input-icon" />
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                className={errors.cardNumber ? 'error' : ''}
              />
            </div>
            {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Expiry Date</label>
              <div className="expiry-inputs">
                <input
                  type="text"
                  name="expiryMonth"
                  value={formData.expiryMonth}
                  onChange={handleInputChange}
                  placeholder="MM"
                  maxLength="2"
                  className={errors.expiryMonth ? 'error' : ''}
                />
                <span>/</span>
                <input
                  type="text"
                  name="expiryYear"
                  value={formData.expiryYear}
                  onChange={handleInputChange}
                  placeholder="YY"
                  maxLength="2"
                  className={errors.expiryYear ? 'error' : ''}
                />
              </div>
              {(errors.expiryMonth || errors.expiryYear) && (
                <span className="error-text">{errors.expiryMonth || errors.expiryYear}</span>
              )}
            </div>

            <div className="form-group">
              <label>CVV</label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                placeholder="123"
                maxLength="4"
                className={errors.cvv ? 'error' : ''}
              />
              {errors.cvv && <span className="error-text">{errors.cvv}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Cardholder Name</label>
            <input
              type="text"
              name="cardholderName"
              value={formData.cardholderName}
              onChange={handleInputChange}
              placeholder="John Doe"
              className={errors.cardholderName ? 'error' : ''}
            />
            {errors.cardholderName && <span className="error-text">{errors.cardholderName}</span>}
          </div>
        </div>

        <div className="form-section">
          <h4>Contact Information</h4>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john@example.com"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+91 98765 43210"
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>
        </div>

        <div className="security-info">
          <Lock size={16} />
          <span>Your payment information is secure and encrypted</span>
        </div>

        <button type="submit" className="pay-button" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Pay ₹{plan.price}
            </>
          )}
        </button>
      </form>
    </motion.div>
  )

  const renderProcessing = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="processing-state"
    >
      <div className="processing-icon">
        <Loader2 size={48} className="animate-spin" />
      </div>
      <h3>Processing Payment</h3>
      <p>Please don't close this window while we process your payment...</p>
    </motion.div>
  )

  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="success-state"
    >
      <div className="success-icon">
        <CheckCircle size={48} />
      </div>
      <h3>Payment Successful!</h3>
      <p>Welcome to {plan.name}! Your subscription is now active.</p>
      <div className="success-details">
        <div className="detail-item">
          <span>Plan:</span>
          <span>{plan.name}</span>
        </div>
        <div className="detail-item">
          <span>Amount:</span>
          <span>₹{plan.price}/month</span>
        </div>
        <div className="detail-item">
          <span>Status:</span>
          <span className="status-active">Active</span>
        </div>
      </div>
    </motion.div>
  )

  const renderError = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="error-state"
    >
      <div className="error-icon">
        <AlertCircle size={48} />
      </div>
      <h3>Payment Failed</h3>
      <p>There was an error processing your payment. Please try again.</p>
      <button className="retry-button" onClick={() => setStep('form')}>
        Try Again
      </button>
    </motion.div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="payment-modal-overlay"
          onClick={step === 'form' ? handleClose : undefined}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="payment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {step === 'form' && renderForm()}
            {step === 'processing' && renderProcessing()}
            {step === 'success' && renderSuccess()}
            {step === 'error' && renderError()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PaymentModal
