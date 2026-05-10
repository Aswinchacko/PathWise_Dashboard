import axios from 'axios'
import { getPublicApiOrigin } from '../config/apiBase'

// Create axios instance with default config (nginx /api/resume -> resume-parser)
const api = axios.create({
  baseURL: getPublicApiOrigin(),
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

      // Skip frontend content validation - let backend handle it
      // This allows any properly formatted resume file to be uploaded
      // regardless of filename or content patterns

      const formData = new FormData()
      formData.append('file', file)
      if (userId) {
        formData.append('user_id', userId)
      }

      const response = await api.post('/api/resume/parse', formData, {
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
      const response = await api.get('/api/resume/health')
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
      const response = await api.get('/api/resume/resumes', { params })
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
      const response = await api.get(`/api/resume/resumes/${resumeId}`)
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
   * Extract text content from PDF/DOCX files for validation
   * @param {File} file - The file to extract text from
   * @returns {Promise<string>} Extracted text content
   */
  async extractTextFromFile(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('extract_text_only', 'true') // Flag for text extraction only

      const response = await api.post('/api/resume/extract-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 20000 // Longer timeout for text extraction
      })

      return response.data.text || ''
    } catch (error) {
      console.error('Text extraction error:', error)
      
      // Fallback: If new endpoint fails, try using parse endpoint
      try {
        console.log('Falling back to parse endpoint for text extraction...')
        const formData = new FormData()
        formData.append('file', file)

        const response = await api.post('/api/resume/parse', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 20000
        })

        if (response.data.success && response.data.data) {
          return response.data.data.raw_text || ''
        }
      } catch (fallbackError) {
        console.error('Fallback text extraction also failed:', fallbackError)
      }
      
      throw new Error('Failed to extract text from file')
    }
  }

  /**
   * Quick validation for PDF/DOCX files - parses content and checks if it's resume-like
   * @param {File} file - The file to validate
   * @param {string} userId - Optional user ID
   * @returns {Promise<Object>} Quick validation result
   */
  async quickValidateResume(file, userId = null) {
    try {
      // Use the existing parse endpoint to validate content
      const formData = new FormData()
      formData.append('file', file)
      if (userId) {
        formData.append('user_id', userId)
      }

      const response = await api.post('/api/resume/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 15000 // Shorter timeout for quick validation
      })

      if (!response.data.success) {
        return {
          success: false,
          isResume: false,
          confidence: 0,
          reasoning: 'Failed to parse file - may not contain resume content',
          missingElements: [],
          suggestions: ['Please ensure this is a valid resume document']
        }
      }

      const parsedData = response.data.data
      
      // Check if parsed data looks like a resume
      const hasName = parsedData.name && parsedData.name.trim().length > 0
      const hasEmail = parsedData.email && parsedData.email.includes('@')
      const hasExperience = parsedData.experience && parsedData.experience.length > 0
      const hasEducation = parsedData.education && parsedData.education.length > 0
      const hasSkills = parsedData.skills && parsedData.skills.length > 0
      
      let score = 0
      let missingElements = []
      
      if (hasName) score += 20
      else missingElements.push('Name')
      
      if (hasEmail) score += 20
      else missingElements.push('Email')
      
      if (hasExperience) score += 25
      else missingElements.push('Work Experience')
      
      if (hasEducation) score += 20
      else missingElements.push('Education')
      
      if (hasSkills) score += 15
      else missingElements.push('Skills')
      
      const isResume = score >= 60
      const confidence = Math.min(score, 100)
      
      let reasoning = ''
      if (isResume) {
        reasoning = 'File contains professional resume information with good structure'
      } else {
        reasoning = `File appears to be missing key resume elements: ${missingElements.join(', ')}`
      }
      
      return {
        success: true,
        isResume,
        confidence,
        reasoning,
        missingElements,
        suggestions: isResume ? [] : [`Add missing elements: ${missingElements.join(', ')}`]
      }
    } catch (error) {
      console.error('Quick validation error:', error)
      return {
        success: false,
        isResume: false,
        confidence: 0,
        reasoning: 'Failed to validate file content',
        missingElements: [],
        suggestions: ['Please ensure this is a valid resume document']
      }
    }
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
