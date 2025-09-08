/**
 * Recommendation Service
 * Handles project recommendations based on completed roadmap topics
 */

const RECOMMENDATION_API_URL = 'http://localhost:8002'

class RecommendationService {
  /**
   * Get project recommendations based on completed topics
   * @param {Array} completedTopics - Array of completed topic names
   * @param {string} domain - Current roadmap domain
   * @param {string} difficulty - Preferred difficulty level
   * @param {number} limit - Number of recommendations to return
   */
  async getRecommendations(completedTopics, domain = null, difficulty = null, limit = 5) {
    try {
      // Create a goal string from completed topics
      const goal = `I have completed: ${completedTopics.join(', ')}. What should I build next?`
      
      const response = await fetch(`${RECOMMENDATION_API_URL}/api/recommend/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal,
          domain,
          difficulty,
          limit
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.recommendations || []
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      return []
    }
  }

  /**
   * Get project recommendations based on a specific skill
   * @param {string} skill - The skill name
   * @param {string} domain - Current roadmap domain
   * @param {number} limit - Number of recommendations to return
   */
  async getRecommendationsForSkill(skill, domain = null, limit = 3) {
    try {
      const goal = `I want to practice ${skill} by building projects`
      
      const response = await fetch(`${RECOMMENDATION_API_URL}/api/recommend/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal,
          domain,
          limit
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.recommendations || []
    } catch (error) {
      console.error('Error fetching skill recommendations:', error)
      return []
    }
  }

  /**
   * Search for projects by technology
   * @param {string} technology - Technology to search for
   * @param {number} limit - Number of results to return
   */
  async searchProjects(technology, limit = 5) {
    try {
      const response = await fetch(
        `${RECOMMENDATION_API_URL}/api/recommend/projects/search?query=${encodeURIComponent(technology)}&limit=${limit}`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.search_results || []
    } catch (error) {
      console.error('Error searching projects:', error)
      return []
    }
  }

  /**
   * Submit feedback for a project recommendation
   * @param {string} userId - User ID
   * @param {string} projectId - Project ID
   * @param {number} rating - Rating from 1-5
   * @param {string} feedback - Optional feedback text
   */
  async submitFeedback(userId, projectId, rating, feedback = '') {
    try {
      const response = await fetch(`${RECOMMENDATION_API_URL}/api/recommend/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          project_id: projectId,
          rating,
          feedback
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error submitting feedback:', error)
      return null
    }
  }

  /**
   * Check if recommendation service is available
   */
  async checkHealth() {
    try {
      const response = await fetch(`${RECOMMENDATION_API_URL}/health`)
      return response.ok
    } catch (error) {
      return false
    }
  }
}

export default new RecommendationService()

