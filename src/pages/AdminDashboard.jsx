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
  LogOut
} from 'lucide-react'
import './AdminDashboard.css'
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
    totalUsers: 0,
    totalDiscussions: 0,
    resources: 0,
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
    }
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
        setStats(prevStats => ({
          ...prevStats,
          ...statsData.value,
          users: {
            ...prevStats.users,
            ...statsData.value?.users
          },
          discussions: {
            ...prevStats.discussions,
            ...statsData.value?.discussions
          }
        }))
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
      const response = await adminService.getUsers(currentPage, 20, userSearch, userRole, userStatus)
      setUsers(response.users)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleUserUpdate = async (userId, updates) => {
    try {
      await adminService.updateUser(userId, updates)
      loadUsers() // Reload users list
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
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Failed to delete user')
      }
    }
  }

  const handleRefresh = () => {
    loadInitialData()
  }

  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    authService.logout()
    navigate('/login')
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
                  <h3>{loading ? '...' : stats?.users?.total?.toLocaleString() || 0}</h3>
                  <p>Total Users</p>
                  <div className="stat-detail">
                    <span className="active">{stats?.users?.active || 0} Active</span>
                    <span className="new">+{stats?.users?.newThisMonth || 0} This Month</span>
                  </div>
                </div>
                <div className="stat-trend positive">
                  <TrendingUp size={16} />
                  +12%
                </div>
              </div>

              <div className="stat-card discussions-card">
                <div className="stat-icon">
                  <MessageSquare size={24} />
                </div>
                <div className="stat-content">
                  <h3>{loading ? '...' : stats?.discussions?.total?.toLocaleString() || 0}</h3>
                  <p>Total Discussions</p>
                  <div className="stat-detail">
                    <span className="active">{stats?.discussions?.activeThisWeek || 0} This Week</span>
                  </div>
                </div>
                <div className="stat-trend positive">
                  <TrendingUp size={16} />
                  +8%
                </div>
              </div>

              <div className="stat-card resources-card">
                <div className="stat-icon">
                  <FileText size={24} />
                </div>
                <div className="stat-content">
                  <h3>2,847</h3>
                  <p>Resources</p>
                  <div className="stat-detail">
                    <span className="active">1,234 Tutorials</span>
                    <span className="new">+45 This Week</span>
                  </div>
                </div>
                <div className="stat-trend positive">
                  <TrendingUp size={16} />
                  +15%
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
                    <span className="uptime">
                      {systemHealth ? formatUptime(systemHealth.server?.uptime || 0) : '...'}
                    </span>
                  </div>
                </div>
                <div className="stat-trend positive">
                  <CheckCircle size={16} />
                  Online
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
                        <span className="cluster-meta">{stats?.totalUsers || 0} total users</span>
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
                        <span className="cluster-meta">{stats?.totalDiscussions || 0} discussions tracked</span>
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
                        <span className="cluster-meta">{stats?.resources || 0} resources available</span>
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
                  {recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">
                        {activity.type === 'user_registration' && <Users size={16} />}
                        {activity.type === 'discussion_created' && <MessageSquare size={16} />}
                        {activity.type === 'system_event' && <Settings size={16} />}
                      </div>
                      <div className="activity-content">
                        <p>{activity.message}</p>
                        <span className="activity-time">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <div className="no-activity">
                      <Activity size={32} />
                      <p>No recent activity</p>
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
                    <span className="breakdown-count">{stats?.users?.byRole?.user || 0}</span>
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
        {activeTab === 'users' && <UserManagement />}

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
