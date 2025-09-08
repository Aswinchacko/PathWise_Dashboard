import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Users,
  MessageSquare,
  FileText,
  Target,
  Settings,
  Shield,
  Search,
  Filter,
  Calendar,
  Clock,
  Eye,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle
} from 'lucide-react'
import adminService from '../../services/adminService'
import './ActivityLogs.css'

const ActivityLogs = () => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('today')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const activityTypes = [
    { value: '', label: 'All Activities' },
    { value: 'user_registration', label: 'User Registrations' },
    { value: 'user_login', label: 'User Logins' },
    { value: 'discussion_created', label: 'Discussions' },
    { value: 'roadmap_generated', label: 'Roadmaps' },
    { value: 'resume_uploaded', label: 'Resume Uploads' },
    { value: 'admin_action', label: 'Admin Actions' },
    { value: 'system_event', label: 'System Events' }
  ]

  const dateFilters = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' }
  ]

  useEffect(() => {
    loadActivities()
  }, [typeFilter, dateFilter])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadActivities()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, typeFilter, dateFilter])

  const loadActivities = async () => {
    try {
      setLoading(true)
      const response = await adminService.getRecentActivity(100)
      
      // Mock additional activities for demonstration
      const mockActivities = [
        {
          id: 1,
          type: 'user_registration',
          message: 'New user registered: John Smith',
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          data: { userId: '507f1f77bcf86cd799439011', email: 'john@example.com' },
          severity: 'info'
        },
        {
          id: 2,
          type: 'discussion_created',
          message: 'New discussion created: "Best practices for React hooks"',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          data: { discussionId: '507f1f77bcf86cd799439012', author: 'Jane Doe' },
          severity: 'info'
        },
        {
          id: 3,
          type: 'user_login',
          message: 'User login: admin@pathwise.com',
          timestamp: new Date(Date.now() - 8 * 60 * 1000),
          data: { userId: '507f1f77bcf86cd799439013', ip: '192.168.1.1' },
          severity: 'success'
        },
        {
          id: 4,
          type: 'roadmap_generated',
          message: 'Roadmap generated for Full Stack Development',
          timestamp: new Date(Date.now() - 12 * 60 * 1000),
          data: { userId: '507f1f77bcf86cd799439014', roadmapType: 'fullstack' },
          severity: 'info'
        },
        {
          id: 5,
          type: 'system_event',
          message: 'Database connection restored',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          data: { component: 'database', status: 'connected' },
          severity: 'success'
        },
        {
          id: 6,
          type: 'admin_action',
          message: 'User role updated: moderator → admin',
          timestamp: new Date(Date.now() - 20 * 60 * 1000),
          data: { targetUser: 'jane@example.com', admin: 'admin@pathwise.com' },
          severity: 'warning'
        },
        {
          id: 7,
          type: 'resume_uploaded',
          message: 'Resume uploaded and processed successfully',
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          data: { userId: '507f1f77bcf86cd799439015', fileName: 'resume.pdf' },
          severity: 'info'
        },
        {
          id: 8,
          type: 'system_event',
          message: 'Failed login attempt detected',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          data: { ip: '192.168.1.100', attempts: 3 },
          severity: 'error'
        }
      ]

      // Combine real and mock data
      const allActivities = [...response, ...mockActivities].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      )

      setActivities(allActivities)
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !searchQuery || 
      activity.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !typeFilter || activity.type === typeFilter
    
    let matchesDate = true
    if (dateFilter !== 'all') {
      const activityDate = new Date(activity.timestamp)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      switch (dateFilter) {
        case 'today':
          matchesDate = activityDate >= today
          break
        case 'yesterday':
          matchesDate = activityDate >= yesterday && activityDate < today
          break
        case 'week':
          matchesDate = activityDate >= weekStart
          break
        case 'month':
          matchesDate = activityDate >= monthStart
          break
        default:
          matchesDate = true
      }
    }

    return matchesSearch && matchesType && matchesDate
  })

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registration':
      case 'user_login':
        return Users
      case 'discussion_created':
        return MessageSquare
      case 'roadmap_generated':
        return Target
      case 'resume_uploaded':
        return FileText
      case 'admin_action':
        return Shield
      case 'system_event':
        return Settings
      default:
        return Activity
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'success':
        return 'success'
      case 'warning':
        return 'warning'
      case 'error':
        return 'error'
      default:
        return 'info'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'success':
        return CheckCircle
      case 'warning':
        return AlertTriangle
      case 'error':
        return XCircle
      default:
        return Info
    }
  }

  const formatTimeAgo = (timestamp) => {
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

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Message', 'Severity'],
      ...filteredActivities.map(activity => [
        new Date(activity.timestamp).toISOString(),
        activity.type,
        activity.message,
        activity.severity || 'info'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="activity-logs">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <Activity size={28} />
              Activity Logs
            </h1>
            <p>Monitor system activities and user actions in real-time</p>
          </div>
          <div className="header-actions">
            <div className="auto-refresh-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                Auto-refresh
              </label>
            </div>
            <button className="btn-secondary" onClick={exportLogs}>
              <Download size={20} />
              Export
            </button>
            <button 
              className={`btn-secondary ${loading ? 'loading' : ''}`}
              onClick={loadActivities}
              disabled={loading}
            >
              <RefreshCw size={20} className={loading ? 'spinning' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={16} />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            {activityTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <Calendar size={16} />
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            {dateFilters.map(filter => (
              <option key={filter.value} value={filter.value}>{filter.label}</option>
            ))}
          </select>
        </div>

        <div className="results-count">
          {filteredActivities.length} activities
        </div>
      </div>

      {/* Activity Feed */}
      <div className="activity-feed">
        {loading && activities.length === 0 ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading activities...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="empty-state">
            <Activity size={64} />
            <h3>No activities found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="activities-list">
            {filteredActivities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type)
              const SeverityIcon = getSeverityIcon(activity.severity)
              
              return (
                <motion.div
                  key={activity.id || index}
                  className="activity-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="activity-icon">
                    <Icon size={20} />
                  </div>
                  
                  <div className="activity-content">
                    <div className="activity-header">
                      <p className="activity-message">{activity.message}</p>
                      <div className="activity-meta">
                        <div className={`severity-badge ${getSeverityColor(activity.severity)}`}>
                          <SeverityIcon size={14} />
                          {activity.severity || 'info'}
                        </div>
                        <div className="activity-time">
                          <Clock size={14} />
                          {formatTimeAgo(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    {activity.data && (
                      <div className="activity-details">
                        {Object.entries(activity.data).map(([key, value]) => (
                          <span key={key} className="detail-item">
                            <strong>{key}:</strong> {value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="activity-actions">
                    <button className="action-btn" title="View Details">
                      <Eye size={16} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Live Status */}
      {autoRefresh && (
        <div className="live-status">
          <div className="pulse-dot"></div>
          <span>Live monitoring active</span>
        </div>
      )}
    </div>
  )
}

export default ActivityLogs
