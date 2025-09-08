import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Loader } from 'lucide-react'
import authService from '../services/authService'
import './LinkedInCallback.css'

const LinkedInCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleLinkedInCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
          setStatus('error')
          setMessage('LinkedIn authorization was cancelled or failed.')
          return
        }

        if (!code) {
          setStatus('error')
          setMessage('No authorization code received from LinkedIn.')
          return
        }

        // Call backend with the authorization code
        const result = await authService.linkedinLogin(code)
        
        setStatus('success')
        setMessage('LinkedIn login successful! Redirecting...')

        // Check if user is admin and redirect accordingly
        setTimeout(() => {
          localStorage.removeItem('linkedin_redirect')
          if (result.user.isAdmin) {
            navigate('/admin')
          } else {
            const redirectPath = localStorage.getItem('linkedin_redirect') || '/dashboard'
            navigate(redirectPath)
          }
        }, 2000)

      } catch (error) {
        console.error('LinkedIn callback error:', error)
        setStatus('error')
        setMessage(error.message || 'LinkedIn login failed. Please try again.')
      }
    }

    handleLinkedInCallback()
  }, [searchParams, navigate])

  return (
    <div className="linkedin-callback">
      <motion.div 
        className="callback-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {status === 'loading' && (
          <div className="callback-content">
            <Loader className="callback-icon loading" size={48} />
            <h2>Connecting to LinkedIn...</h2>
            <p>Please wait while we complete your authentication.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="callback-content">
            <CheckCircle className="callback-icon success" size={48} />
            <h2>Login Successful!</h2>
            <p>{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="callback-content">
            <AlertCircle className="callback-icon error" size={48} />
            <h2>Login Failed</h2>
            <p>{message}</p>
            <button 
              className="retry-btn"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default LinkedInCallback 