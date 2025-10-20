import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle, Github, Linkedin, Twitter, Check
} from 'lucide-react'
import authService from '../services/authService'
import './Register.css'
import React from 'react'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    subscribeNewsletter: true
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSuccess, setIsSuccess] = useState(false)

  // Redirect if already authenticated
  React.useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard')
    }
  }, [navigate])

  // Initialize Google Sign-In
  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id_here',
          callback: handleGoogleSignIn
        })
        
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { 
            theme: 'outline', 
            size: 'large',
            text: 'signup_with',
            shape: 'rectangular',
            width: '100%'
          }
        )
      }
    }

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  const handleGoogleSignIn = async (response) => {
    setIsLoading(true)
    setErrors({})
    
    try {
      await authService.googleLogin(response.credential)
      setIsSuccess(true)
      
      // Redirect to dashboard after successful registration
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (error) {
      console.error('Google registration error:', error)
      setErrors({ general: error.message || 'Google registration failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    // Sanitize input
    let sanitizedValue = value
    if (type === 'email') {
      sanitizedValue = value.toLowerCase().trim()
    } else if (type === 'text') {
      sanitizedValue = value.trim()
    } else if (type === 'password') {
      sanitizedValue = value // Don't trim passwords
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : sanitizedValue
    }))
    
    // Real-time validation
    if (type !== 'checkbox') {
      validateField(name, sanitizedValue)
    }
  }

  // Enhanced validation functions
  const validateEmail = (email) => {
    // Basic email structure check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!emailRegex.test(email)) {
      return false
    }
    
    // Split email into parts
    const parts = email.split('@')
    if (parts.length !== 2) {
      return false
    }
    
    const [localPart, domainPart] = parts
    
    // Check local part (before @)
    if (!localPart || localPart.length === 0) {
      return false
    }
    
    // Check domain part (after @)
    if (!domainPart || domainPart.length < 4) {
      return false
    }
    
    // Domain must contain at least one dot
    if (!domainPart.includes('.')) {
      return false
    }
    
    // Split domain by dots
    const domainParts = domainPart.split('.')
    if (domainParts.length < 2) {
      return false
    }
    
    // TLD (last part) must be at least 2 characters
    const tld = domainParts[domainParts.length - 1]
    if (!tld || tld.length < 2) {
      return false
    }
    
    // Domain name (before TLD) must be at least 2 characters
    const domainName = domainParts.slice(0, -1).join('.')
    if (!domainName || domainName.length < 2) {
      return false
    }
    
    // Additional check: domain name should contain letters, not just numbers
    if (!/[a-zA-Z]/.test(domainName)) {
      return false
    }
    
    return true
  }

  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s'-]{2,50}$/
    return nameRegex.test(name.trim())
  }

  const validatePassword = (password) => {
    const errors = []
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }
    return errors
  }

  const validateForm = () => {
    const newErrors = {}
    
    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    } else if (!validateName(formData.firstName)) {
      newErrors.firstName = 'First name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes'
    }
    
    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    } else if (!validateName(formData.lastName)) {
      newErrors.lastName = 'Last name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes'
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    } else if (formData.email.length > 254) {
      newErrors.email = 'Email address is too long'
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else {
      const passwordErrors = validatePassword(formData.password)
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors[0] // Show first error
      }
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Real-time validation
  const validateField = (name, value) => {
    const newErrors = { ...errors }
    
    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          newErrors.firstName = 'First name is required'
        } else if (!validateName(value)) {
          newErrors.firstName = 'First name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes'
        } else {
          delete newErrors.firstName
        }
        break
        
      case 'lastName':
        if (!value.trim()) {
          newErrors.lastName = 'Last name is required'
        } else if (!validateName(value)) {
          newErrors.lastName = 'Last name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes'
        } else {
          delete newErrors.lastName
        }
        break
        
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
        
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password'
        } else if (formData.password !== value) {
          newErrors.confirmPassword = 'Passwords do not match'
        } else {
          delete newErrors.confirmPassword
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
      await authService.register(formData.firstName, formData.lastName, formData.email, formData.password)
      setIsSuccess(true)
      
      // Redirect to dashboard after successful registration
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ general: error.message || 'Registration failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialRegister = (provider) => {
    if (provider === 'github') {
      handleGitHubRegister()
    } else if (provider === 'linkedin') {
      handleLinkedInRegister()
    } else {
      console.log(`Registering with ${provider}`)
    }
  }

  const handleGitHubRegister = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'your_github_client_id_here'
    const redirectUri = `${window.location.origin}/auth/github/callback`
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`
    
    // Store the current URL to redirect back after GitHub auth
    localStorage.setItem('github_redirect', window.location.pathname)
    
    // Redirect to GitHub OAuth
    window.location.href = githubAuthUrl
  }

  const handleLinkedInRegister = () => {
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID || 'your_linkedin_client_id_here'
    const redirectUri = `${window.location.origin}/auth/linkedin/callback`
    const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=r_liteprofile%20r_emailaddress`
    
    // Store the current URL to redirect back after LinkedIn auth
    localStorage.setItem('linkedin_redirect', window.location.pathname)
    
    // Redirect to LinkedIn OAuth
    window.location.href = linkedinAuthUrl
  }

  const passwordStrength = () => {
    if (!formData.password) return 0
    
    let strength = 0
    if (formData.password.length >= 6) strength++
    if (/[a-z]/.test(formData.password)) strength++
    if (/[A-Z]/.test(formData.password)) strength++
    if (/\d/.test(formData.password)) strength++
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++
    
    return strength
  }

  const getPasswordStrengthColor = () => {
    const strength = passwordStrength()
    if (strength <= 2) return 'var(--error-500)'
    if (strength <= 3) return 'var(--warning-500)'
    return 'var(--success-500)'
  }

  const getPasswordStrengthText = () => {
    const strength = passwordStrength()
    if (strength <= 2) return 'Weak'
    if (strength <= 3) return 'Fair'
    if (strength <= 4) return 'Good'
    return 'Strong'
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Form */}
        <motion.div 
          className="auth-form-section"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="form-header">
            <motion.div 
              className="logo-section"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1>Join PathWise</h1>
              <p>Start your career development journey today</p>
            </motion.div>
          </div>

          <motion.form 
            className="auth-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {isSuccess && (
              <motion.div 
                className="success-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <CheckCircle size={20} />
                <span>Registration successful! Redirecting...</span>
              </motion.div>
            )}

            {errors.general && (
              <motion.div 
                className="error-message general-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle size={16} />
                {errors.general}
              </motion.div>
            )}

            <div className="name-group">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <div className="input-wrapper">
                  <User size={20} className="input-icon" />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    className={errors.firstName ? 'error' : ''}
                    disabled={isLoading}
                    autoComplete="given-name"
                    maxLength={50}
                  />
                </div>
                {errors.firstName && (
                  <motion.div 
                    className="error-message"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle size={16} />
                    {errors.firstName}
                  </motion.div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <div className="input-wrapper">
                  <User size={20} className="input-icon" />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    className={errors.lastName ? 'error' : ''}
                    disabled={isLoading}
                    autoComplete="family-name"
                    maxLength={50}
                  />
                </div>
                {errors.lastName && (
                  <motion.div 
                    className="error-message"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <AlertCircle size={16} />
                    {errors.lastName}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={errors.email ? 'error' : ''}
                  disabled={isLoading}
                  autoComplete="email"
                  maxLength={254}
                />
              </div>
              {errors.email && (
                <motion.div 
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle size={16} />
                  {errors.email}
                </motion.div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                  className={errors.password ? 'error' : ''}
                  disabled={isLoading}
                  autoComplete="new-password"
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
                <motion.div 
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle size={16} />
                  {errors.password}
                </motion.div>
              )}
              
              {/* Password requirements */}
              {formData.password && (
                <motion.div 
                  className="password-requirements"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="requirement-item">
                    <CheckCircle size={16} className={formData.password.length >= 8 ? 'valid' : 'invalid'} />
                    <span className={formData.password.length >= 8 ? 'valid' : 'invalid'}>At least 8 characters</span>
                  </div>
                  <div className="requirement-item">
                    <CheckCircle size={16} className={/[A-Z]/.test(formData.password) ? 'valid' : 'invalid'} />
                    <span className={/[A-Z]/.test(formData.password) ? 'valid' : 'invalid'}>One uppercase letter</span>
                  </div>
                  <div className="requirement-item">
                    <CheckCircle size={16} className={/[a-z]/.test(formData.password) ? 'valid' : 'invalid'} />
                    <span className={/[a-z]/.test(formData.password) ? 'valid' : 'invalid'}>One lowercase letter</span>
                  </div>
                  <div className="requirement-item">
                    <CheckCircle size={16} className={/\d/.test(formData.password) ? 'valid' : 'invalid'} />
                    <span className={/\d/.test(formData.password) ? 'valid' : 'invalid'}>One number</span>
                  </div>
                  <div className="requirement-item">
                    <CheckCircle size={16} className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'valid' : 'invalid'} />
                    <span className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'valid' : 'invalid'}>One special character</span>
                  </div>
                </motion.div>
              )}
              
              {formData.password && !errors.password && (
                <motion.div 
                  className="password-hint"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CheckCircle size={16} />
                  <span>Password meets all requirements!</span>
                </motion.div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? 'error' : ''}
                  disabled={isLoading}
                  autoComplete="new-password"
                  maxLength={128}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.div 
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle size={16} />
                  {errors.confirmPassword}
                </motion.div>
              )}
              
              {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
                <motion.div 
                  className="password-hint"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CheckCircle size={16} />
                  <span>Passwords match!</span>
                </motion.div>
              )}
            </div>

            <div className="form-options">
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                I agree to the{' '}
                <Link to="/terms" className="link-primary">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="link-primary">Privacy Policy</Link>
              </label>
              {errors.agreeToTerms && (
                <motion.div 
                  className="error-message"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <AlertCircle size={16} />
                  {errors.agreeToTerms}
                </motion.div>
              )}
            </div>

            <div className="form-options">
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  name="subscribeNewsletter"
                  checked={formData.subscribeNewsletter}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                Subscribe to our newsletter for career tips and updates
              </label>
            </div>

            <motion.button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>

            <div className="divider">
              <span>or sign up with</span>
            </div>

            {/* Google Sign-In Button */}
            <div className="google-signin-container">
              <div id="google-signin-button"></div>
            </div>

            <div className="social-login">
              <motion.button
                type="button"
                className="social-btn github"
                onClick={() => handleSocialRegister('github')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                <Github size={20} />
                GitHub
              </motion.button>
              
              <motion.button
                type="button"
                className="social-btn linkedin"
                onClick={() => handleSocialRegister('linkedin')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                <Linkedin size={20} />
                LinkedIn
              </motion.button>
            </div>

            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="link-primary">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.form>
        </motion.div>

        {/* Right Side - Hero */}
        <motion.div 
          className="auth-hero"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="hero-content">
            <div className="hero-badge">
              <span>🎯</span>
              <span>Start Your Journey</span>
            </div>
            
            <h2>Build Your Dream Career</h2>
            <p>
              Join a community of ambitious professionals and get access to 
              personalized learning paths, expert mentorship, and real-world projects.
            </p>
            
            <div className="benefits-list">
              <div className="benefit-item">
                <Check size={20} />
                <span>Personalized learning paths</span>
              </div>
              <div className="benefit-item">
                <Check size={20} />
                <span>Expert mentorship network</span>
              </div>
              <div className="benefit-item">
                <Check size={20} />
                <span>Real-world project experience</span>
              </div>
              <div className="benefit-item">
                <Check size={20} />
                <span>Career guidance and support</span>
              </div>
            </div>
            
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">95%</span>
                <span className="stat-label">Success Rate</span>
              </div>
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Expert Mentors</span>
              </div>
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Active Learners</span>
              </div>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="card-icon">📈</div>
              <div className="card-content">
                <h4>Track Progress</h4>
                <p>Monitor your learning journey</p>
              </div>
            </div>
            
            <div className="floating-card card-2">
              <div className="card-icon">🏆</div>
              <div className="card-content">
                <h4>Earn Certificates</h4>
                <p>Get recognized for your skills</p>
              </div>
            </div>
            
            <div className="floating-card card-3">
              <div className="card-icon">💼</div>
              <div className="card-content">
                <h4>Land Jobs</h4>
                <p>Connect with top employers</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Register 