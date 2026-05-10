/**
 * Recommendation Service — project Flask API behind nginx `/api/recommend` and `/api/projects`.
 */
import { apiUrl } from '../config/apiBase'

class RecommendationService {
  async getRecommendations(completedTopics, domain = null, difficulty = null, limit = 5) {
    try {
      const goal = `I have completed: ${completedTopics.join(', ')}. What should I build next?`

      const response = await fetch(apiUrl('/api/recommend'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aim: goal,
          domain,
          difficulty,
          limit,
        }),
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

  async getRecommendationsForSkill(skill, domain = null, limit = 3) {
    try {
      const goal = `I want to practice ${skill} by building projects`

      const response = await fetch(apiUrl('/api/recommend'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aim: goal,
          domain,
          limit,
        }),
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

  async searchProjects(technology, limit = 5) {
    try {
      const response = await fetch(
        `${apiUrl('/api/projects')}?search=${encodeURIComponent(technology)}&limit=${limit}`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.projects || data.search_results || []
    } catch (error) {
      console.error('Error searching projects:', error)
      return []
    }
  }

  /**
   * Backend has no `/api/recommend/feedback` yet — kept as a no-op so UI does not hard-fail.
   */
  async submitFeedback(userId, projectId, rating, feedback = '') {
    try {
      const response = await fetch(apiUrl('/api/recommend/feedback'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          project_id: projectId,
          rating,
          feedback,
        }),
      })

      if (!response.ok) {
        return null
      }

      return await response.json()
    } catch {
      return null
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(apiUrl('/api/projects/stats'))
      return response.ok
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }
}

export default new RecommendationService()
