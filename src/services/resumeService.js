import axios from 'axios'

// Resume Parser Microservice URL
const API_BASE_URL = 'http://127.0.0.1:8001'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for file uploads
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

class ResumeService {
  /**
   * Upload and parse a resume file
   * @param {File} file - The resume file to upload (PDF or DOCX)
   * @param {string} userId - Optional user ID to associate with the resume
   * @returns {Promise<Object>} Parsed resume data
   */
  async parseResume(file, userId = null) {
    try {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only PDF, DOCX, and TXT files are supported')
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB')
      }

      const formData = new FormData()
      formData.append('file', file)
      if (userId) {
        formData.append('user_id', userId)
      }

      const response = await api.post('/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.success ? 'Resume parsed successfully' : response.data.error
      }
    } catch (error) {
      console.error('Resume parsing error:', error)
      
      if (error.response) {
        // Server responded with error status
        throw new Error(error.response.data.detail || 'Resume parsing failed')
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Unable to connect to resume parser service')
      } else {
        // Something else happened
        throw new Error(error.message || 'An unexpected error occurred')
      }
    }
  }

  /**
   * Check if the resume parser service is healthy
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      const response = await api.get('/health')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Health check failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get all resumes for a user
   * @param {string} userId - User ID to get resumes for
   * @returns {Promise<Object>} List of resumes
   */
  async getResumes(userId = null) {
    try {
      const params = userId ? { user_id: userId } : {}
      const response = await api.get('/resumes', { params })
      return {
        success: response.data.success,
        data: response.data.resumes,
        error: response.data.error
      }
    } catch (error) {
      console.error('Get resumes error:', error)
      return {
        success: false,
        error: error.message || 'Failed to retrieve resumes'
      }
    }
  }

  /**
   * Get a specific resume by ID
   * @param {string} resumeId - Resume ID
   * @returns {Promise<Object>} Resume data
   */
  async getResume(resumeId) {
    try {
      const response = await api.get(`/resumes/${resumeId}`)
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.error
      }
    } catch (error) {
      console.error('Get resume error:', error)
      return {
        success: false,
        error: error.message || 'Failed to retrieve resume'
      }
    }
  }

  /**
   * Delete a resume by ID
   * @param {string} resumeId - Resume ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteResume(resumeId) {
    try {
      const response = await api.delete(`/resumes/${resumeId}`)
      return {
        success: response.data.success,
        message: response.data.message
      }
    } catch (error) {
      console.error('Delete resume error:', error)
      return {
        success: false,
        error: error.message || 'Failed to delete resume'
      }
    }
  }

  /**
   * Get supported file types
   * @returns {Array} Array of supported file types
   */
  getSupportedFileTypes() {
    return [
      { type: 'application/pdf', extension: '.pdf', name: 'PDF' },
      { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extension: '.docx', name: 'DOCX' },
      { type: 'text/plain', extension: '.txt', name: 'TXT' }
    ]
  }
}

export default new ResumeService()
