import React, { useState, useEffect } from 'react'
import { User, Upload, RefreshCw } from 'lucide-react'
import ProfileDisplay from '../components/ProfileDisplay'
import ResumeUpload from '../components/ResumeUpload'
import profileService from '../services/profileService'
import resumeService from '../services/resumeService'
import authService from '../services/authService'
import './ProfileTest.css'

const ProfileTest = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const result = await profileService.getProfile()
      if (result.success) {
        setProfile(result.data)
        setError('')
      } else {
        setError(result.error || 'Failed to load profile')
      }
    } catch (err) {
      setError('Failed to load profile')
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResumeUpload = async (file) => {
    setLoading(true)
    try {
      const result = await resumeService.parseResume(file, user?._id)
      if (result.success) {
        // Update profile with resume data
        const updateResult = await profileService.updateProfileFromResume(result.data)
        if (updateResult.success) {
          setProfile(updateResult.data)
          setSuccess('Resume uploaded and profile updated successfully!')
          setTimeout(() => setSuccess(''), 3000)
        } else {
          setError(updateResult.error || 'Failed to update profile')
        }
      } else {
        setError(result.error || 'Failed to parse resume')
      }
    } catch (err) {
      setError('Failed to upload resume')
      console.error('Error uploading resume:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResumeError = (errorMessage) => {
    setError(errorMessage)
    setSuccess('')
  }

  return (
    <div className="profile-test-page">
      <div className="page-header">
        <h1>
          <User size={32} />
          Profile Integration Test
        </h1>
        <p>Test how resume data updates your profile automatically</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
        </div>
      )}

      <div className="test-content">
        <div className="upload-section">
          <h2>Upload Resume to Update Profile</h2>
          <ResumeUpload
            onResumeParsed={handleResumeUpload}
            onError={handleResumeError}
            userId={user?._id}
          />
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h2>Current Profile Data</h2>
            <button 
              className="refresh-btn"
              onClick={loadProfile}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              Refresh Profile
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <RefreshCw size={24} className="spinning" />
              <span>Loading profile...</span>
            </div>
          ) : profile ? (
            <ProfileDisplay profile={profile} />
          ) : (
            <div className="no-profile">
              <User size={48} />
              <h3>No Profile Data</h3>
              <p>Upload a resume to populate your profile, or check your settings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileTest
