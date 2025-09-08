import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'
import ResumeUpload from '../components/ResumeUpload'
import ResumeDisplay from '../components/ResumeDisplay'
import authService from '../services/authService'
import resumeService from '../services/resumeService'
import profileService from '../services/profileService'
import './ResumeParser.css'

const ResumeParser = () => {
  const [resumeData, setResumeData] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [user, setUser] = useState(null)
  const [savedResumes, setSavedResumes] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Load user and saved resumes on component mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    
    if (currentUser) {
      loadSavedResumes(currentUser._id)
    }
  }, [])

  const loadSavedResumes = async (userId) => {
    try {
      setIsLoading(true)
      const result = await resumeService.getResumes(userId)
      if (result.success) {
        setSavedResumes(result.data || [])
      }
    } catch (error) {
      console.error('Error loading saved resumes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResumeParsed = async (data) => {
    setResumeData(data)
    setError(null)
    setSuccess('Resume parsed and saved successfully!')
    
    // Reload saved resumes to include the new one
    if (user) {
      loadSavedResumes(user._id)
    }
    
    // Update profile with resume data
    try {
      await profileService.updateProfileFromResume(data)
      console.log('Profile updated from resume data')
    } catch (error) {
      console.error('Failed to update profile from resume:', error)
    }
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleError = (errorMessage) => {
    setError(errorMessage)
    setSuccess(null)
    setResumeData(null)
    
    // Clear error message after 5 seconds
    setTimeout(() => setError(null), 5000)
  }

  const handleNewUpload = () => {
    setResumeData(null)
    setError(null)
    setSuccess(null)
  }

  const handleLoadResume = async (resumeId) => {
    try {
      setIsLoading(true)
      const result = await resumeService.getResume(resumeId)
      if (result.success) {
        setResumeData(result.data)
        setError(null)
        setSuccess('Resume loaded successfully!')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error || 'Failed to load resume')
        setTimeout(() => setError(null), 5000)
      }
    } catch (error) {
      setError('Error loading resume: ' + error.message)
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteResume = async (resumeId) => {
    try {
      const result = await resumeService.deleteResume(resumeId)
      if (result.success) {
        setSuccess('Resume deleted successfully!')
        // Reload saved resumes
        if (user) {
          loadSavedResumes(user._id)
        }
        // Clear current resume if it was the deleted one
        if (resumeData && resumeData.id === resumeId) {
          setResumeData(null)
        }
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error || 'Failed to delete resume')
        setTimeout(() => setError(null), 5000)
      }
    } catch (error) {
      setError('Error deleting resume: ' + error.message)
      setTimeout(() => setError(null), 5000)
    }
  }

  return (
    <div className="resume-parser-page">
      <div className="page-header">
        <h1>Resume Parser</h1>
        <p>Upload your resume to extract structured information and build your profile</p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      <div className="resume-parser-content">
        {!resumeData ? (
          <div className="upload-section">
            <ResumeUpload
              onResumeParsed={handleResumeParsed}
              onError={handleError}
              userId={user?._id}
            />
            
            {/* Saved Resumes Section */}
            {user && savedResumes.length > 0 && (
              <div className="saved-resumes-section">
                <h2>Your Saved Resumes</h2>
                <div className="saved-resumes-list">
                  {savedResumes.map((resume) => (
                    <div key={resume.id} className="saved-resume-item">
                      <div className="resume-info">
                        <h3>{resume.parsed_data?.name || 'Unnamed Resume'}</h3>
                        <p className="resume-meta">
                          {resume.file_name} • {new Date(resume.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="resume-actions">
                        <button
                          className="load-resume-btn"
                          onClick={() => handleLoadResume(resume.id)}
                          disabled={isLoading}
                        >
                          Load
                        </button>
                        <button
                          className="delete-resume-btn"
                          onClick={() => handleDeleteResume(resume.id)}
                          disabled={isLoading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="results-section">
            <div className="results-header">
              <h2>Parsed Resume Data</h2>
              <div className="results-actions">
                <button
                  className="new-upload-btn"
                  onClick={handleNewUpload}
                >
                  Upload Another Resume
                </button>
                {user && (
                  <button
                    className="view-saved-btn"
                    onClick={() => setResumeData(null)}
                  >
                    View Saved Resumes
                  </button>
                )}
              </div>
            </div>
            <ResumeDisplay resumeData={resumeData} />
          </div>
        )}
      </div>
    </div>
  )
}

export default ResumeParser
