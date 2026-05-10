import axios from 'axios'

// Profile Service for managing user profile data
import { expressApiUrl } from '../config/apiBase'

const API_BASE_URL = expressApiUrl('/api/auth')

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

class ProfileService {
  /**
   * Get user profile data
   * @returns {Promise<Object>} User profile data
   */
  async getProfile() {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await api.get('/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      return {
        success: true,
        data: response.data,
        error: null
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Failed to fetch profile'
      }
    }
  }

  /**
   * Update user profile data
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Update result
   */
  async updateProfile(profileData) {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await api.put('/profile', profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      // Update local storage with new user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }

      return {
        success: true,
        data: response.data,
        error: null
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Failed to update profile'
      }
    }
  }

  /**
   * Update profile from resume data
   * @param {Object} resumeData - Parsed resume data
   * @returns {Promise<Object>} Update result
   */
  async updateProfileFromResume(resumeData) {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await api.put('/profile/from-resume', resumeData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      // Update local storage with new user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }

      return {
        success: true,
        data: response.data,
        error: null
      }
    } catch (error) {
      console.error('Error updating profile from resume:', error)
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Failed to update profile from resume'
      }
    }
  }

  /**
   * Get current user from localStorage
   * @returns {Object|null} Current user data
   */
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  /**
   * Update current user in localStorage
   * @param {Object} userData - Updated user data
   */
  updateCurrentUser(userData) {
    try {
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error) {
      console.error('Error updating current user:', error)
    }
  }
}

export default new ProfileService()
