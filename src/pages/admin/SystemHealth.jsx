import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Download,
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import adminService from '../../services/adminService'
import './SystemHealth.css'

const SystemHealth = () => {
  const [systemHealth, setSystemHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30) // seconds

  useEffect(() => {
    loadSystemHealth()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadSystemHealth()
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const loadSystemHealth = async () => {
    try {
      if (!systemHealth) setLoading(true)
      else setRefreshing(true)
      const health = await adminService.getSystemHealth()
      setSystemHealth(health)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading system health:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
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

  const getMemoryUsagePercentage = () => {
    if (!systemHealth?.server?.memory) return 0
    const { heapUsed, heapTotal } = systemHealth.server.memory
    return Math.round((heapUsed / heapTotal) * 100)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
      case 'connected':
        return 'success'
      case 'degraded':
      case 'warning':
        return 'warning'
      case 'offline':
      case 'disconnected':
        return 'error'
      default:
        return 'neutral'
    }
  }

  const serviceStatusLabel = (status) => {
    if (status === 'online') return 'ONLINE'
    if (status === 'degraded') return 'DEGRADED'
    if (status === 'offline') return 'OFFLINE'
    return (status || 'unknown').toString().toUpperCase()
  }

  if (loading && !systemHealth) {
    return (
      <div className="system-health">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading system health...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="system-health">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <Server size={28} />
              System Health
            </h1>
            <p>Monitor server performance and service status</p>
            {lastUpdated && (
              <div className="last-updated">
                <Clock size={16} />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
          <div className="header-actions">
            <div className="auto-refresh">
              <label>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                Auto-refresh every
              </label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                disabled={!autoRefresh}
              >
                <option value={15}>15s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
            </div>
            <button
              className="btn-secondary"
              onClick={loadSystemHealth}
              disabled={loading || refreshing}
            >
              <RefreshCw size={20} className={loading || refreshing ? 'spinning' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="overview-grid">
        <div className="metric-card server-status">
          <div className="metric-header">
            <div className="metric-icon">
              <Server size={24} />
            </div>
            <div className="metric-info">
              <h3>Server Status</h3>
              <div className={`status-indicator ${systemHealth ? 'online' : 'offline'}`}>
                {systemHealth ? (
                  <>
                    <CheckCircle size={16} />
                    Online
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} />
                    Offline
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="metric-details">
            <div className="detail-item">
              <span>Uptime</span>
              <span>{systemHealth ? formatUptime(systemHealth.server.uptime) : 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span>Node Version</span>
              <span>{systemHealth?.server?.version || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="metric-card database-status">
          <div className="metric-header">
            <div className="metric-icon">
              <Database size={24} />
            </div>
            <div className="metric-info">
              <h3>Database</h3>
              <div className={`status-indicator ${getStatusColor(systemHealth?.database?.status)}`}>
                {systemHealth?.database?.status === 'connected' ? (
                  <>
                    <CheckCircle size={16} />
                    Connected
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} />
                    Disconnected
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="metric-details">
            <div className="detail-item">
              <span>Database</span>
              <span>{systemHealth?.database?.name || 'pathwise'}</span>
            </div>
            <div className="detail-item">
              <span>Connection</span>
              <span>{systemHealth?.database?.type || 'MongoDB'}</span>
            </div>
          </div>
        </div>

        <div className="metric-card memory-usage">
          <div className="metric-header">
            <div className="metric-icon">
              <HardDrive size={24} />
            </div>
            <div className="metric-info">
              <h3>Memory Usage</h3>
              <div className="usage-percentage">
                {getMemoryUsagePercentage()}%
              </div>
            </div>
          </div>
          <div className="metric-details">
            <div className="detail-item">
              <span>Used</span>
              <span>{systemHealth ? formatBytes(systemHealth.server.memory.heapUsed) : 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span>Total</span>
              <span>{systemHealth ? formatBytes(systemHealth.server.memory.heapTotal) : 'N/A'}</span>
            </div>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${getMemoryUsagePercentage()}%` }}
            ></div>
          </div>
        </div>

        <div className="metric-card cpu-usage">
          <div className="metric-header">
            <div className="metric-icon">
              <Cpu size={24} />
            </div>
            <div className="metric-info">
              <h3>CPU Usage</h3>
              <div className="usage-percentage">
                Normal
              </div>
            </div>
          </div>
          <div className="metric-details">
            <div className="detail-item">
              <span>Load</span>
              <span>Stable</span>
            </div>
            <div className="detail-item">
              <span>Processes</span>
              <span>Running</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="services-section">
        <div className="section-header">
          <h2>Services Status</h2>
          <div className="services-summary">
            {systemHealth?.services && (
              <>
                <span className="summary-item success">
                  {systemHealth.services.filter(s => s.status === 'online').length} Online
                </span>
                <span className="summary-item warning">
                  {systemHealth.services.filter(s => s.status === 'degraded').length} Degraded
                </span>
                <span className="summary-item error">
                  {systemHealth.services.filter(s => s.status === 'offline').length} Offline
                </span>
              </>
            )}
          </div>
        </div>

        <div className="services-grid">
          {systemHealth?.services?.map((service, index) => (
            <motion.div
              key={`${service.name}-${index}`}
              className="service-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="service-header">
                <div className="service-info">
                  <h4>{service.name}</h4>
                  <div className={`status-badge ${getStatusColor(service.status)}`}>
                    {service.status === 'online' ? (
                      <CheckCircle size={16} />
                    ) : (
                      <AlertTriangle size={16} />
                    )}
                    {serviceStatusLabel(service.status)}
                  </div>
                </div>
                <div className="service-actions">
                  {service.healthUrl && (
                    <a
                      href={service.healthUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn action-btn-link"
                      title="Open health JSON (same machine / dev)"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
              {service.detail && (
                <p className="service-detail-text">{service.detail}</p>
              )}
              <div className="service-details">
                <div className="detail-row">
                  <span>Latency</span>
                  <span>{typeof service.responseMs === 'number' ? `${service.responseMs} ms` : '—'}</span>
                </div>
                <div className="detail-row">
                  <span>Last check</span>
                  <span>{service.lastCheck ? new Date(service.lastCheck).toLocaleTimeString() : 'N/A'}</span>
                </div>
              </div>
              <div className="service-metrics">
                <div className="metric">
                  <Activity size={16} />
                  <span>
                    {service.status === 'online'
                      ? 'Reachable'
                      : service.status === 'degraded'
                        ? 'Partial'
                        : 'Unreachable'}
                  </span>
                </div>
                <div className="metric">
                  <Zap size={16} />
                  <span>
                    {typeof service.responseMs === 'number' && service.responseMs < 800
                      ? 'Low latency'
                      : typeof service.responseMs === 'number'
                        ? 'Slower'
                        : '—'}
                  </span>
                </div>
              </div>
            </motion.div>
          )) || (
            <div className="no-services">
              <Server size={48} />
              <p>No services data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="metrics-section">
        <div className="section-header">
          <h2>Performance Metrics</h2>
          <button className="btn-secondary">
            <Download size={16} />
            Export Report
          </button>
        </div>

        <div className="metrics-grid">
          <div className="metric-chart">
            <div className="chart-header">
              <h4>Response Time</h4>
              <div className="chart-value">
                <TrendingDown size={20} className="trend-down" />
                <span>125ms</span>
              </div>
            </div>
            <div className="chart-placeholder">
              <BarChart3 size={48} />
              <p>Response time chart will be displayed here</p>
            </div>
          </div>

          <div className="metric-chart">
            <div className="chart-header">
              <h4>Request Rate</h4>
              <div className="chart-value">
                <TrendingUp size={20} className="trend-up" />
                <span>1.2k/min</span>
              </div>
            </div>
            <div className="chart-placeholder">
              <Activity size={48} />
              <p>Request rate chart will be displayed here</p>
            </div>
          </div>

          <div className="metric-chart">
            <div className="chart-header">
              <h4>Error Rate</h4>
              <div className="chart-value">
                <TrendingDown size={20} className="trend-down" />
                <span>0.1%</span>
              </div>
            </div>
            <div className="chart-placeholder">
              <AlertTriangle size={48} />
              <p>Error rate chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemHealth
