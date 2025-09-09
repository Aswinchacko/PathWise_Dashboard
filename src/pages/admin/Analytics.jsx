import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  FileText,
  Activity,
  Calendar,
  Download,
  Filter,
  Eye,
  Target,
  Zap,
  Clock,
  Globe
} from 'lucide-react'
import adminService from '../../services/adminService'
import './Analytics.css'

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(30) // days
  const [selectedMetric, setSelectedMetric] = useState('users')

  const timeRanges = [
    { value: 7, label: '7 Days' },
    { value: 30, label: '30 Days' },
    { value: 90, label: '90 Days' },
    { value: 365, label: '1 Year' }
  ]

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAnalytics(timeRange)
      setAnalytics(data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    // Generate CSV report
    const reportData = {
      timeRange: `${timeRange} days`,
      generatedAt: new Date().toISOString(),
      userGrowth: analytics?.userGrowth || [],
      discussionGrowth: analytics?.discussionGrowth || []
    }

    const csvContent = [
      'Analytics Report',
      `Generated: ${new Date().toLocaleString()}`,
      `Time Range: ${timeRange} days`,
      '',
      'User Growth:',
      'Date,New Users',
      ...analytics?.userGrowth?.map(item => 
        `${new Date(item.date).toLocaleDateString()},${item.count}`
      ) || [],
      '',
      'Discussion Growth:',
      'Date,New Discussions',
      ...analytics?.discussionGrowth?.map(item => 
        `${new Date(item.date).toLocaleDateString()},${item.count}`
      ) || []
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-report-${timeRange}d.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const calculateGrowthRate = (data) => {
    if (!data || data.length < 2) return 0
    const recent = data.slice(-7).reduce((sum, item) => sum + item.count, 0)
    const previous = data.slice(-14, -7).reduce((sum, item) => sum + item.count, 0)
    if (previous === 0) return recent > 0 ? 100 : 0
    return Math.round(((recent - previous) / previous) * 100)
  }

  const getTotalCount = (data) => {
    return data?.reduce((sum, item) => sum + item.count, 0) || 0
  }

  const mockMetrics = {
    pageViews: 125430,
    sessionDuration: '4m 32s',
    bounceRate: 34.2,
    conversionRate: 2.8,
    topPages: [
      { path: '/dashboard', views: 45230, percentage: 36 },
      { path: '/roadmap', views: 32140, percentage: 26 },
      { path: '/projects', views: 18950, percentage: 15 },
      { path: '/community', views: 15670, percentage: 12 },
      { path: '/resources', views: 13440, percentage: 11 }
    ],
    userLocations: [
      { country: 'United States', users: 2340, percentage: 42 },
      { country: 'India', users: 1890, percentage: 34 },
      { country: 'United Kingdom', users: 567, percentage: 10 },
      { country: 'Canada', users: 432, percentage: 8 },
      { country: 'Australia', users: 321, percentage: 6 }
    ]
  }

  return (
    <div className="analytics">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <BarChart3 size={28} />
              Analytics
            </h1>
            <p>Track platform performance and user engagement</p>
          </div>
          <div className="header-actions">
            <div className="time-range-selector">
              <Calendar size={16} />
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(Number(e.target.value))}
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn-secondary" onClick={exportReport}>
              <Download size={20} />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-overview">
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon users">
              <Users size={24} />
            </div>
            <div className="metric-trend positive">
              <TrendingUp size={16} />
              +{calculateGrowthRate(analytics?.userGrowth)}%
            </div>
          </div>
          <div className="metric-content">
            <h3>{getTotalCount(analytics?.userGrowth)}</h3>
            <p>New Users</p>
            <span className="metric-period">Last {timeRange} days</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon discussions">
              <MessageSquare size={24} />
            </div>
            <div className="metric-trend positive">
              <TrendingUp size={16} />
              +{calculateGrowthRate(analytics?.discussionGrowth)}%
            </div>
          </div>
          <div className="metric-content">
            <h3>{getTotalCount(analytics?.discussionGrowth)}</h3>
            <p>Discussions</p>
            <span className="metric-period">Last {timeRange} days</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon engagement">
              <Activity size={24} />
            </div>
            <div className="metric-trend positive">
              <TrendingUp size={16} />
              +12%
            </div>
          </div>
          <div className="metric-content">
            <h3>{mockMetrics.pageViews.toLocaleString()}</h3>
            <p>Page Views</p>
            <span className="metric-period">Last {timeRange} days</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon conversion">
              <Target size={24} />
            </div>
            <div className="metric-trend negative">
              <TrendingDown size={16} />
              -2%
            </div>
          </div>
          <div className="metric-content">
            <h3>{mockMetrics.conversionRate}%</h3>
            <p>Conversion Rate</p>
            <span className="metric-period">Last {timeRange} days</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container main-chart">
          <div className="chart-header">
            <h3>Growth Trends</h3>
            <div className="chart-controls">
              <div className="metric-selector">
                <button 
                  className={selectedMetric === 'users' ? 'active' : ''}
                  onClick={() => setSelectedMetric('users')}
                >
                  Users
                </button>
                <button 
                  className={selectedMetric === 'discussions' ? 'active' : ''}
                  onClick={() => setSelectedMetric('discussions')}
                >
                  Discussions
                </button>
              </div>
            </div>
          </div>
          <div className="chart-placeholder">
            <BarChart3 size={64} />
            <h4>
              {selectedMetric === 'users' ? 'User' : 'Discussion'} Growth Chart
            </h4>
            <p>Interactive chart showing growth trends over time</p>
            <div className="chart-data-preview">
              {selectedMetric === 'users' ? (
                <div className="data-points">
                  {analytics?.userGrowth?.slice(-7).map((item, index) => (
                    <div key={index} className="data-point">
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      <span>{item.count} users</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="data-points">
                  {analytics?.discussionGrowth?.slice(-7).map((item, index) => (
                    <div key={index} className="data-point">
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      <span>{item.count} discussions</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="chart-container secondary-chart">
          <div className="chart-header">
            <h3>User Engagement</h3>
          </div>
          <div className="engagement-metrics">
            <div className="engagement-item">
              <div className="engagement-icon">
                <Clock size={20} />
              </div>
              <div className="engagement-data">
                <span className="value">{mockMetrics.sessionDuration}</span>
                <span className="label">Avg. Session</span>
              </div>
            </div>
            <div className="engagement-item">
              <div className="engagement-icon">
                <Eye size={20} />
              </div>
              <div className="engagement-data">
                <span className="value">{mockMetrics.bounceRate}%</span>
                <span className="label">Bounce Rate</span>
              </div>
            </div>
            <div className="engagement-item">
              <div className="engagement-icon">
                <Zap size={20} />
              </div>
              <div className="engagement-data">
                <span className="value">4.2</span>
                <span className="label">Pages/Session</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="detailed-analytics">
        <div className="analytics-card">
          <div className="card-header">
            <h3>Top Pages</h3>
            <span className="card-subtitle">Most visited pages</span>
          </div>
          <div className="top-pages">
            {mockMetrics.topPages.map((page, index) => (
              <div key={index} className="page-item">
                <div className="page-info">
                  <span className="page-path">{page.path}</span>
                  <span className="page-views">{page.views.toLocaleString()} views</span>
                </div>
                <div className="page-bar">
                  <div 
                    className="page-fill" 
                    style={{ width: `${page.percentage}%` }}
                  ></div>
                </div>
                <span className="page-percentage">{page.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>User Locations</h3>
            <span className="card-subtitle">Geographic distribution</span>
          </div>
          <div className="user-locations">
            {mockMetrics.userLocations.map((location, index) => (
              <div key={index} className="location-item">
                <div className="location-info">
                  <Globe size={16} />
                  <span className="country">{location.country}</span>
                </div>
                <div className="location-stats">
                  <span className="users">{location.users.toLocaleString()}</span>
                  <span className="percentage">{location.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Activity */}
      <div className="realtime-section">
        <div className="section-header">
          <h3>Real-time Activity</h3>
          <div className="realtime-indicator">
            <div className="pulse"></div>
            <span>Live</span>
          </div>
        </div>
        <div className="activity-feed">
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
            Real-time activity feed will be implemented with WebSocket connections for live updates.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Analytics
