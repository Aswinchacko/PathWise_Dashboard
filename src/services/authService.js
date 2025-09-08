const API_BASE_URL = 'http://localhost:5000/api/auth'

class AuthService {
  // Login user
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    
    const data = await response.json()
    
    if (response.ok) {
      // Store token and user data
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data
    } else {
      throw new Error(data.message || 'Login failed')
    }
  }

  // Google OAuth login
  async googleLogin(token) {
    const response = await fetch(`${API_BASE_URL}/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })
    
    const data = await response.json()
    
    if (response.ok) {
      // Store token and user data
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data
    } else {
      throw new Error(data.message || 'Google login failed')
    }
  }

  // GitHub OAuth login
  async githubLogin(code) {
    const response = await fetch(`${API_BASE_URL}/github`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })
    
    const data = await response.json()
    
    if (response.ok) {
      // Store token and user data
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data
    } else {
      throw new Error(data.message || 'GitHub login failed')
    }
  }

  // LinkedIn OAuth login
  async linkedinLogin(code) {
    const response = await fetch(`${API_BASE_URL}/linkedin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })
    
    const data = await response.json()
    
    if (response.ok) {
      // Store token and user data
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data
    } else {
      throw new Error(data.message || 'LinkedIn login failed')
    }
  }

  // Register user
  async register(firstName, lastName, email, password) {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firstName, lastName, email, password }),
    })
    
    const data = await response.json()
    
    if (response.ok) {
      // Store token and user data
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data
    } else {
      throw new Error(data.message || 'Registration failed')
    }
  }

  // Get user profile
  async getProfile() {
    const token = this.getToken()
    if (!token) {
      throw new Error('No token found')
    }

    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    
    if (response.ok) {
      return data
    } else {
      throw new Error(data.message || 'Failed to get profile')
    }
  }

  // Update user profile
  async updateProfile(firstName, lastName) {
    const token = this.getToken()
    if (!token) {
      throw new Error('No token found')
    }

    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firstName, lastName }),
    })
    
    const data = await response.json()
    
    if (response.ok) {
      // Update stored user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const updatedUser = { ...currentUser, firstName, lastName }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return data
    } else {
      throw new Error(data.message || 'Failed to update profile')
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Get current token
  getToken() {
    return localStorage.getItem('token')
  }

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken()
  }

  // Check if user is admin
  isAdmin() {
    const user = this.getCurrentUser()
    return user && (user.isAdmin === 'true' || user.isAdmin === true)
  }
}

export default new AuthService() 