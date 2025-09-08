const API_BASE_URL = 'http://localhost:5000/api/admin'

class AdminService {
  // Get auth token
  getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  // Get admin dashboard stats
  async getAdminStats() {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to fetch admin stats')
    }

    return response.json()
  }

  // Get all users with pagination and filters
  async getUsers(page = 1, limit = 20, search = '', role = '', status = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(role && { role }),
      ...(status && { status })
    })

    const response = await fetch(`${API_BASE_URL}/users?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }

    return response.json()
  }

  // Update user role or status
  async updateUser(userId, updates) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      throw new Error('Failed to update user')
    }

    return response.json()
  }

  // Delete user
  async deleteUser(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to delete user')
    }

    return response.json()
  }

  // Get system health
  async getSystemHealth() {
    const response = await fetch(`${API_BASE_URL}/system/health`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to fetch system health')
    }

    return response.json()
  }

  // Get recent activity
  async getRecentActivity(limit = 50) {
    const response = await fetch(`${API_BASE_URL}/activity?limit=${limit}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to fetch recent activity')
    }

    return response.json()
  }

  // Get analytics data
  async getAnalytics(days = 30) {
    const response = await fetch(`${API_BASE_URL}/analytics?days=${days}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to fetch analytics')
    }

    return response.json()
  }

  // Check if current user is admin
  isAdmin() {
    const user = localStorage.getItem('user')
    if (!user) return false
    
    try {
      const userData = JSON.parse(user)
      return userData.isAdmin === 'true' || userData.isAdmin === true
    } catch {
      return false
    }
  }
}

export default new AdminService()
