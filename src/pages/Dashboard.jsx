import React, { useState, useEffect } from 'react'
import { 
  MessageCircle, 
  Users, 
  Map, 
  FileText, 
  Activity, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Plus,
  ArrowRight,
  BarChart3,
  PieChart,
  Calendar,
  Settings,
  Search,
  Zap,
  Target,
  BookOpen,
  Bot,
  Upload,
  Star,
  MessageSquare,
  Play,
  Download,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Database
} from 'lucide-react'
import './Dashboard.css'
import dashboardService from '../services/dashboardService'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    roadmapsGenerated: 0,
    chatSessions: 0,
    resumesProcessed: 0
  })

  const [recentActivity, setRecentActivity] = useState([])
  const [systemStatus, setSystemStatus] = useState([])
  const [analyticsData, setAnalyticsData] = useState({
    trends: null,
    domains: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState(30)

  const quickActions = [
    { icon: Target, label: 'Generate Roadmap', description: 'Create personalized career paths', color: '#10b981', href: '/roadmap' },
    { icon: Bot, label: 'AI Chatbot', description: 'Get career guidance and advice', color: '#3b82f6', href: '/chatbot' },
    { icon: Upload, label: 'Parse Resume', description: 'Extract skills and experience', color: '#f59e0b', href: '/resume-parser' },
    { icon: BarChart3, label: 'Analytics', description: 'View detailed insights', color: '#8b5cf6', href: '/analytics' }
  ]

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [statsData, activityData, statusData, trendsData, domainsData] = await Promise.allSettled([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivity(),
        dashboardService.getSystemStatus(),
        dashboardService.getAnalyticsTrends(selectedPeriod),
        dashboardService.getDomainAnalytics()
      ])

      // Update stats
      if (statsData.status === 'fulfilled') {
        setStats(statsData.value)
        setLastUpdated(statsData.value.lastUpdated)
      }

      // Update recent activity
      if (activityData.status === 'fulfilled') {
        setRecentActivity(activityData.value)
      }

      // Update system status
      if (statusData.status === 'fulfilled') {
        setSystemStatus(statusData.value)
      }

      // Update analytics data
      if (trendsData.status === 'fulfilled') {
        setAnalyticsData(prev => ({ ...prev, trends: trendsData.value }))
      }

      if (domainsData.status === 'fulfilled') {
        setAnalyticsData(prev => ({ ...prev, domains: domainsData.value }))
      }

      // Check for any errors
      const errors = [statsData, activityData, statusData, trendsData, domainsData]
        .filter(result => result.status === 'rejected')
        .map(result => result.reason.message)

      if (errors.length > 0) {
        console.warn('Some data failed to load:', errors)
        setError(`Some data may be outdated. ${errors.length} service(s) unavailable.`)
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    dashboardService.clearCache()
    loadDashboardData()
  }

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period)
    dashboardService.clearCache()
    loadDashboardData()
  }

  // Format chart data
  const formatChartData = () => {
    if (!analyticsData.trends) return null

    const { daily_roadmaps, domain_trends, user_activity } = analyticsData.trends

    // Format daily roadmaps data
    const dailyData = daily_roadmaps.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      roadmaps: item.count
    }))

    // Format domain trends data
    const domainData = domain_trends.reduce((acc, item) => {
      const domain = item._id.domain
      if (!acc[domain]) acc[domain] = []
      acc[domain].push({
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        count: item.count
      })
      return acc
    }, {})

    // Format user activity data
    const userData = user_activity.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      users: item.unique_users
    }))

    return { dailyData, domainData, userData }
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">PathWise Dashboard</h1>
            <p className="dashboard-subtitle">
              Career guidance and roadmap generation platform
              {lastUpdated && (
                <span className="last-updated">
                  • Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="header-right">
            <div className="header-actions">
              {error && (
                <div className="error-indicator" title={error}>
                  <AlertCircle size={16} />
                </div>
              )}
              <button 
                className={`btn-icon ${loading ? 'loading' : ''}`} 
                title="Refresh Data"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw size={20} className={loading ? 'spinning' : ''} />
              </button>
              <a href="/settings" className="btn-icon" title="Settings">
                <Settings size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">
                {loading ? (
                  <div className="loading-skeleton" style={{ width: '80px', height: '32px' }}></div>
                ) : (
                  stats.totalUsers.toLocaleString()
                )}
              </h3>
              <p className="stat-label">Total Users</p>
              <div className="stat-change positive">
                <TrendingUp size={16} />
                <span>{stats.activeUsers || 0} Active</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon discussions">
              <MessageSquare size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">
                {loading ? (
                  <div className="loading-skeleton" style={{ width: '80px', height: '32px' }}></div>
                ) : (
                  (stats.totalDiscussions || 0).toLocaleString()
                )}
              </h3>
              <p className="stat-label">Total Discussions</p>
              <div className="stat-change positive">
                <TrendingUp size={16} />
                <span>{stats.activeDiscussionsThisWeek || 0} This Week</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon roadmaps">
              <Map size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">
                {loading ? (
                  <div className="loading-skeleton" style={{ width: '80px', height: '32px' }}></div>
                ) : (
                  stats.roadmapsGenerated.toLocaleString()
                )}
              </h3>
              <p className="stat-label">Roadmaps Generated</p>
              <div className="stat-change positive">
                <TrendingUp size={16} />
                <span>Career paths created</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon chats">
              <MessageCircle size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">
                {loading ? (
                  <div className="loading-skeleton" style={{ width: '80px', height: '32px' }}></div>
                ) : (
                  stats.chatSessions.toLocaleString()
                )}
              </h3>
              <p className="stat-label">Chat Sessions</p>
              <div className="stat-change positive">
                <TrendingUp size={16} />
                <span>AI conversations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="main-grid">
          {/* Quick Actions */}
          <div className="dashboard-card quick-actions-card">
            <div className="card-header">
              <h2 className="card-title">Quick Actions</h2>
              <p className="card-subtitle">Access main features quickly</p>
            </div>
            <div className="quick-actions-grid">
              {quickActions.map((action, index) => (
                <a key={index} href={action.href} className="quick-action-item">
                  <div className="action-icon" style={{ backgroundColor: action.color }}>
                    <action.icon size={24} />
                  </div>
                  <div className="action-content">
                    <h3 className="action-title">{action.label}</h3>
                    <p className="action-description">{action.description}</p>
                  </div>
                  <ArrowRight size={20} className="action-arrow" />
                </a>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card activity-card">
            <div className="card-header">
              <h2 className="card-title">Recent Activity</h2>
              <button className="btn-text">View All</button>
            </div>
            <div className="activity-list">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <div className="loading-skeleton" style={{ width: '16px', height: '16px', borderRadius: '4px' }}></div>
                    </div>
                    <div className="activity-content">
                      <div className="loading-skeleton" style={{ width: '200px', height: '16px', marginBottom: '4px' }}></div>
                      <div className="loading-skeleton" style={{ width: '80px', height: '12px' }}></div>
                    </div>
                    <div className="activity-status">
                      <div className="loading-skeleton" style={{ width: '16px', height: '16px', borderRadius: '50%' }}></div>
                    </div>
                  </div>
                ))
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === 'roadmap' && <Map size={16} />}
                      {activity.type === 'chat' && <MessageCircle size={16} />}
                      {activity.type === 'resume' && <FileText size={16} />}
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">
                        {activity.action}
                      </p>
                      <p className="activity-time">{activity.time}</p>
                    </div>
                    <div className={`activity-status ${activity.status}`}>
                      {activity.status === 'success' && <CheckCircle size={16} />}
                      {activity.status === 'processing' && <Clock size={16} />}
                      {activity.status === 'error' && <XCircle size={16} />}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Activity size={48} />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="dashboard-card status-card">
            <div className="card-header">
              <h2 className="card-title">System Status</h2>
              <div className="status-overview">
                <div className={`status-dot ${systemStatus.every(s => s.status === 'online') ? 'online' : 'offline'}`}></div>
                <span>
                  {loading ? 'Checking...' : 
                   systemStatus.every(s => s.status === 'online') ? 'All Systems Operational' : 
                   'Some Services Offline'}
                </span>
              </div>
            </div>
            <div className="status-list">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="status-item">
                    <div className="service-info">
                      <div className="loading-skeleton" style={{ width: '120px', height: '16px', marginBottom: '4px' }}></div>
                      <div className="loading-skeleton" style={{ width: '80px', height: '12px' }}></div>
                    </div>
                    <div className="status-indicator">
                      <div className="loading-skeleton" style={{ width: '8px', height: '8px', borderRadius: '50%' }}></div>
                      <div className="loading-skeleton" style={{ width: '40px', height: '12px' }}></div>
                    </div>
                  </div>
                ))
              ) : systemStatus.length > 0 ? (
                systemStatus.map((service, index) => (
                  <div key={index} className="status-item">
                    <div className="service-info">
                      <h4 className="service-name">{service.name}</h4>
                      <p className="service-uptime">Uptime: {service.uptime}</p>
                    </div>
                    <div className={`status-indicator ${service.status}`}>
                      <div className="status-dot"></div>
                      <span className="status-text capitalize">{service.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Database size={48} />
                  <p>Unable to check system status</p>
                </div>
              )}
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="dashboard-card chart-card">
            <div className="card-header">
              <h2 className="card-title">Usage Analytics</h2>
              <div className="chart-controls">
                <button 
                  className={`btn-text ${selectedPeriod === 7 ? 'active' : ''}`}
                  onClick={() => handlePeriodChange(7)}
                >
                  7D
                </button>
                <button 
                  className={`btn-text ${selectedPeriod === 30 ? 'active' : ''}`}
                  onClick={() => handlePeriodChange(30)}
                >
                  30D
                </button>
                <button 
                  className={`btn-text ${selectedPeriod === 90 ? 'active' : ''}`}
                  onClick={() => handlePeriodChange(90)}
                >
                  90D
                </button>
              </div>
            </div>
            <div className="analytics-content">
              {loading ? (
                <div className="chart-loading">
                  <div className="loading-skeleton" style={{ width: '100%', height: '200px', borderRadius: '8px' }}></div>
                </div>
              ) : analyticsData.trends ? (
                <div className="charts-grid">
                  {/* Daily Roadmaps Chart */}
                  <div className="chart-section">
                    <h3 className="chart-title">Daily Roadmap Creation</h3>
                    <div className="chart-container">
                      {formatChartData()?.dailyData?.length > 0 ? (
                        <div className="simple-chart">
                          {formatChartData().dailyData.slice(-14).map((item, index) => (
                            <div key={index} className="chart-bar">
                              <div 
                                className="bar-fill"
                                style={{ 
                                  height: `${Math.max((item.roadmaps / Math.max(...formatChartData().dailyData.map(d => d.roadmaps))) * 100, 5)}%`,
                                  backgroundColor: '#667eea'
                                }}
                              ></div>
                              <span className="bar-label">{item.date.split('-')[2]}</span>
                              <span className="bar-value">{item.roadmaps}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-data">
                          <BarChart3 size={32} />
                          <p>No data available for selected period</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Domain Distribution */}
                  <div className="chart-section">
                    <h3 className="chart-title">Top Domains</h3>
                    <div className="chart-container">
                      {analyticsData.domains?.domains?.length > 0 ? (
                        <div className="domain-list">
                          {analyticsData.domains.domains.slice(0, 5).map((domain, index) => (
                            <div key={index} className="domain-item">
                              <div className="domain-info">
                                <span className="domain-name">{domain.domain}</span>
                                <span className="domain-count">{domain.total_roadmaps} roadmaps</span>
                              </div>
                              <div className="domain-bar">
                                <div 
                                  className="domain-bar-fill"
                                  style={{ 
                                    width: `${(domain.total_roadmaps / analyticsData.domains.domains[0].total_roadmaps) * 100}%`,
                                    backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-data">
                          <PieChart size={32} />
                          <p>No domain data available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Activity */}
                  <div className="chart-section">
                    <h3 className="chart-title">User Activity</h3>
                    <div className="chart-container">
                      {formatChartData()?.userData?.length > 0 ? (
                        <div className="activity-stats">
                          <div className="stat-item">
                            <span className="stat-label">Active Users (Last 30 days)</span>
                            <span className="stat-value">{stats.totalUsers}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">User Generated Roadmaps</span>
                            <span className="stat-value">{stats.userGeneratedRoadmaps || 0}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Recent Activity (30d)</span>
                            <span className="stat-value">{stats.recentRoadmaps30d || 0}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="no-data">
                          <Users size={32} />
                          <p>No user activity data</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="chart-placeholder">
                  <BarChart3 size={48} />
                  <p>Analytics data unavailable</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 