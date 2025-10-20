import { motion } from 'framer-motion'
import { Lightbulb, User, Target, FileText, Upload, CheckSquare, Square, LogOut, Plus, Trash2, Edit3, Save, X, Download, Eye, Calendar, MapPin, Phone, Mail, GraduationCap, Briefcase, Award, Code, Star, Settings as SettingsIcon, Sparkles, Zap, RefreshCw, AlertCircle, CheckCircle, Crown, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback, useRef } from 'react'
import authService from '../services/authService'
import resumeStorageService from '../services/resumeStorageService'
import profileService from '../services/profileService'
import subscriptionService from '../services/subscriptionService'
import SubscriptionModal from '../components/SubscriptionModal'
import './Settings.css'

const Settings = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser())
  const [isInitialized, setIsInitialized] = useState(false)

  // Resume data state
  const [resumes, setResumes] = useState([])
  const [selectedResume, setSelectedResume] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Profile state - Initialize with empty values to be populated from DB
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    languages: []
  })

  const [editing, setEditing] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    weeklyReports: false,
    theme: 'auto'
  })
  
  // Subscription state
  const [subscriptionInfo, setSubscriptionInfo] = useState(null)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)

  // Initialize component and check authentication
  useEffect(() => {
    const initializeComponent = async () => {
      // Check if user is authenticated
      const user = authService.getCurrentUser()
      const token = authService.getToken()
      
      if (!user || !token) {
        console.warn('User not authenticated, redirecting to login')
        navigate('/login')
        return
      }

      setCurrentUser(user)
      await Promise.all([
        loadResumes(),
        loadProfile(),
        loadSubscriptionInfo()
      ])
      setIsInitialized(true)
    }

    initializeComponent()
  }, [])

  // Auto-refresh data every 30 seconds to keep it in sync
  useEffect(() => {
    if (!isInitialized) return

    const interval = setInterval(() => {
      loadProfile()
    }, 30000)

    return () => clearInterval(interval)
  }, [isInitialized])

  const loadResumes = useCallback(async () => {
    if (!currentUser?.id) return
    
    setLoading(true)
    try {
      const result = await resumeStorageService.getResumes(currentUser.id)
      if (result.success) {
        setResumes(result.resumes || [])
        setError('')
      } else {
        setError(result.error || 'Failed to load resumes')
      }
    } catch (err) {
      console.error('Error loading resumes:', err)
      setError('Failed to load resumes')
    } finally {
      setLoading(false)
    }
  }, [currentUser?.id])

  const loadProfile = useCallback(async () => {
    if (!currentUser) return

    try {
      const result = await profileService.getProfile()
      if (result.success && result.data) {
        const userData = result.data.user || result.data
        
        // Create comprehensive profile from DB data
        const profileData = {
          full_name: userData.full_name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Your Name',
          email: userData.email || currentUser.email || '',
          phone: userData.phone || '',
          location: userData.location || '',
          summary: userData.summary || '',
          skills: Array.isArray(userData.skills) ? userData.skills : [],
          education: Array.isArray(userData.education) ? userData.education : [],
          experience: Array.isArray(userData.experience) ? userData.experience : [],
          projects: Array.isArray(userData.projects) ? userData.projects : [],
          certifications: Array.isArray(userData.certifications) ? userData.certifications : [],
          languages: Array.isArray(userData.languages) ? userData.languages : []
        }
        
        setProfile(profileData)
        
        // Update preferences if available
        if (userData.preferences) {
          setPreferences(prev => ({
            ...prev,
            emailNotifications: userData.preferences.emailNotifications ?? prev.emailNotifications,
            weeklyReports: userData.preferences.weeklyReports ?? prev.weeklyReports,
            theme: userData.preferences.theme || prev.theme
          }))
        }
        
        setError('')
      } else {
        setError(result.error || 'Failed to load profile')
      }
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Failed to load profile')
    }
  }, [currentUser])

  const loadSubscriptionInfo = useCallback(async () => {
    if (!currentUser?.id) return
    
    try {
      const result = await subscriptionService.getUserSubscription(currentUser.id)
      if (result.success) {
        setSubscriptionInfo(result.data)
      } else {
        console.error('Failed to load subscription info:', result.error)
        // Set default free subscription if API fails
        setSubscriptionInfo({
          subscription: {
            user_id: currentUser.id,
            plan: 'free',
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: null
          },
          usage: {
            roadmaps_created: 0,
            projects_accessed: 0,
            resources_viewed: 0,
            opportunities_applied: 0
          },
          plan_details: {
            name: 'Free Plan',
            price: 0,
            features: {
              roadmaps: 2,
              projects: 3,
              resources: 10,
              opportunities: 0
            }
          }
        })
      }
    } catch (err) {
      console.error('Error loading subscription info:', err)
      // Set default free subscription if service is unavailable
      setSubscriptionInfo({
        subscription: {
          user_id: currentUser.id,
          plan: 'free',
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: null
        },
        usage: {
          roadmaps_created: 0,
          projects_accessed: 0,
          resources_viewed: 0,
          opportunities_applied: 0
        },
        plan_details: {
          name: 'Free Plan',
          price: 0,
          features: {
            roadmaps: 2,
            projects: 3,
            resources: 10,
            opportunities: 0
          }
        }
      })
    }
  }, [currentUser?.id])

  const handleCancelSubscription = async () => {
    if (!currentUser?.id || !subscriptionInfo?.subscription || subscriptionInfo.subscription.plan === 'free') {
      return
    }

    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return
    }

    setSubscriptionLoading(true)
    try {
      const result = await subscriptionService.cancelSubscription(currentUser.id)
      if (result.success) {
        setSuccess('Subscription canceled successfully')
        await loadSubscriptionInfo() // Reload subscription info
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Failed to cancel subscription')
      }
    } catch (err) {
      setError('Error canceling subscription')
    } finally {
      setSubscriptionLoading(false)
    }
  }

  const updateProfileFromResume = async (resumeData) => {
    try {
      const result = await profileService.updateProfileFromResume(resumeData)
      if (result.success) {
        // Reload complete profile from server to ensure consistency
        await loadProfile()
        
        // Update current user in auth service
        const updatedUser = authService.getCurrentUser()
        if (updatedUser) {
          setCurrentUser(updatedUser)
        }
        
        setSuccess('Profile updated from resume successfully!')
        console.log('Profile updated from resume data successfully')
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      } else {
        console.error('Failed to update profile from resume:', result.error)
        setError(result.error || 'Failed to update profile from resume')
      }
    } catch (err) {
      console.error('Error updating profile from resume:', err)
      setError('Error updating profile from resume')
    }
  }

  const handleDeleteResume = async (resumeId) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      setLoading(true)
      try {
        const result = await resumeStorageService.deleteResume(resumeId)
        if (result.success) {
          await loadResumes() // Reload resumes
          setError('')
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError('Failed to delete resume')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleViewResume = async (resumeId) => {
    setLoading(true)
    try {
      const result = await resumeStorageService.getResume(resumeId)
      if (result.success) {
        setSelectedResume(result.data)
        setShowResumeModal(true)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to load resume')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyResumeToProfile = async (resumeId) => {
    if (!resumeId) {
      setError('Invalid resume selected')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const result = await resumeStorageService.getResume(resumeId)
      if (result.success && result.data) {
        await updateProfileFromResume(result.data)
        setSuccess('Resume applied to profile successfully!')
        console.log('Profile updated from selected resume')
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Failed to load resume data')
      }
    } catch (err) {
      console.error('Error applying resume to profile:', err)
      setError('Failed to apply resume to profile')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = useCallback(() => {
    console.log('handleLogout called') // Debug log
    try {
      console.log('Clearing authentication data...') // Debug log
      
      // Clear authentication data
      authService.logout()
      
      console.log('Authentication data cleared, clearing component state...') // Debug log
      
      // Clear component state
      setCurrentUser(null)
      setProfile({
        full_name: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        skills: [],
        education: [],
        experience: [],
        projects: [],
        certifications: [],
        languages: []
      })
      setResumes([])
      setError('')
      setSuccess('')
      
      console.log('Redirecting to login...') // Debug log
      
      // Force full page reload to ensure authentication check
      window.location.href = '/login'
    } catch (err) {
      console.error('Logout error:', err)
      // Force navigation even if logout fails
      window.location.href = '/login'
    }
  }, [])

  const handleProfileSave = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const result = await profileService.updateProfile(profile)
      if (result.success) {
        setEditing(false)
        setSuccess('Profile saved successfully!')
        
        // Reload profile to ensure consistency with server
        await loadProfile()
        
        // Update current user in auth service if user data is returned
        if (result.data?.user) {
          const updatedUser = { ...currentUser, ...result.data.user }
          localStorage.setItem('user', JSON.stringify(updatedUser))
          setCurrentUser(updatedUser)
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
        
        console.log('Profile saved successfully')
      } else {
        setError(result.error || 'Failed to save profile')
      }
    } catch (err) {
      setError('Failed to save profile')
      console.error('Error saving profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const addEducation = () => {
    setProfile(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: '',
        institution: '',
        year_start: '',
        year_end: ''
      }]
    }))
  }

  const removeEducation = (index) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const updateEducation = (index, field, value) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const addExperience = () => {
    setProfile(prev => ({
      ...prev,
      experience: [...prev.experience, {
        role: '',
        company: '',
        year_start: '',
        year_end: ''
      }]
    }))
  }

  const removeExperience = (index) => {
    setProfile(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  const updateExperience = (index, field, value) => {
    setProfile(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }))
  }

  return (
    <div className="settings-page">
      <motion.div 
        className="settings-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="header-content">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="header-title"
          >
            <SettingsIcon size={32} style={{ color: '#6366f1', marginRight: '1rem' }} />
            <h1>Settings</h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
          >
            <button className="theme-toggle-btn">
              <Sparkles size={20} />
            </button>
          </motion.div>
        </div>
      </motion.div>

      <div className="settings-container">
        {/* Profile Section */}
        <motion.div
          className="profile-main-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="profile-header">
            <div className="profile-avatar-large">
              <User size={48} />
            </div>
            <div className="profile-main-info">
              <h2>{profile.full_name || 'Your Name'}</h2>
              <p className="profile-summary">{profile.summary || 'Add a professional summary to your profile'}</p>
              <div className="profile-contact">
                {profile.email && (
                  <div className="contact-item">
                    <Mail size={16} />
                    <span>{profile.email}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="contact-item">
                    <Phone size={16} />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="contact-item">
                    <MapPin size={16} />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
            </div>
            <button className="edit-profile-btn" onClick={() => setEditing(true)}>
              <Edit3 size={16} />
              Edit Profile
            </button>
          </div>

          {/* Skills Display */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="profile-skills">
              <h4>Skills</h4>
              <div className="skills-tags">
                {profile.skills.slice(0, 10).map((skill, index) => (
                  <span key={index} className="skill-tag-display">{skill}</span>
                ))}
                {profile.skills.length > 10 && (
                  <span className="skill-tag-more">+{profile.skills.length - 10} more</span>
                )}
              </div>
            </div>
          )}

          {/* Experience Summary */}
          {profile.experience && profile.experience.length > 0 && (
            <div className="profile-experience">
              <h4>Recent Experience</h4>
              <div className="experience-summary">
                {profile.experience.slice(0, 2).map((exp, index) => (
                  <div key={index} className="experience-item-compact">
                    <div className="exp-role">{exp.role || exp.title}</div>
                    <div className="exp-company">{exp.company}</div>
                    <div className="exp-dates">{exp.dates || `${exp.year_start} - ${exp.year_end}`}</div>
                  </div>
                ))}
                {profile.experience.length > 2 && (
                  <div className="experience-more">
                    +{profile.experience.length - 2} more positions
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Settings Grid */}
        <div className="settings-grid">

          {/* Goals */}
          <motion.div
            className="setting-card goals-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="setting-header">
              <Target size={20} />
              <h3>Goals</h3>
            </div>
            <div className="setting-content">
              <div className="goals-compact">
                <div className="goal-stat">
                  <div className="stat-number">{profile.skills?.length || 0}</div>
                  <div className="stat-label">Skills</div>
                </div>
                <div className="goal-stat">
                  <div className="stat-number">{profile.experience?.length || 0}</div>
                  <div className="stat-label">Experience</div>
                </div>
                <div className="goal-stat">
                  <div className="stat-number">{profile.projects?.length || 0}</div>
                  <div className="stat-label">Projects</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Preferences */}
          <motion.div
            className="setting-card preferences-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="setting-header">
              <CheckSquare size={20} />
              <h3>Preferences</h3>
            </div>
            <div className="setting-content">
              <div className="preferences-compact">
                <div className="pref-item" onClick={() => {
                  setPreferences(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))
                }}>
                  {preferences.emailNotifications ? <CheckSquare size={16} /> : <Square size={16} />}
                  <span>Email notifications</span>
                </div>
                <div className="pref-item" onClick={() => {
                  setPreferences(prev => ({ ...prev, weeklyReports: !prev.weeklyReports }))
                }}>
                  {preferences.weeklyReports ? <CheckSquare size={16} /> : <Square size={16} />}
                  <span>Weekly reports</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Subscription */}
          <motion.div
            className="setting-card subscription-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="setting-header">
              <Crown size={20} />
              <h3>Subscription</h3>
            </div>
            <div className="setting-content">
              <div className="subscription-compact">
                {subscriptionInfo ? (
                  <>
                    <div className="subscription-info">
                      <div className="subscription-plan">
                        <span className={`plan-badge ${subscriptionInfo.subscription.plan}`}>
                          {subscriptionInfo.plan_details.name}
                        </span>
                        <span className="plan-price">
                          {subscriptionInfo.plan_details.price_display || 
                           (subscriptionInfo.plan_details.price > 0 ? 
                            `₹${subscriptionInfo.plan_details.price}/month` : 'Free')}
                        </span>
                      </div>
                      <div className="subscription-status">
                        Status: <span className={`status ${subscriptionInfo.subscription.status}`}>
                          {subscriptionInfo.subscription.status}
                        </span>
                      </div>
                      {subscriptionInfo.subscription.end_date && (
                        <div className="subscription-end">
                          {subscriptionInfo.subscription.status === 'active' ? 'Renews' : 'Expires'}: {' '}
                          {new Date(subscriptionInfo.subscription.end_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="subscription-actions">
                      {subscriptionInfo.subscription.plan === 'free' ? (
                        <button 
                          className="upgrade-btn-compact"
                          onClick={() => setShowSubscriptionModal(true)}
                        >
                          <Crown size={16} />
                          Upgrade
                        </button>
                      ) : (
                        <button 
                          className="manage-btn-compact"
                          onClick={handleCancelSubscription}
                          disabled={subscriptionLoading}
                        >
                          <CreditCard size={16} />
                          {subscriptionLoading ? 'Processing...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="subscription-loading">
                    <RefreshCw className="spinning" size={16} />
                    Loading subscription...
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Account */}
          <motion.div
            className="setting-card account-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="setting-header">
              <User size={20} />
              <h3>Account</h3>
            </div>
            <div className="setting-content">
              <div className="account-compact">
                <div className="account-info">
                  <div className="account-email">{currentUser?.email}</div>
                  <div className="account-role">Role: {currentUser?.role || 'user'}</div>
                  {currentUser?.lastLogin && (
                    <div className="account-last-login">
                      Last login: {new Date(currentUser.lastLogin).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <button 
                  className="logout-btn-compact" 
                  onClick={(e) => {
                    e.preventDefault()
                    console.log('Logout button clicked') // Debug log
                    handleLogout()
                  }}
                  disabled={loading}
                  type="button"
                >
                  <LogOut size={16} />
                  {loading ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="profile-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button className="close-btn" onClick={() => setEditing(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="profile-form-compact">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter your location"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Professional Summary</label>
                  <textarea
                    value={profile.summary}
                    onChange={(e) => setProfile(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Brief introduction about yourself"
                    rows={3}
                  />
                </div>
                
                <div className="form-group">
                  <label>Skills</label>
                  <div className="skills-input">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <button onClick={addSkill} className="add-btn">
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="skills-list">
                    {profile.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="remove-skill">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="form-actions">
                  <button onClick={handleProfileSave} className="btn btn-primary" disabled={loading}>
                    <Save size={16} />
                    {loading ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button onClick={() => setEditing(false)} className="btn btn-secondary">
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume Modal */}
      {showResumeModal && selectedResume && (
        <div className="modal-overlay" onClick={() => setShowResumeModal(false)}>
          <div className="resume-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Resume Details</h3>
              <button 
                className="close-btn"
                onClick={() => setShowResumeModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="resume-details">
                <div className="resume-header-info">
                  <h2>{selectedResume.name || 'Name not found'}</h2>
                  <div className="contact-info">
                    {selectedResume.email && (
                      <div className="contact-item">
                        <Mail size={16} />
                        <span>{selectedResume.email}</span>
                      </div>
                    )}
                    {selectedResume.phone && (
                      <div className="contact-item">
                        <Phone size={16} />
                        <span>{selectedResume.phone}</span>
                      </div>
                    )}
                    {selectedResume.location && (
                      <div className="contact-item">
                        <MapPin size={16} />
                        <span>{selectedResume.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedResume.summary && (
                  <div className="resume-section">
                    <h4>Summary</h4>
                    <p>{selectedResume.summary}</p>
                  </div>
                )}

                {selectedResume.skills && selectedResume.skills.length > 0 && (
                  <div className="resume-section">
                    <h4>Skills</h4>
                    <div className="skills-grid">
                      {selectedResume.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">
                          <Code size={14} />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedResume.experience && selectedResume.experience.length > 0 && (
                  <div className="resume-section">
                    <h4>Experience</h4>
                    {selectedResume.experience.map((exp, index) => (
                      <div key={index} className="experience-item">
                        <div className="experience-header">
                          <h5>{exp.title || exp.role || 'Role not specified'}</h5>
                          <span className="experience-company">{exp.company || 'Company not specified'}</span>
                        </div>
                        {exp.dates && (
                          <span className="experience-dates">{exp.dates}</span>
                        )}
                        {exp.description && (
                          <p className="experience-description">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedResume.education && selectedResume.education.length > 0 && (
                  <div className="resume-section">
                    <h4>Education</h4>
                    {selectedResume.education.map((edu, index) => (
                      <div key={index} className="education-item">
                        <div className="education-header">
                          <h5>{edu.degree || 'Degree not specified'}</h5>
                          <span className="education-institution">{edu.institution || 'Institution not specified'}</span>
                        </div>
                        {edu.dates && (
                          <span className="education-dates">{edu.dates}</span>
                        )}
                        {edu.gpa && (
                          <span className="education-gpa">GPA: {edu.gpa}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedResume.projects && selectedResume.projects.length > 0 && (
                  <div className="resume-section">
                    <h4>Projects</h4>
                    {selectedResume.projects.map((project, index) => (
                      <div key={index} className="project-item">
                        <h5>{project.title || 'Project not specified'}</h5>
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="project-tech">
                            {project.technologies.map((tech, techIndex) => (
                              <span key={techIndex} className="tech-tag">{tech}</span>
                            ))}
                          </div>
                        )}
                        {project.description && (
                          <p className="project-description">{project.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedResume.certifications && selectedResume.certifications.length > 0 && (
                  <div className="resume-section">
                    <h4>Certifications</h4>
                    <div className="certifications-list">
                      {selectedResume.certifications.map((cert, index) => (
                        <div key={index} className="certification-item">
                          <Award size={16} />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        userId={currentUser?.id}
        currentPlan={subscriptionInfo?.subscription?.plan || 'free'}
      />
    </div>
  )
}

export default Settings 