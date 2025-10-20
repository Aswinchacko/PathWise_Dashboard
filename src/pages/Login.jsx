import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  CheckCircle,
  Github,
  Linkedin,
  Twitter
} from 'lucide-react'
import authService from '../services/authService'
import './Login.css'
import React from 'react'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSuccess, setIsSuccess] = useState(false)

  // Redirect if already authenticated
  React.useEffect(() => {
    if (authService.isAuthenticated()) {
      if (authService.isAdmin()) {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
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
            text: 'signin_with',
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
      const result = await authService.googleLogin(response.credential)
      setIsSuccess(true)
      
      // Check if user is admin and redirect accordingly
      setTimeout(() => {
        if (result.user.isAdmin) {
          navigate('/admin')
        } else {
          navigate('/dashboard')
        }
      }, 1000)
    } catch (error) {
      console.error('Google login error:', error)
      setErrors({ general: error.message || 'Google login failed. Please try again.' })
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
    } else if (type === 'text' || type === 'password') {
      sanitizedValue = value.trim()
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
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Real-time validation
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
      
      // Check if user is admin and redirect accordingly
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

  const handleSocialLogin = (provider) => {
    if (provider === 'github') {
      handleGitHubLogin()
    } else if (provider === 'linkedin') {
      handleLinkedInLogin()
    } else {
      console.log(`Logging in with ${provider}`)
    }
  }

  const handleGitHubLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'your_github_client_id_here'
    const redirectUri = `${window.location.origin}/auth/github/callback`
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`
    
    // Store the current URL to redirect back after GitHub auth
    localStorage.setItem('github_redirect', window.location.pathname)
    
    // Redirect to GitHub OAuth
    window.location.href = githubAuthUrl
  }

  const handleLinkedInLogin = () => {
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID || 'your_linkedin_client_id_here'
    const redirectUri = `${window.location.origin}/auth/linkedin/callback`
    const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=r_liteprofile%20r_emailaddress`
    
    // Store the current URL to redirect back after LinkedIn auth
    localStorage.setItem('linkedin_redirect', window.location.pathname)
    
    // Redirect to LinkedIn OAuth
    window.location.href = linkedinAuthUrl
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
              <h1>Welcome Back</h1>
              <p>Sign in to continue your learning journey</p>
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
                <span>Login successful! Redirecting...</span>
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
                  placeholder="Enter your password"
                  className={errors.password ? 'error' : ''}
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
                <motion.div 
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle size={16} />
                  {errors.password}
                </motion.div>
              )}
              
              {/* Password requirements hint */}
              {formData.password && !errors.password && (
                <motion.div 
                  className="password-hint"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CheckCircle size={16} />
                  <span>Password looks good!</span>
                </motion.div>
              )}
            </div>

            <div className="form-options">
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
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
                  Sign In
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>

            <div className="divider">
              <span>or continue with</span>
            </div>

            {/* Google Sign-In Button */}
            <div className="google-signin-container">
              <div id="google-signin-button"></div>
            </div>

            <div className="social-login">
              <motion.button
                type="button"
                className="social-btn github"
                onClick={() => handleSocialLogin('github')}
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
                onClick={() => handleSocialLogin('linkedin')}
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
                Don't have an account?{' '}
                <Link to="/register" className="link-primary">
                  Sign up
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
              <span>🚀</span>
              <span>Career Development Platform</span>
            </div>
            
            <h2>Accelerate Your Career Growth</h2>
            <p>
              Join thousands of professionals who are advancing their careers 
              with personalized learning paths, expert mentorship, and real-world projects.
            </p>
            
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Active Learners</span>
              </div>
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Expert Mentors</span>
              </div>
              <div className="stat">
                <span className="stat-number">95%</span>
                <span className="stat-label">Success Rate</span>
              </div>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="card-icon">📚</div>
              <div className="card-content">
                <h4>Personalized Learning</h4>
                <p>AI-driven curriculum tailored to your goals</p>
              </div>
            </div>
            
            <div className="floating-card card-2">
              <div className="card-icon">🎯</div>
              <div className="card-content">
                <h4>Project-Based</h4>
                <p>Build real-world projects for your portfolio</p>
              </div>
            </div>
            
            <div className="floating-card card-3">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <h4>Expert Mentorship</h4>
                <p>Connect with industry professionals</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login 