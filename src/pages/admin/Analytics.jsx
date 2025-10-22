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

  const calculateGrowthPercentage = (data) => {
    if (!data || data.length < 2) return 0
    const recent = data[data.length - 1]?.count || 0
    const previous = data[data.length - 2]?.count || 0
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

  if (loading) {
    return (
      <div className="analytics">
        <div className="loading-state">
          <BarChart3 size={48} className="spinning" />
          <h3>Loading Analytics...</h3>
          <p>Fetching your analytics data</p>
        </div>
      </div>
    )
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

      {/* Growth Trends Section */}
      <div className="growth-trends-section">
        <div className="trends-header">
            <h3>Growth Trends</h3>
          <div className="trends-controls">
              <div className="metric-selector">
                <button 
                  className={selectedMetric === 'users' ? 'active' : ''}
                  onClick={() => setSelectedMetric('users')}
                >
                <Users size={16} />
                  Users
                </button>
                <button 
                  className={selectedMetric === 'discussions' ? 'active' : ''}
                  onClick={() => setSelectedMetric('discussions')}
                >
                <MessageSquare size={16} />
                  Discussions
                </button>
            </div>
          </div>
        </div>
        
        <div className="trends-content">
          <div className="chart-grid">
            <div className="trend-chart">
              <div className="chart-container">
                <div className="chart-title">
                  {selectedMetric === 'users' ? 'User' : 'Discussion'} Growth
                </div>
                <div className="bar-chart">
                  {selectedMetric === 'users' ? (
                    analytics?.userGrowth?.slice(-7).map((item, index) => {
                      const maxValue = Math.max(...analytics.userGrowth.slice(-7).map(d => d.count))
                      const height = (item.count / maxValue) * 100
                      return (
                        <div key={index} className="bar-group">
                          <div className="bar" style={{ height: `${height}%` }}>
                            <span className="bar-value">{item.count}</span>
                          </div>
                          <div className="bar-label">
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    analytics?.discussionGrowth?.slice(-7).map((item, index) => {
                      const maxValue = Math.max(...analytics.discussionGrowth.slice(-7).map(d => d.count))
                      const height = (item.count / maxValue) * 100
                      return (
                        <div key={index} className="bar-group">
                          <div className="bar" style={{ height: `${height}%` }}>
                            <span className="bar-value">{item.count}</span>
                          </div>
                          <div className="bar-label">
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                <div className="chart-subtitle">
                  Daily Growth Visualization
                </div>
              </div>
            </div>

            <div className="line-chart">
              <div className="chart-container">
                <div className="chart-title">
                  {selectedMetric === 'users' ? 'User' : 'Discussion'} Trend
                </div>
                <div className="line-chart-container">
                  <svg className="line-svg" viewBox="0 0 300 150">
                    {selectedMetric === 'users' ? (
                      <>
                        {/* Grid lines */}
                        <defs>
                          <pattern id="grid" width="50" height="30" patternUnits="userSpaceOnUse">
                            <path d="M 50 0 L 0 0 0 30" fill="none" stroke="var(--border-color)" strokeWidth="0.5" opacity="0.3"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        
                        {/* Line path */}
                        <path
                          d={(() => {
                            const data = analytics?.userGrowth?.slice(-7) || []
                            const maxValue = Math.max(...data.map(d => d.count))
                            const points = data.map((item, index) => {
                              const x = (index / (data.length - 1)) * 280 + 10
                              const y = 140 - ((item.count / maxValue) * 120)
                              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
                            }).join(' ')
                            return points
                          })()}
                          fill="none"
                          stroke="var(--primary-500)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        
                        {/* Data points */}
                        {analytics?.userGrowth?.slice(-7).map((item, index) => {
                          const maxValue = Math.max(...analytics.userGrowth.slice(-7).map(d => d.count))
                          const x = (index / (analytics.userGrowth.slice(-7).length - 1)) * 280 + 10
                          const y = 140 - ((item.count / maxValue) * 120)
                          return (
                            <g key={index}>
                              <circle
                                cx={x}
                                cy={y}
                                r="4"
                                fill="var(--primary-500)"
                                stroke="white"
                                strokeWidth="2"
                              />
                              <text
                                x={x}
                                y={y - 10}
                                textAnchor="middle"
                                fontSize="10"
                                fill="var(--text-primary)"
                                fontWeight="600"
                              >
                                {item.count}
                              </text>
                            </g>
                          )
                        })}
                      </>
                    ) : (
                      <>
                        {/* Grid lines */}
                        <defs>
                          <pattern id="grid2" width="50" height="30" patternUnits="userSpaceOnUse">
                            <path d="M 50 0 L 0 0 0 30" fill="none" stroke="var(--border-color)" strokeWidth="0.5" opacity="0.3"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid2)" />
                        
                        {/* Line path */}
                        <path
                          d={(() => {
                            const data = analytics?.discussionGrowth?.slice(-7) || []
                            const maxValue = Math.max(...data.map(d => d.count))
                            const points = data.map((item, index) => {
                              const x = (index / (data.length - 1)) * 280 + 10
                              const y = 140 - ((item.count / maxValue) * 120)
                              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
                            }).join(' ')
                            return points
                          })()}
                          fill="none"
                          stroke="var(--success-500)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        
                        {/* Data points */}
                        {analytics?.discussionGrowth?.slice(-7).map((item, index) => {
                          const maxValue = Math.max(...analytics.discussionGrowth.slice(-7).map(d => d.count))
                          const x = (index / (analytics.discussionGrowth.slice(-7).length - 1)) * 280 + 10
                          const y = 140 - ((item.count / maxValue) * 120)
                          return (
                            <g key={index}>
                              <circle
                                cx={x}
                                cy={y}
                                r="4"
                                fill="var(--success-500)"
                                stroke="white"
                                strokeWidth="2"
                              />
                              <text
                                x={x}
                                y={y - 10}
                                textAnchor="middle"
                                fontSize="10"
                                fill="var(--text-primary)"
                                fontWeight="600"
                              >
                                {item.count}
                              </text>
                            </g>
                          )
                        })}
                      </>
                    )}
                  </svg>
                </div>
                <div className="chart-subtitle">
                  Trend Analysis Over Time
                </div>
              </div>
            </div>
          </div>
          
          <div className="trend-data">
              {selectedMetric === 'users' ? (
                <div className="data-points">
                <div className="data-header">
                  <h4>Recent User Growth</h4>
                  <span className="total-count">
                    Total: {analytics?.userGrowth?.slice(-7).reduce((sum, item) => sum + item.count, 0) || 0}
                  </span>
                </div>
                  {analytics?.userGrowth?.slice(-7).map((item, index) => (
                    <div key={index} className="data-point">
                    <div className="point-date">{new Date(item.date).toLocaleDateString()}</div>
                    <div className="point-value">{item.count} users</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="data-points">
                <div className="data-header">
                  <h4>Recent Discussion Growth</h4>
                  <span className="total-count">
                    Total: {analytics?.discussionGrowth?.slice(-7).reduce((sum, item) => sum + item.count, 0) || 0}
                  </span>
                </div>
                  {analytics?.discussionGrowth?.slice(-7).map((item, index) => (
                    <div key={index} className="data-point">
                    <div className="point-date">{new Date(item.date).toLocaleDateString()}</div>
                    <div className="point-value">{item.count} discussions</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      {/* User Growth Line Graph Section */}
      <div className="user-growth-section">
        <div className="growth-header">
          <h3>User Growth Trends</h3>
          <span className="growth-subtitle">Visualization of user growth over time</span>
        </div>
        <div className="growth-content">
          <div className="growth-chart">
          <div className="chart-header">
              <h4>User Growth Line Chart</h4>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color user-growth"></div>
                  <span>User Growth</span>
          </div>
              </div>
            </div>
            <div className="line-chart-wrapper">
              <svg className="user-growth-svg" viewBox="0 0 400 200">
                {/* Grid lines */}
                <defs>
                  <pattern id="userGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border-color)" strokeWidth="0.5" opacity="0.2"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#userGrid)" />
                
                {/* Y-axis labels */}
                <g className="y-axis">
                  {[0, 25, 50, 75, 100].map((value, index) => {
                    const y = 180 - (value * 1.6)
                    return (
                      <g key={index}>
                        <line x1="30" y1={y} x2="370" y2={y} stroke="var(--border-color)" strokeWidth="0.5" opacity="0.3"/>
                        <text x="25" y={y + 4} textAnchor="end" fontSize="10" fill="var(--text-secondary)">
                          {value}%
                        </text>
                      </g>
                    )
                  })}
                </g>
                
                {/* X-axis labels */}
                <g className="x-axis">
                  {analytics?.userGrowth?.slice(-7).map((item, index) => {
                    const data = analytics.userGrowth.slice(-7)
                    const x = (index / Math.max(data.length - 1, 1)) * 340 + 30
                    return (
                      <text key={index} x={x} y="195" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </text>
                    )
                  })}
                </g>
                
                {/* User growth line */}
                <path
                  d={(() => {
                    const data = analytics?.userGrowth?.slice(-7) || []
                    if (data.length === 0) return ''
                    const maxValue = Math.max(...data.map(d => d.count))
                    if (maxValue === 0) return ''
                    const points = data.map((item, index) => {
                      const x = (index / Math.max(data.length - 1, 1)) * 340 + 30
                      const y = 180 - ((item.count / maxValue) * 160)
                      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
                    }).join(' ')
                    return points
                  })()}
                  fill="none"
                  stroke="var(--primary-500)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Data points */}
                {analytics?.userGrowth?.slice(-7).map((item, index) => {
                  const data = analytics.userGrowth.slice(-7)
                  if (data.length === 0) return null
                  const maxValue = Math.max(...data.map(d => d.count))
                  if (maxValue === 0) return null
                  const x = (index / Math.max(data.length - 1, 1)) * 340 + 30
                  const y = 180 - ((item.count / maxValue) * 160)
                  return (
                    <g key={index} className="data-point">
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        fill="var(--primary-500)"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        x={x}
                        y={y - 15}
                        textAnchor="middle"
                        fontSize="11"
                        fill="var(--text-primary)"
                        fontWeight="600"
                      >
                        {item.count}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
            <div className="chart-footer">
              <p>Growth percentage based on daily user registrations</p>
            </div>
          </div>
          
          <div className="growth-stats">
            <div className="stat-card">
              <h4>Total Users</h4>
              <span className="stat-value">{analytics?.userGrowth?.reduce((sum, item) => sum + item.count, 0) || 0}</span>
            </div>
            <div className="stat-card">
              <h4>Growth Rate</h4>
              <span className="stat-value positive">+{calculateGrowthPercentage(analytics?.userGrowth)}%</span>
            </div>
            <div className="stat-card">
              <h4>Peak Day</h4>
              <span className="stat-value">
                {(() => {
                  const peak = analytics?.userGrowth?.reduce((max, item) => item.count > max.count ? item : max, analytics?.userGrowth?.[0])
                  return peak ? new Date(peak.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'
                })()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Engagement Section */}
      <div className="user-engagement-section">
        <div className="engagement-header">
          <h3>User Engagement</h3>
          <span className="engagement-subtitle">Platform interaction metrics</span>
        </div>
        
        <div className="engagement-grid">
          <div className="engagement-card session-card">
            <div className="card-icon">
              <Clock size={24} />
            </div>
            <div className="card-content">
              <h4>{mockMetrics.sessionDuration}</h4>
              <p>Average Session Duration</p>
              <div className="card-trend positive">
                <TrendingUp size={14} />
                +8.2%
              </div>
            </div>
          </div>

          <div className="engagement-card bounce-card">
            <div className="card-icon">
              <Eye size={24} />
            </div>
            <div className="card-content">
              <h4>{mockMetrics.bounceRate}%</h4>
              <p>Bounce Rate</p>
              <div className="card-trend negative">
                <TrendingDown size={14} />
                -3.1%
              </div>
            </div>
          </div>

          <div className="engagement-card pages-card">
            <div className="card-icon">
              <Zap size={24} />
            </div>
            <div className="card-content">
              <h4>4.2</h4>
              <p>Pages per Session</p>
              <div className="card-trend positive">
                <TrendingUp size={14} />
                +12.5%
              </div>
            </div>
          </div>

          <div className="engagement-card conversion-card">
            <div className="card-icon">
              <Target size={24} />
              </div>
            <div className="card-content">
              <h4>{mockMetrics.conversionRate}%</h4>
              <p>Conversion Rate</p>
              <div className="card-trend positive">
                <TrendingUp size={14} />
                +5.8%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Pages Analytics */}
      <div className="top-pages-section">
        <div className="pages-header">
            <h3>Top Pages</h3>
          <span className="pages-subtitle">Most visited pages</span>
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

    </div>
  )
}

export default Analytics
