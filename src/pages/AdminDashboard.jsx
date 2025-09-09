import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import UserManagement from './admin/UserManagement'
import SystemHealth from './admin/SystemHealth'
import Analytics from './admin/Analytics'
import ActivityLogs from './admin/ActivityLogs'
import {
  Users,
  Shield,
  Activity,
  BarChart3,
  Settings,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  TrendingUp,
  TrendingDown,
  Eye,
  Calendar,
  Download,
  Upload,
  MessageSquare,
  FileText,
  Target,
  Bot,
  ArrowRight,
  LogOut,
  Plus,
  Mail,
  Info,
  XCircle
} from 'lucide-react'
import './AdminDashboard.css'
import './admin/UserManagement.css'
import adminService from '../services/adminService'
import authService from '../services/authService'

const AdminDashboard = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Determine active tab from URL path
  const getActiveTabFromPath = (pathname) => {
    if (pathname === '/admin') return 'overview'
    if (pathname === '/admin/users') return 'users'
    if (pathname === '/admin/system') return 'system'
    if (pathname === '/admin/activity') return 'activity'
    if (pathname === '/admin/analytics') return 'analytics'
    if (pathname === '/admin/content') return 'content'
    if (pathname === '/admin/discussions') return 'discussions'
    if (pathname === '/admin/reports') return 'reports'
    return 'overview'
  }

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath(location.pathname))
  const [stats, setStats] = useState({
    users: {
      total: 0,
      active: 0,
      newThisMonth: 0,
      byRole: {
        admin: 0,
        moderator: 0,
        user: 0
      }
    },
    discussions: {
      total: 0,
      activeThisWeek: 0
    },
    recentUsers: [],
    lastUpdated: null
  })
  const [users, setUsers] = useState([])
  const [systemHealth, setSystemHealth] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // User management filters
  const [userSearch, setUserSearch] = useState('')
  const [userRole, setUserRole] = useState('')
  const [userStatus, setUserStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [userLoading, setUserLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    isActive: true
  })

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, path: '/admin' },
    { id: 'users', label: 'User Management', icon: Users, path: '/admin/users' },
    { id: 'system', label: 'System Health', icon: Server, path: '/admin/system' },
    { id: 'activity', label: 'Recent Activity', icon: Activity, path: '/admin/activity' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/admin/analytics' }
  ]

  useEffect(() => {
    loadInitialData()
  }, [])

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getActiveTabFromPath(location.pathname))
  }, [location.pathname])

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers()
    }
  }, [activeTab, userSearch, userRole, userStatus, currentPage])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [statsData, healthData, activityData, analyticsData] = await Promise.allSettled([
        adminService.getAdminStats(),
        adminService.getSystemHealth(),
        adminService.getRecentActivity(20),
        adminService.getAnalytics(30)
      ])

      if (statsData.status === 'fulfilled') {
        setStats(statsData.value)
      }

      if (healthData.status === 'fulfilled') {
        setSystemHealth(healthData.value)
      }

      if (activityData.status === 'fulfilled') {
        setRecentActivity(activityData.value)
      }

      if (analyticsData.status === 'fulfilled') {
        setAnalytics(analyticsData.value)
      }

      const errors = [statsData, healthData, activityData, analyticsData]
        .filter(result => result.status === 'rejected')
        .map(result => result.reason.message)

      if (errors.length > 0) {
        setError(`Some data failed to load: ${errors.join(', ')}`)
      }

    } catch (error) {
      console.error('Error loading admin data:', error)
      setError('Failed to load admin dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      setUserLoading(true)
      const response = await adminService.getUsers(currentPage, 20, userSearch, userRole, userStatus)
      setUsers(response.users)
      setTotalPages(response.totalPages)
      setTotalUsers(response.total)
    } catch (error) {
      console.error('Error loading users:', error)
      setError('Failed to load users')
    } finally {
      setUserLoading(false)
    }
  }

  const handleUserUpdate = async (userId, updates) => {
    try {
      await adminService.updateUser(userId, updates)
      loadUsers() // Reload users list
      // Also refresh stats to update counts
      const statsData = await adminService.getAdminStats()
      setStats(statsData)
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user')
    }
  }

  const handleUserDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(userId)
        loadUsers() // Reload users list
        // Also refresh stats to update counts
        const statsData = await adminService.getAdminStats()
        setStats(statsData)
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Failed to delete user')
      }
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return

    try {
      const promises = selectedUsers.map(userId => {
        switch (bulkAction) {
          case 'activate':
            return adminService.updateUser(userId, { isActive: true })
          case 'deactivate':
            return adminService.updateUser(userId, { isActive: false })
          default:
            return Promise.resolve()
        }
      })

      await Promise.all(promises)
      setSelectedUsers([])
      setBulkAction('')
      loadUsers()
      // Also refresh stats to update counts
      const statsData = await adminService.getAdminStats()
      setStats(statsData)
    } catch (error) {
      console.error('Error performing bulk action:', error)
      alert('Failed to perform bulk action')
    }
  }

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(user => user._id))
    }
  }

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Created At'],
      ...users.map(user => [
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.role || 'user',
        user.isActive ? 'Active' : 'Inactive',
        new Date(user.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleEditUser = (user) => {
    console.log('Opening edit modal for user:', user)
    setEditingUser(user)
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.role || 'user',
      isActive: user.isActive !== undefined ? user.isActive : true
    })
    setShowEditModal(true)
    console.log('Edit modal state set to:', true)
  }

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return

    // Validate required fields
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()) {
      alert('Please fill in all required fields (First Name, Last Name, Email)')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!editForm.email.trim() || !emailRegex.test(editForm.email.trim())) {
      alert('Please enter a valid email address')
      return
    }

    try {
      setEditSaving(true)
      console.log('Saving user data:', {
        userId: editingUser._id,
        updates: editForm
      })
      
      const updatedUser = await adminService.updateUser(editingUser._id, editForm)
      console.log('User updated successfully:', updatedUser)
      
      // Close modal and reset form
      setShowEditModal(false)
      setEditingUser(null)
      setEditForm({
        firstName: '',
        lastName: '',
        email: '',
        role: 'user',
        isActive: true
      })
      
      // Reload data
      await loadUsers()
      
      // Refresh stats to update counts
      try {
        const statsData = await adminService.getAdminStats()
        setStats(statsData)
      } catch (statsError) {
        console.warn('Failed to refresh stats:', statsError)
      }

      // Refresh activity data to show the update
      await refreshActivityData()
      
      // Success feedback
      alert('User updated successfully!')
      
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user: ' + (error.message || 'Unknown error'))
    } finally {
      setEditSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setShowEditModal(false)
    setEditingUser(null)
    setEditForm({
      firstName: '',
      lastName: '',
      email: '',
      role: 'user',
      isActive: true
    })
  }

  const handleRefresh = () => {
    loadInitialData()
  }

  // Function to refresh activity data after user actions
  const refreshActivityData = async () => {
    try {
      const activityData = await adminService.getRecentActivity(20)
      setRecentActivity(activityData)
    } catch (error) {
      console.warn('Failed to refresh activity data:', error)
    }
  }

  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    authService.logout()
    navigate('/login')
  }

  // Helper function to calculate growth percentage
  const calculateGrowthPercentage = (data, type = 'user') => {
    if (!data || data.length < 2) return 0
    
    const recent = data[data.length - 1]?.count || 0
    const previous = data[data.length - 2]?.count || 0
    
    if (previous === 0) return recent > 0 ? 100 : 0
    
    return Math.round(((recent - previous) / previous) * 100)
  }

  // Helper function to format large numbers
  const formatNumber = (num) => {
    if (!num) return 0
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / (24 * 60 * 60))
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((seconds % (60 * 60)) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!adminService.isAdmin()) {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <Shield size={64} />
          <h2>Access Denied</h2>
          <p>You need administrator privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="admin-title">
              <Shield size={28} />
              Admin Dashboard
            </h1>
            <p className="admin-subtitle">Manage users, monitor system health, and view analytics</p>
          </div>
          <div className="header-actions">
            {error && (
              <div className="error-indicator" title={error}>
                <AlertTriangle size={16} />
                <span>Some services unavailable</span>
              </div>
            )}
            <button 
              className="btn-secondary"
              onClick={() => navigate('/dashboard')}
              title="Switch to User Dashboard"
            >
              <Eye size={20} />
              User View
            </button>
            <button 
              className={`refresh-btn ${loading ? 'loading' : ''}`}
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={20} className={loading ? 'spinning' : ''} />
              Refresh
            </button>
            <button 
              className="logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => navigate(tab.path)}
            >
              <Icon size={20} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      {/* Tab Content */}
      <div className="admin-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overview-tab"
          >
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card users-card">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <h3>{loading ? '...' : formatNumber(stats?.users?.total) || 0}</h3>
                  <p>Total Users</p>
                  <div className="stat-detail">
                    <span className="active">{stats?.users?.active || 0} Active</span>
                    <span className="new">+{stats?.users?.newThisMonth || 0} This Month</span>
                  </div>
                </div>
                <div className={`stat-trend ${calculateGrowthPercentage(analytics?.userGrowth) >= 0 ? 'positive' : 'negative'}`}>
                  {calculateGrowthPercentage(analytics?.userGrowth) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {calculateGrowthPercentage(analytics?.userGrowth) >= 0 ? '+' : ''}{calculateGrowthPercentage(analytics?.userGrowth)}%
                </div>
              </div>

              <div className="stat-card discussions-card">
                <div className="stat-icon">
                  <MessageSquare size={24} />
                </div>
                <div className="stat-content">
                  <h3>{loading ? '...' : formatNumber(stats?.discussions?.total) || 0}</h3>
                  <p>Total Discussions</p>
                  <div className="stat-detail">
                    <span className="active">{stats?.discussions?.activeThisWeek || 0} This Week</span>
                  </div>
                </div>
                <div className={`stat-trend ${calculateGrowthPercentage(analytics?.discussionGrowth) >= 0 ? 'positive' : 'negative'}`}>
                  {calculateGrowthPercentage(analytics?.discussionGrowth) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {calculateGrowthPercentage(analytics?.discussionGrowth) >= 0 ? '+' : ''}{calculateGrowthPercentage(analytics?.discussionGrowth)}%
                </div>
              </div>

              <div className="stat-card resources-card">
                <div className="stat-icon">
                  <FileText size={24} />
                </div>
                <div className="stat-content">
                  <h3>{loading ? '...' : (analytics?.userGrowth?.length || 0)}</h3>
                  <p>Data Points</p>
                  <div className="stat-detail">
                    <span className="active">{stats?.recentUsers?.length || 0} Recent Users</span>
                    <span className="new">{recentActivity?.slice(0, 7)?.length || 0} This Week</span>
                  </div>
                </div>
                <div className={`stat-trend ${calculateGrowthPercentage(analytics?.userGrowth) >= 0 ? 'positive' : 'negative'}`}>
                  {calculateGrowthPercentage(analytics?.userGrowth) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {calculateGrowthPercentage(analytics?.userGrowth) >= 0 ? '+' : ''}{calculateGrowthPercentage(analytics?.userGrowth)}%
                </div>
              </div>

              <div className="stat-card system-card">
                <div className="stat-icon">
                  <Server size={24} />
                </div>
                <div className="stat-content">
                  <h3>{systemHealth ? (systemHealth.services?.every(s => s.status === 'online') ? 'Healthy' : 'Issues') : '...'}</h3>
                  <p>System Status</p>
                  <div className="stat-detail">
                    <span className="active">{systemHealth?.services?.filter(s => s.status === 'online')?.length || 0}/{systemHealth?.services?.length || 0} Services</span>
                    <span className="uptime">
                      Uptime: {systemHealth ? formatUptime(systemHealth.server?.uptime || 0) : '...'}
                    </span>
                  </div>
                </div>
                <div className={`stat-trend ${systemHealth?.services?.every(s => s.status === 'online') ? 'positive' : 'negative'}`}>
                  {systemHealth?.services?.every(s => s.status === 'online') ? (
                    <>
                      <CheckCircle size={16} />
                      Online
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={16} />
                      {systemHealth ? 'Issues' : 'Checking...'}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="dashboard-grid">
              {/* Admin Tool Clusters */}
              <div className="admin-card clusters-card">
                <div className="card-header">
                  <h2>Admin Tools</h2>
                  <p>Organized management clusters</p>
                </div>
                <div className="admin-clusters">
                  {/* User Management Cluster */}
                  <div className="cluster-item user-cluster">
                    <div className="cluster-header">
                      <div className="cluster-icon user-icon">
                        <Users size={24} />
                      </div>
                      <div className="cluster-info">
                        <h3>User Management</h3>
                        <span className="cluster-meta">{stats?.users?.total || 0} total users</span>
                      </div>
                    </div>
                    <div className="cluster-actions">
                      <button className="cluster-btn primary" onClick={() => navigate('/admin/users')}>
                        <Users size={16} />
                        Manage Users
                      </button>
                      <button className="cluster-btn outline" onClick={() => navigate('/admin/users')}>
                        <UserCheck size={16} />
                        Permissions
                      </button>
                    </div>
                  </div>

                  {/* System Health Cluster */}
                  <div className="cluster-item system-cluster">
                    <div className="cluster-header">
                      <div className="cluster-icon system-icon">
                        <Server size={24} />
                      </div>
                      <div className="cluster-info">
                        <h3>System Health</h3>
                        <span className={`cluster-status ${systemHealth ? 'healthy' : 'checking'}`}>
                          {systemHealth ? 'All systems operational' : 'Checking status...'}
                        </span>
                      </div>
                    </div>
                    <div className="cluster-actions">
                      <button className="cluster-btn secondary" onClick={() => navigate('/admin/system')}>
                        <Database size={16} />
                        System Status
                      </button>
                      <button className="cluster-btn outline" onClick={() => navigate('/admin/system')}>
                        <Cpu size={16} />
                        Performance
                      </button>
                    </div>
                  </div>

                  {/* Analytics Cluster */}
                  <div className="cluster-item analytics-cluster">
                    <div className="cluster-header">
                      <div className="cluster-icon analytics-icon">
                        <BarChart3 size={24} />
                      </div>
                      <div className="cluster-info">
                        <h3>Analytics</h3>
                        <span className="cluster-meta">{stats?.discussions?.total || 0} discussions tracked</span>
                      </div>
                    </div>
                    <div className="cluster-actions">
                      <button className="cluster-btn tertiary" onClick={() => navigate('/admin/analytics')}>
                        <TrendingUp size={16} />
                        View Reports
                      </button>
                      <button className="cluster-btn outline" onClick={() => navigate('/admin/analytics')}>
                        <Eye size={16} />
                        Insights
                      </button>
                    </div>
                  </div>

                  {/* Content & Activity Cluster */}
                  <div className="cluster-item activity-cluster">
                    <div className="cluster-header">
                      <div className="cluster-icon activity-icon">
                        <MessageSquare size={24} />
                      </div>
                      <div className="cluster-info">
                        <h3>Content & Activity</h3>
                        <span className="cluster-meta">{recentActivity?.length || 0} recent activities</span>
                      </div>
                    </div>
                    <div className="cluster-actions">
                      <button className="cluster-btn quaternary" onClick={() => navigate('/admin/activity')}>
                        <Activity size={16} />
                        Activity Logs
                      </button>
                      <button className="cluster-btn outline" onClick={() => navigate('/admin/content')}>
                        <FileText size={16} />
                        Content
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Overview */}
              <div className="admin-card system-overview">
                <div className="card-header">
                  <h2>System Overview</h2>
                  <div className={`status-indicator ${systemHealth ? 'online' : 'offline'}`}>
                    {systemHealth ? (
                      <>
                        <CheckCircle size={16} />
                        All Systems Operational
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={16} />
                        Checking Status...
                      </>
                    )}
                  </div>
                </div>
                <div className="system-metrics">
                  <div className="metric-item">
                    <div className="metric-icon">
                      <Database size={20} />
                    </div>
                    <div className="metric-data">
                      <span className="metric-label">Database</span>
                      <span className={`metric-value ${systemHealth?.database?.status === 'connected' ? 'success' : 'error'}`}>
                        {systemHealth?.database?.status || 'Checking...'}
                      </span>
                    </div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-icon">
                      <Cpu size={20} />
                    </div>
                    <div className="metric-data">
                      <span className="metric-label">Memory Usage</span>
                      <span className="metric-value">
                        {systemHealth ? 
                          `${Math.round((systemHealth.server?.memory?.heapUsed || 0) / (systemHealth.server?.memory?.heapTotal || 1) * 100)}%` 
                          : 'Checking...'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-icon">
                      <Clock size={20} />
                    </div>
                    <div className="metric-data">
                      <span className="metric-label">Uptime</span>
                      <span className="metric-value success">
                        {systemHealth ? formatUptime(systemHealth.server?.uptime || 0) : 'Checking...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="admin-card recent-activity">
                <div className="card-header">
                  <h2>Recent Activity</h2>
                  <button className="view-all-btn" onClick={() => navigate('/admin/activity')}>
                    View All
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="activity-feed">
                  {recentActivity.slice(0, 5).map((activity, index) => {
                    const getActivityIcon = (type) => {
                      switch (type) {
                        case 'user_registration':
                          return <Users size={16} />
                        case 'discussion_created':
                          return <MessageSquare size={16} />
                        case 'system_event':
                          return <Settings size={16} />
                        case 'user_login':
                          return <UserCheck size={16} />
                        case 'roadmap_generated':
                          return <Target size={16} />
                        case 'resume_uploaded':
                          return <FileText size={16} />
                        case 'admin_action':
                          return <Shield size={16} />
                        default:
                          return <Activity size={16} />
                      }
                    }

                    const getActivityColor = (type) => {
                      switch (type) {
                        case 'user_registration':
                          return 'var(--success-600)'
                        case 'discussion_created':
                          return 'var(--info-600)'
                        case 'system_event':
                          return 'var(--warning-600)'
                        case 'user_login':
                          return 'var(--primary-600)'
                        case 'admin_action':
                          return 'var(--error-600)'
                        default:
                          return 'var(--text-secondary)'
                      }
                    }

                    const formatTimeAgo = (timestamp) => {
                      if (!timestamp) return 'Unknown time'
                      const now = new Date()
                      const diff = now - new Date(timestamp)
                      const minutes = Math.floor(diff / 60000)
                      const hours = Math.floor(diff / 3600000)
                      const days = Math.floor(diff / 86400000)

                      if (days > 0) return `${days}d ago`
                      if (hours > 0) return `${hours}h ago`
                      if (minutes > 0) return `${minutes}m ago`
                      return 'Just now'
                    }

                    return (
                      <div key={activity.id || `activity_${index}`} className="activity-item">
                        <div 
                          className="activity-icon" 
                          style={{ color: getActivityColor(activity.type) }}
                        >
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="activity-content">
                          <p>{activity.message}</p>
                          <span className="activity-time">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                          {activity.data && Object.keys(activity.data).length > 0 && (
                            <div className="activity-meta">
                              {activity.data.email && (
                                <span className="meta-item">
                                  <Mail size={12} />
                                  {activity.data.email}
                                </span>
                              )}
                              {activity.data.role && (
                                <span className="meta-item">
                                  <Shield size={12} />
                                  {activity.data.role}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {activity.severity && (
                          <div className={`activity-severity ${activity.severity}`}>
                            {activity.severity === 'success' && <CheckCircle size={14} />}
                            {activity.severity === 'warning' && <AlertTriangle size={14} />}
                            {activity.severity === 'error' && <XCircle size={14} />}
                            {activity.severity === 'info' && <Info size={14} />}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {recentActivity.length === 0 && !loading && (
                    <div className="no-activity">
                      <Activity size={32} />
                      <h4>No recent activity</h4>
                      <p>Activity will appear here as users interact with the system</p>
                    </div>
                  )}
                  {loading && (
                    <div className="no-activity">
                      <RefreshCw size={32} className="spinning" />
                      <h4>Loading activity...</h4>
                      <p>Fetching recent system activity</p>
                    </div>
                  )}
                </div>
              </div>

              {/* User Statistics */}
              <div className="admin-card user-stats">
                <div className="card-header">
                  <h2>User Statistics</h2>
                  <select className="time-selector">
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                </div>
                <div className="user-breakdown">
                  <div className="breakdown-item">
                    <div className="breakdown-label">
                      <div className="color-indicator admin"></div>
                      Administrators
                    </div>
                    <span className="breakdown-count">{stats?.users?.byRole?.admin || 0}</span>
                  </div>
                  <div className="breakdown-item">
                    <div className="breakdown-label">
                      <div className="color-indicator moderator"></div>
                      Moderators
                    </div>
                    <span className="breakdown-count">{stats?.users?.byRole?.moderator || 0}</span>
                  </div>
                  <div className="breakdown-item">
                    <div className="breakdown-label">
                      <div className="color-indicator user"></div>
                      Users
                    </div>
                    <span className="breakdown-count">{stats?.users?.byRole?.user || (stats?.users?.total - (stats?.users?.byRole?.admin || 0) - (stats?.users?.byRole?.moderator || 0)) || 0}</span>
                  </div>
                </div>
                <div className="chart-placeholder">
                  <BarChart3 size={32} />
                  <p>User growth chart</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="user-management-tab"
          >
            {/* Header */}
            <div className="page-header">
              <div className="header-content">
                <div className="header-left">
                  <h1>
                    <Users size={28} />
                    User Management
                  </h1>
                  <p>Manage user accounts, roles, and permissions ({totalUsers} total users)</p>
                </div>
                <div className="header-actions">
                  <button className="btn-secondary" onClick={exportUsers}>
                    <Download size={20} />
                    Export
                  </button>
                  <button className="btn-primary" onClick={() => alert('Add User functionality coming soon!')}>
                    <Plus size={20} />
                    Add User
                  </button>
                </div>
              </div>
            </div>

            {/* User Statistics Summary */}
            <div className="user-stats-summary">
              <div className="stat-item">
                <div className="stat-number">{stats?.users?.total || 0}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats?.users?.active || 0}</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats?.users?.newThisMonth || 0}</div>
                <div className="stat-label">New This Month</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats?.users?.byRole?.admin || 0}</div>
                <div className="stat-label">Administrators</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats?.users?.byRole?.moderator || 0}</div>
                <div className="stat-label">Moderators</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{selectedUsers.length}</div>
                <div className="stat-label">Selected</div>
              </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
              <div className="search-box">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              
              <div className="filter-group">
                <select value={userRole} onChange={(e) => setUserRole(e.target.value)}>
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="filter-group">
                <select value={userStatus} onChange={(e) => setUserStatus(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {selectedUsers.length > 0 && (
                <div className="bulk-actions">
                  <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}>
                    <option value="">Bulk Actions</option>
                    <option value="activate">Activate</option>
                    <option value="deactivate">Deactivate</option>
                  </select>
                  <button 
                    className="btn-secondary"
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                  >
                    Apply ({selectedUsers.length})
                  </button>
                </div>
              )}
            </div>

            {/* Users Table */}
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={selectAllUsers}
                      />
                    </th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td><div className="skeleton skeleton-checkbox"></div></td>
                        <td><div className="skeleton skeleton-user"></div></td>
                        <td><div className="skeleton skeleton-text"></div></td>
                        <td><div className="skeleton skeleton-badge"></div></td>
                        <td><div className="skeleton skeleton-badge"></div></td>
                        <td><div className="skeleton skeleton-text"></div></td>
                        <td><div className="skeleton skeleton-text"></div></td>
                        <td><div className="skeleton skeleton-actions"></div></td>
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        <Users size={32} style={{ opacity: 0.5, marginBottom: '16px' }} />
                        <p>No users found</p>
                        <p style={{ fontSize: '14px' }}>Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  ) : users.map(user => (
                    <tr key={user._id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => toggleUserSelection(user._id)}
                        />
                      </td>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                          <div>
                            <div className="user-name">{user.firstName} {user.lastName}</div>
                            <div className="user-id">ID: {user._id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="email-cell">
                          <Mail size={16} />
                          {user.email}
                        </div>
                      </td>
                      <td>
                        <select
                          value={user.role || 'user'}
                          onChange={(e) => handleUserUpdate(user._id, { role: e.target.value })}
                          className={`role-select ${user.role || 'user'}`}
                        >
                          <option value="user">User</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className={`status-toggle ${user.isActive ? 'active' : 'inactive'}`}
                          onClick={() => handleUserUpdate(user._id, { isActive: !user.isActive })}
                        >
                          {user.isActive ? (
                            <>
                              <UserCheck size={16} />
                              Active
                            </>
                          ) : (
                            <>
                              <UserX size={16} />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td>
                        <div className="date-cell">
                          <Calendar size={16} />
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </div>
                      </td>
                      <td>
                        <div className="date-cell">
                          <Calendar size={16} />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn edit"
                            onClick={() => handleEditUser(user)}
                            title="Edit User"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="action-btn delete disabled"
                            disabled
                            title="Delete function is disabled"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <div className="pagination-info">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalUsers)} of {totalUsers} users
              </div>
              <div className="pagination-controls">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Edit User Modal */}
            {showEditModal && (
              <div className="modal-overlay" onClick={handleCancelEdit}>
                <motion.div 
                  className="edit-modal"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h3>Edit User</h3>
                    <button className="close-btn" onClick={handleCancelEdit}>
                      ×
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label>First Name <span className="required">*</span></label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => handleEditFormChange('firstName', e.target.value)}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name <span className="required">*</span></label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => handleEditFormChange('lastName', e.target.value)}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email <span className="required">*</span></label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => handleEditFormChange('email', e.target.value)}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <select
                        value={editForm.role}
                        onChange={(e) => handleEditFormChange('role', e.target.value)}
                        className={`role-select ${editForm.role}`}
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editForm.isActive}
                          onChange={(e) => handleEditFormChange('isActive', e.target.checked)}
                        />
                        <span>Active User</span>
                      </label>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button 
                      className="btn-cancel" 
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn-save" 
                      onClick={handleSaveEdit}
                      disabled={editSaving}
                    >
                      {editSaving ? (
                        <>
                          <RefreshCw size={16} className="spinning" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Edit size={16} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* System Health Tab */}
        {activeTab === 'system' && <SystemHealth />}

        {/* Recent Activity Tab */}
        {activeTab === 'activity' && <ActivityLogs />}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && <Analytics />}
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <motion.div 
            className="logout-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Confirm Logout</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to logout from the admin dashboard?</p>
              <p className="modal-warning">You'll need to login again to access admin features.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm" 
                onClick={confirmLogout}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
