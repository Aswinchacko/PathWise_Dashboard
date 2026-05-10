import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff, Check } from 'lucide-react'
import authService from '../services/authService'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (authService.isAuthenticated()) {
      if (authService.isAdmin()) {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    }
  }, [navigate])

  const handleGoogleSignIn = useCallback(async (response) => {
    setIsLoading(true)
    setErrors({})

    try {
      const result = await authService.googleLogin(response.credential)
      setIsSuccess(true)

      setTimeout(() => {
        if (result.user.isAdmin) {
          navigate('/admin')
        } else {
          navigate('/dashboard')
        }
      }, 1000)
    } catch (error) {
      console.error('Google login error:', error)
      setErrors({
        general: error.message || 'Google login failed. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  /** Stable ref so GIS initialize() doesn’t close over a stale handler when Strict Mode re-runs effects */
  const googleSignInRef = useRef(handleGoogleSignIn)
  googleSignInRef.current = handleGoogleSignIn

  useEffect(() => {
    let cancelled = false
    const SCRIPT_ID = 'google-gsi-client'

    const teardownGoogle = () => {
      try {
        window.google?.accounts?.id?.cancel()
      } catch {
        /* ignore */
      }
    }

    const initGoogleSignIn = () => {
      if (cancelled || !window.google?.accounts?.id) return

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      if (!clientId || clientId === 'your_google_client_id_here') {
        console.error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in .env file')
        return
      }

      teardownGoogle()

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (credentialResponse) => googleSignInRef.current(credentialResponse),
        })

        const buttonElement = document.getElementById('google-signin-button')
        if (buttonElement) {
          buttonElement.innerHTML = ''
          window.google.accounts.id.renderButton(buttonElement, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: buttonElement.offsetWidth || 320,
          })
        }
      } catch (error) {
        console.error('Google Sign-In initialization error:', error)
      }
    }

    let script = document.getElementById(SCRIPT_ID)
    if (!script) {
      script = document.createElement('script')
      script.id = SCRIPT_ID
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        if (!cancelled) initGoogleSignIn()
      }
      script.onerror = () => {
        console.error('Failed to load Google Sign-In script')
      }
      document.head.appendChild(script)
    } else if (window.google?.accounts?.id) {
      initGoogleSignIn()
    } else {
      script.addEventListener('load', () => !cancelled && initGoogleSignIn(), { once: true })
    }

    return () => {
      cancelled = true
      teardownGoogle()
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    let sanitizedValue = value
    if (type === 'email') {
      sanitizedValue = value.toLowerCase().trim()
    } else if (type === 'text' || type === 'password') {
      sanitizedValue = value.trim()
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : sanitizedValue,
    }))

    if (type !== 'checkbox') {
      validateField(name, sanitizedValue)
    }
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return false
    const parts = email.split('@')
    if (parts.length !== 2) return false
    const [localPart, domainPart] = parts
    if (!localPart || localPart.length === 0) return false
    if (!domainPart || domainPart.length < 4) return false
    if (!domainPart.includes('.')) return false
    const domainParts = domainPart.split('.')
    if (domainParts.length < 2) return false
    const tld = domainParts[domainParts.length - 1]
    if (!tld || tld.length < 2) return false
    const domainName = domainParts.slice(0, -1).join('.')
    if (!domainName || domainName.length < 2) return false
    if (!/[a-zA-Z]/.test(domainName)) return false
    return true
  }

  const validatePassword = (password) => {
    const errs = []
    if (password.length < 8) errs.push('Password must be at least 8 characters long')
    if (!/[A-Z]/.test(password)) errs.push('Password must contain at least one uppercase letter')
    if (!/[a-z]/.test(password)) errs.push('Password must contain at least one lowercase letter')
    if (!/\d/.test(password)) errs.push('Password must contain at least one number')
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errs.push('Password must contain at least one special character')
    return errs
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    } else if (formData.email.length > 254) {
      newErrors.email = 'Email address is too long'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else {
      const passwordErrors = validatePassword(formData.password)
      if (passwordErrors.length > 0) newErrors.password = passwordErrors[0]
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateField = (name, value) => {
    const newErrors = { ...errors }

    switch (name) {
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required'
        } else if (!validateEmail(value)) {
          newErrors.email = 'Please enter a valid email address'
        } else if (value.length > 254) {
          newErrors.email = 'Email address is too long'
        } else {
          delete newErrors.email
        }
        break
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required'
        } else {
          const passwordErrors = validatePassword(value)
          if (passwordErrors.length > 0) {
            newErrors.password = passwordErrors[0]
          } else {
            delete newErrors.password
          }
        }
        break
      default:
        break
    }

    setErrors(newErrors)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})
    try {
      const result = await authService.login(formData.email, formData.password)
      setIsSuccess(true)
      setTimeout(() => {
        if (result.user.isAdmin) {
          navigate('/admin')
        } else {
          navigate('/dashboard')
        }
      }, 1000)
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ general: error.message || 'Login failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__content">
        <motion.section
          className="login-container"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="login-form-section">
            <div className="login-card__header">
              <h1 className="login-card__title">Welcome Back</h1>
              <p className="login-card__subtitle">Sign in to continue your PathWise journey</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              {isSuccess && (
                <motion.div className="login-banner login-banner--success" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                  <CheckCircle size={18} />
                  <span>Login successful! Redirecting…</span>
                </motion.div>
              )}

              {errors.general && (
                <motion.div className="login-banner login-banner--error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                  <AlertCircle size={16} />
                  {errors.general}
                </motion.div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <User size={20} className="input-icon" aria-hidden />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    className={errors.email ? 'error' : ''}
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    autoComplete="email"
                    maxLength={254}
                  />
                </div>
                {errors.email && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper input-wrapper--password">
                  <Lock size={20} className="input-icon" aria-hidden />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    className={errors.password ? 'error' : ''}
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    autoComplete="current-password"
                    maxLength={128}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    {errors.password}
                  </div>
                )}
                {formData.password && !errors.password && (
                  <div className="field-hint">
                    <CheckCircle size={14} />
                    <span>Password looks good!</span>
                  </div>
                )}
              </div>

              <div className="login-row">
                <label className="login-remember">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <span className="login-remember__text">Remember me</span>
                </label>
                <Link to="/forgot-password" className="login-link-muted">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" className="login-submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="login-submit__spinner" aria-hidden />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="login-submit__arrow" size={20} />
                  </>
                )}
              </button>

              <div className="login-divider">
                <span className="login-divider__line" />
                <span className="login-divider__text">OR CONTINUE WITH</span>
                <span className="login-divider__line" />
              </div>

              <div className="login-google-shell">
                <div id="google-signin-button" className="login-google-mount" />
                {(!import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID === 'your_google_client_id_here') && (
                  <p className="login-google-fallback">Google Sign-In is not configured</p>
                )}
              </div>

              <p className="login-footer">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="login-footer__link">
                  Sign Up
                </Link>
              </p>
            </form>
          </div>

          <div className="login-hero">
            <div className="login-hero__badge">
              <span>🎯</span>
              <span>PathWise Access</span>
            </div>
            <h2>Continue Your Learning Journey</h2>
            <p>Access your roadmap, mentors, and projects in one place with your personalized dashboard.</p>
            <div className="login-hero__benefits">
              <div className="login-hero__benefit">
                <Check size={18} />
                <span>Track roadmap milestones</span>
              </div>
              <div className="login-hero__benefit">
                <Check size={18} />
                <span>Connect with expert mentors</span>
              </div>
              <div className="login-hero__benefit">
                <Check size={18} />
                <span>Build job-ready projects</span>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}

export default Login
