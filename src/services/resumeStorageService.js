import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8001'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Get all resumes for a user
export const getResumes = async (userId = null) => {
  try {
    const params = userId ? { user_id: userId } : {}
    const response = await api.get('/resumes', { params })
    return {
      success: response.data.success,
      resumes: response.data.resumes || [],
      error: response.data.error
    }
  } catch (error) {
    console.error('Error fetching resumes:', error)
    return {
      success: false,
      resumes: [],
      error: error.response?.data?.error || 'Failed to fetch resumes'
    }
  }
}

// Get a specific resume by ID
export const getResume = async (resumeId) => {
  try {
    const response = await api.get(`/resumes/${resumeId}`)
    return {
      success: response.data.success,
      data: response.data.data,
      error: response.data.error
    }
  } catch (error) {
    console.error('Error fetching resume:', error)
    return {
      success: false,
      data: null,
      error: error.response?.data?.error || 'Failed to fetch resume'
    }
  }
}

// Delete a resume by ID
export const deleteResume = async (resumeId) => {
  try {
    const response = await api.delete(`/resumes/${resumeId}`)
    return {
      success: response.data.success,
      message: response.data.message,
      error: response.data.error
    }
  } catch (error) {
    console.error('Error deleting resume:', error)
    return {
      success: false,
      message: null,
      error: error.response?.data?.error || 'Failed to delete resume'
    }
  }
}

// Parse and store a resume file
export const parseAndStoreResume = async (file, userId = null) => {
  try {
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
      error: response.data.error
    }
  } catch (error) {
    console.error('Error parsing resume:', error)
    return {
      success: false,
      data: null,
      error: error.response?.data?.error || 'Failed to parse resume'
    }
  }
}

export default {
  getResumes,
  getResume,
  deleteResume,
  parseAndStoreResume
}

