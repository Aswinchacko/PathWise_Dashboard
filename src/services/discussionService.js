import { expressApiUrl } from '../config/apiBase'

const DISCUSSIONS_BASE = expressApiUrl('/api/discussions')

class DiscussionService {
  async getDiscussions(category = null) {
    try {
      const url = category
        ? `${DISCUSSIONS_BASE}?category=${encodeURIComponent(category)}`
        : DISCUSSIONS_BASE
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
      const response = await fetch(`${DISCUSSIONS_BASE}/${id}`, {
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
      
      const response = await fetch(DISCUSSIONS_BASE, {
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
      
      const response = await fetch(`${DISCUSSIONS_BASE}/${discussionId}/comments`, {
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
      
      const response = await fetch(`${DISCUSSIONS_BASE}/${discussionId}/like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json().catch(() => ({}))

      if (response.status === 409) {
        return {
          likes: data.likes,
          likedByMe: true,
          alreadyLiked: true
        }
      }

      if (!response.ok) {
        console.error('Backend error:', data)
        throw new Error(data.message || data.error || 'Failed to like discussion')
      }

      return {
        likes: data.likes,
        likedByMe: data.likedByMe !== false,
        alreadyLiked: false
      }
    } catch (error) {
      console.error('Error liking discussion:', error)
      throw error
    }
  }
}

export default new DiscussionService()
