import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  MessageCircle, 
  Map, 
  FileText, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  ArrowRight,
  BarChart3,
  Settings,
  Search,
  Target,
  Bot,
  Upload,
  RefreshCw
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const quickActions = [
    { icon: Target, label: 'Generate Roadmap', description: 'Create personalized career paths', color: '#10b981', href: '/roadmap' },
    { icon: Bot, label: 'AI Chatbot', description: 'Get career guidance and advice', color: '#3b82f6', href: '/chatbot' },
    { icon: Upload, label: 'Parse Resume', description: 'Extract skills and experience', color: '#f59e0b', href: '/resume-parser' },
    { icon: BarChart3, label: 'Analytics', description: 'View detailed insights', color: '#8b5cf6', href: '/analytics' }
  ]

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch basic data
      const [statsData, activityData] = await Promise.allSettled([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivity()
      ])

      // Update stats
      if (statsData.status === 'fulfilled') {
        setStats(statsData.value)
      }

      // Update recent activity
      if (activityData.status === 'fulfilled') {
        setRecentActivity(activityData.value)
      }

      // Check for any errors
      const errors = [statsData, activityData]
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

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">PathWise Dashboard</h1>
            <p className="dashboard-subtitle">
              Career guidance and roadmap generation platform
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
              <Link to="/settings" className="btn-icon" title="Settings">
                <Settings size={20} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Platform Steps */}
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3 className="step-title">Upload Your Resume</h3>
              <p className="step-description">Parse your resume to extract skills, experience, and career background for personalized recommendations</p>
              <a href="/resume-parser" className="step-action">
                <Upload size={16} />
                Start Parsing
              </a>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3 className="step-title">Generate Career Roadmap</h3>
              <p className="step-description">Create a personalized career path based on your skills, interests, and goals</p>
              <a href="/roadmap" className="step-action">
                <Target size={16} />
                Create Roadmap
              </a>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3 className="step-title">Get AI Career Guidance</h3>
              <p className="step-description">Chat with our AI mentor for personalized advice, skill recommendations, and career insights</p>
              <a href="/chatbot" className="step-action">
                <Bot size={16} />
                Start Chatting
              </a>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3 className="step-title">Find Real Jobs</h3>
              <p className="step-description">Discover job opportunities that match your roadmap aim and career progression goals</p>
              <a href="/jobs" className="step-action">
                <Search size={16} />
                Browse Jobs
              </a>
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
        </div>
      </div>
    </div>
  )
}

export default Dashboard 