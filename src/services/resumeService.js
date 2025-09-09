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
   * Validate if file content appears to be a resume
   * @param {File} file - The file to validate
   * @returns {Promise<boolean>} True if file appears to be a resume
   */
  async validateResumeContent(file) {
    return new Promise((resolve) => {
      if (file.type === 'text/plain') {
        // For text files, we can read and validate content
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target.result.toLowerCase()
          const isResume = this.checkResumePatterns(content)
          resolve(isResume)
        }
        reader.onerror = () => resolve(false)
        reader.readAsText(file)
      } else {
        // For PDF and DOCX, we'll rely on filename patterns and let backend validate
        const isResumeFilename = this.checkResumeFilename(file.name)
        resolve(isResumeFilename)
      }
    })
  }

  /**
   * Check if content contains resume-like patterns
   * @param {string} content - File content to check
   * @returns {boolean} True if content appears to be a resume
   */
  checkResumePatterns(content) {
    // Resume keywords that should be present
    const resumeKeywords = [
      // Contact information patterns
      'email', 'phone', 'address', 'linkedin', 'github',
      // Professional sections
      'experience', 'education', 'skills', 'work', 'employment',
      'qualification', 'degree', 'university', 'college',
      // Action words commonly found in resumes
      'managed', 'developed', 'created', 'led', 'achieved',
      'responsible', 'implemented', 'designed', 'coordinated',
      // Professional titles
      'engineer', 'developer', 'manager', 'analyst', 'specialist',
      'consultant', 'director', 'coordinator', 'assistant'
    ]

    // Resume section headers
    const resumeSections = [
      'objective', 'summary', 'profile', 'about',
      'work experience', 'professional experience', 'employment history',
      'education', 'academic background', 'qualifications',
      'skills', 'technical skills', 'core competencies',
      'achievements', 'accomplishments', 'awards',
      'certifications', 'licenses', 'projects',
      'references', 'contact', 'personal information'
    ]

    // Date patterns (years, date ranges common in resumes)
    const datePatterns = [
      /\b(19|20)\d{2}\b/g, // Years like 2020, 1995
      /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/gi, // Month names
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, // Date formats like 01/2020
      /\b(19|20)\d{2}\s*[-–—]\s*(19|20)\d{2}\b/g, // Year ranges like 2018-2020
    ]

    let score = 0
    
    // Check for resume keywords (higher weight for multiple matches)
    const foundKeywords = resumeKeywords.filter(keyword => 
      content.includes(keyword)
    ).length
    score += Math.min(foundKeywords * 2, 20) // Max 20 points from keywords

    // Check for resume sections (higher weight as these are more specific)
    const foundSections = resumeSections.filter(section => 
      content.includes(section)
    ).length
    score += foundSections * 5 // 5 points per section

    // Check for date patterns (resumes typically have multiple dates)
    let dateMatches = 0
    datePatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) dateMatches += matches.length
    })
    score += Math.min(dateMatches * 2, 15) // Max 15 points from dates

    // Check for email pattern (almost all resumes have email)
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    if (content.match(emailPattern)) {
      score += 10
    }

    // Check for phone pattern
    const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g
    if (content.match(phonePattern)) {
      score += 8
    }

    // Minimum score threshold for resume detection
    return score >= 25
  }

  /**
   * Check if filename suggests it's a resume
   * @param {string} filename - Name of the file
   * @returns {boolean} True if filename appears to be resume-related
   */
  checkResumeFilename(filename) {
    const resumeFilenamePatterns = [
      /resume/i, /cv/i, /curriculum/i, /vitae/i,
      /profile/i, /bio/i, /background/i
    ]
    
    return resumeFilenamePatterns.some(pattern => pattern.test(filename))
  }

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

      // Validate resume content
      const isResumeContent = await this.validateResumeContent(file)
      if (!isResumeContent) {
        throw new Error('The uploaded file does not appear to be a resume. Please upload a valid resume document containing professional information such as work experience, education, and skills.')
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

  /**
   * Test resume validation (for development/testing)
   * @param {File} file - File to test
   * @returns {Promise<Object>} Validation result with details
   */
  async testResumeValidation(file) {
    try {
      const isValid = await this.validateResumeContent(file)
      return {
        isValid,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        filenameValid: this.checkResumeFilename(file.name)
      }
    } catch (error) {
      return {
        isValid: false,
        error: error.message,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size
      }
    }
  }
}

export default new ResumeService()
