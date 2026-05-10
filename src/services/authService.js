import { expressApiUrl } from '../config/apiBase'

const API_BASE_URL = expressApiUrl('/api/auth')

/** Avoid `Unexpected end of JSON input` when proxy returns an empty body */
async function parseAuthJson(response) {
  const text = await response.text()
  if (!text?.trim()) {
    throw new Error(
      `Empty response from auth API (HTTP ${response.status}). ` +
        'Run auth_back on port 5000 and restart the dashboard dev server, or point DEV_PROXY_AUTH_TARGET at your auth server.'
    )
  }
  try {
    return JSON.parse(text)
  } catch {
    if (response.status === 404) {
      throw new Error(
        'Auth API 404 — the request did not reach auth_back. Set VITE_EXPRESS_PUBLIC_ORIGIN on Vercel ' +
          `to your Express origin (e.g. https://api.yourdomain.com or http://YOUR_IP:5000), redeploy. ` +
          `Do not point only VITE_PUBLIC_API_URL at roadmap (:8000) without Express; POST /api/auth/google lives on auth_back.`
      )
    }
    throw new Error(`Auth API returned non-JSON (HTTP ${response.status}).`)
  }
}

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
    
    const data = await parseAuthJson(response)

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
    
    const data = await parseAuthJson(response)

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
    
    const data = await parseAuthJson(response)

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
    
    const data = await parseAuthJson(response)

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
    
    const data = await parseAuthJson(response)

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
    
    const data = await parseAuthJson(response)

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
    
    const data = await parseAuthJson(response)

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
    try {
      window.google?.accounts?.id?.cancel()
    } catch {
      /* ignore */
    }
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