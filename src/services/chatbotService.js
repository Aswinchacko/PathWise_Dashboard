import axios from 'axios'

const CHATBOT_API_URL = 'http://localhost:8004'
const ROADMAP_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const chatbotService = {
  // Send a message to the chatbot
  async sendMessage(message, userId = 'anonymous', chatId = null) {
    try {
      const response = await axios.post(`${CHATBOT_API_URL}/chat`, {
        message,
        user_id: userId,
        chat_id: chatId
      })
      return response.data
    } catch (error) {
      console.error('Error sending message to chatbot:', error)
      throw new Error('Failed to get response from chatbot')
    }
  },

  // Create a new chat
  async createNewChat(userId, title = 'New Chat') {
    try {
      console.log('Creating new chat for user:', userId, 'with title:', title)
      const response = await axios.post(`${CHATBOT_API_URL}/chats/new`, {
        user_id: userId,
        title
      })
      console.log('New chat response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error creating new chat:', error)
      console.error('Error details:', error.response?.data || error.message)
      throw new Error('Failed to create new chat')
    }
  },

  // Get user's chat history
  async getUserChats(userId, limit = 20) {
    try {
      console.log('Fetching chats for user:', userId)
      const response = await axios.get(`${CHATBOT_API_URL}/chats/${userId}?limit=${limit}`)
      console.log('Chat history response:', response.data)
      return response.data.chats || []
    } catch (error) {
      console.error('Error getting user chats:', error)
      console.error('Error details:', error.response?.data || error.message)
      return []
    }
  },

  // Get messages for a specific chat
  async getChatMessages(userId, chatId) {
    try {
      const response = await axios.get(`${CHATBOT_API_URL}/chats/${userId}/${chatId}`)
      return response.data
    } catch (error) {
      console.error('Error getting chat messages:', error)
      throw new Error('Failed to get chat messages')
    }
  },

  // Delete a chat
  async deleteChat(userId, chatId) {
    try {
      const response = await axios.delete(`${CHATBOT_API_URL}/chats/${userId}/${chatId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting chat:', error)
      throw new Error('Failed to delete chat')
    }
  },

  // Update chat title
  async updateChatTitle(userId, chatId, title) {
    try {
      const response = await axios.put(`${CHATBOT_API_URL}/chats/${userId}/${chatId}/title?title=${encodeURIComponent(title)}`)
      return response.data
    } catch (error) {
      console.error('Error updating chat title:', error)
      throw new Error('Failed to update chat title')
    }
  },

  // Get conversation starter suggestions
  async getSuggestions() {
    try {
      const response = await axios.get(`${CHATBOT_API_URL}/suggestions`)
      return response.data.suggestions
    } catch (error) {
      console.error('Error getting suggestions:', error)
      return []
    }
  },

  // Check if chatbot service is healthy
  async checkHealth() {
    try {
      const response = await axios.get(`${CHATBOT_API_URL}/health`)
      return response.data.status === 'healthy'
    } catch (error) {
      console.error('Chatbot service is not available:', error)
      return false
    }
  },

  // Generate a roadmap
  async generateRoadmap(goal, userId, domain = null) {
    try {
      const response = await axios.post(`${CHATBOT_API_URL}/roadmap/generate`, {
        goal,
        user_id: userId,
        domain
      })
      return response.data
    } catch (error) {
      console.error('Error generating roadmap:', error)
      throw new Error('Failed to generate roadmap')
    }
  },

  // User roadmaps live in the roadmap service (same DB as Roadmap page)
  async getUserRoadmaps(userId) {
    if (!userId) return []
    try {
      const response = await axios.get(
        `${ROADMAP_API_BASE}/api/roadmap/roadmaps/user/${encodeURIComponent(userId)}`
      )
      return response.data.roadmaps || []
    } catch (error) {
      console.error('Error getting user roadmaps:', error)
      return []
    }
  },

  async deleteRoadmap(roadmapId, userId) {
    try {
      const response = await axios.delete(
        `${ROADMAP_API_BASE}/api/roadmap/roadmaps/${encodeURIComponent(roadmapId)}`,
        { params: { user_id: userId } }
      )
      return response.data
    } catch (error) {
      console.error('Error deleting roadmap:', error)
      throw new Error('Failed to delete roadmap')
    }
  },

  // Get available domains
  async getAvailableDomains() {
    try {
      const response = await axios.get(`${CHATBOT_API_URL}/roadmap/domains`)
      return response.data.domains || []
    } catch (error) {
      console.error('Error getting domains:', error)
      return []
    }
  },

  // Create roadmap from chat
  async createRoadmapFromChat(userId, chatId, title, goal, domain = null) {
    try {
      console.log('Creating roadmap from chat:', { userId, chatId, title, goal, domain })
      const response = await axios.post(`${CHATBOT_API_URL}/roadmap/create-from-chat`, {
        user_id: userId,
        chat_id: chatId,
        title,
        goal,
        domain
      })
      console.log('Roadmap creation response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error creating roadmap from chat:', error)
      console.error('Error details:', error.response?.data || error.message)
      throw new Error('Failed to create roadmap from chat')
    }
  }
}

export default chatbotService
