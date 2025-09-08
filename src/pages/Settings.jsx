import { motion } from 'framer-motion'
import { Lightbulb, User, Target, FileText, Upload, CheckSquare, Square, LogOut, Plus, Trash2, Edit3, Save, X, Download, Eye, Calendar, MapPin, Phone, Mail, GraduationCap, Briefcase, Award, Code, Star, Settings as SettingsIcon, Sparkles, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import authService from '../services/authService'
import resumeStorageService from '../services/resumeStorageService'
import profileService from '../services/profileService'
import './Settings.css'

const Settings = () => {
  // Get current user from auth service
  const currentUser = authService.getCurrentUser()
  const navigate = useNavigate()

  // Resume data state
  const [resumes, setResumes] = useState([])
  const [selectedResume, setSelectedResume] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Profile state
  const [profile, setProfile] = useState({
    full_name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '',
    email: currentUser?.email || '',
    phone: '',
    location: '',
    summary: 'Passionate software developer with expertise in modern web technologies...',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
    education: [
      {
        degree: 'Bachelor of Computer Science',
        institution: 'University of Technology',
        year_start: '2019',
        year_end: '2023'
      }
    ],
    experience: [
      {
        role: 'Software Developer',
        company: 'Tech Corp',
        year_start: '2023',
        year_end: 'Present'
      }
    ]
  })

  const [editing, setEditing] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [showResumeModal, setShowResumeModal] = useState(false)

  // Load resumes and profile on component mount
  useEffect(() => {
    loadResumes()
    loadProfile()
  }, [])

  const loadResumes = async () => {
    setLoading(true)
    try {
      const result = await resumeStorageService.getResumes(currentUser?.id)
      if (result.success) {
        setResumes(result.resumes)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to load resumes')
    } finally {
      setLoading(false)
    }
  }

  const loadProfile = async () => {
    try {
      const result = await profileService.getProfile()
      if (result.success && result.data) {
        const userData = result.data
        setProfile(prev => ({
          ...prev,
          full_name: userData.full_name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          email: userData.email || prev.email,
          phone: userData.phone || prev.phone,
          location: userData.location || prev.location,
          summary: userData.summary || prev.summary,
          skills: userData.skills || prev.skills,
          education: userData.education || prev.education,
          experience: userData.experience || prev.experience,
          projects: userData.projects || prev.projects,
          certifications: userData.certifications || prev.certifications,
          languages: userData.languages || prev.languages
        }))
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
    }
  }

  const handleResumeUpload = async (file) => {
    setLoading(true)
    try {
      const result = await resumeStorageService.parseAndStoreResume(file, currentUser?.id)
      if (result.success) {
        await loadResumes() // Reload resumes
        
        // Update profile with resume data
        if (result.data) {
          await updateProfileFromResume(result.data)
        }
        
        setError('')
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to upload resume')
    } finally {
      setLoading(false)
    }
  }

  const updateProfileFromResume = async (resumeData) => {
    try {
      const result = await profileService.updateProfileFromResume(resumeData)
      if (result.success && result.data?.user) {
        const userData = result.data.user
        
        // Update local profile state with the server response
        setProfile(prev => ({
          ...prev,
          full_name: userData.full_name || prev.full_name,
          email: userData.email || prev.email,
          phone: userData.phone || prev.phone,
          location: userData.location || prev.location,
          summary: userData.summary || prev.summary,
          skills: userData.skills || prev.skills,
          education: userData.education || prev.education,
          experience: userData.experience || prev.experience,
          projects: userData.projects || prev.projects,
          certifications: userData.certifications || prev.certifications,
          languages: userData.languages || prev.languages
        }))
        
        // Update current user in localStorage (already done in profileService)
        console.log('Profile updated from resume data successfully')
        setError('')
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
    setLoading(true)
    try {
      const result = await resumeStorageService.getResume(resumeId)
      if (result.success) {
        await updateProfileFromResume(result.data)
        setError('')
        console.log('Profile updated from selected resume')
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to apply resume to profile')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  const handleProfileSave = async () => {
    setLoading(true)
    try {
      const result = await profileService.updateProfile(profile)
      if (result.success) {
        setEditing(false)
        // Update current user in localStorage
        if (result.data?.user) {
          profileService.updateCurrentUser(result.data.user)
        }
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
          {/* Resume Management */}
          <motion.div
            className="setting-card resume-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="setting-header">
              <FileText size={20} />
              <h3>Resume Management</h3>
            </div>
            <div className="setting-content">
              <div className="resume-upload-compact">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => e.target.files[0] && handleResumeUpload(e.target.files[0])}
                  style={{ display: 'none' }}
                />
                <label htmlFor="resume-upload" className="upload-btn-compact">
                  <Upload size={16} />
                  Upload Resume
                </label>
              </div>
              
              {error && <div className="error-message-compact">{error}</div>}
              {loading && <div className="loading-message-compact">Processing...</div>}
              
              <div className="resumes-list-compact">
                {resumes.length === 0 ? (
                  <div className="no-resumes-compact">
                    <FileText size={24} />
                    <span>No resumes yet</span>
                  </div>
                ) : (
                  resumes.slice(0, 3).map((resume) => (
                    <div key={resume.id} className="resume-item-compact">
                      <div className="resume-info-compact">
                        <div className="resume-name-compact">{resume.file_name}</div>
                        <div className="resume-date-compact">
                          {new Date(resume.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="resume-actions-compact">
                        <button onClick={() => handleViewResume(resume.id)} className="action-btn-compact">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleApplyResumeToProfile(resume.id)} className="action-btn-compact">
                          <User size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                {resumes.length > 3 && (
                  <div className="resumes-more">+{resumes.length - 3} more resumes</div>
                )}
              </div>
            </div>
          </motion.div>

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
                  <div className="stat-number">3</div>
                  <div className="stat-label">Active Goals</div>
                </div>
                <div className="goal-stat">
                  <div className="stat-number">60%</div>
                  <div className="stat-label">Progress</div>
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
                <div className="pref-item">
                  <CheckSquare size={16} />
                  <span>Email notifications</span>
                </div>
                <div className="pref-item">
                  <Square size={16} />
                  <span>Weekly reports</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account */}
          <motion.div
            className="setting-card account-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="setting-header">
              <User size={20} />
              <h3>Account</h3>
            </div>
            <div className="setting-content">
              <div className="account-compact">
                <div className="account-email">{currentUser?.email}</div>
                <button className="logout-btn-compact" onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
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
    </div>
  )
}

export default Settings 