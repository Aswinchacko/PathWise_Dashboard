const API_BASE_URL = 'http://localhost:5000/api'

class DiscussionService {
  async getDiscussions(category = null) {
    try {
      const url = category ? `${API_BASE_URL}/discussions?category=${encodeURIComponent(category)}` : `${API_BASE_URL}/discussions`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch discussions')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching discussions:', error)
      throw error
    }
  }

  async getDiscussion(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/discussions/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch discussion')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching discussion:', error)
      throw error
    }
  }

  async createDiscussion(discussionData) {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }

      console.log('Creating discussion with token:', token.substring(0, 20) + '...')
      
      const response = await fetch(`${API_BASE_URL}/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(discussionData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Backend error:', errorData)
        throw new Error(errorData.message || errorData.error || 'Failed to create discussion')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating discussion:', error)
      throw error
    }
  }

  async addComment(discussionId, commentText) {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }

      console.log('Adding comment with token:', token.substring(0, 20) + '...')
      
      const response = await fetch(`${API_BASE_URL}/discussions/${discussionId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentText })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Backend error:', errorData)
        throw new Error(errorData.message || errorData.error || 'Failed to add comment')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error adding comment:', error)
      throw error
    }
  }

  async likeDiscussion(discussionId) {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }

      console.log('Liking discussion with token:', token.substring(0, 20) + '...')
      
      const response = await fetch(`${API_BASE_URL}/discussions/${discussionId}/like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Backend error:', errorData)
        throw new Error(errorData.message || errorData.error || 'Failed to like discussion')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error liking discussion:', error)
      throw error
    }
  }
}

export default new DiscussionService()
