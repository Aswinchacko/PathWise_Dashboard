import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Menu, 
  Shield, 
  Users, 
  Activity, 
  BarChart3, 
  Settings,
  Database,
  Server,
  AlertTriangle,
  FileText,
  MessageSquare,
  Target,
  Briefcase,
  Upload,
  Globe,
  Home,
  LogOut
} from 'lucide-react'
import './Sidebar.css'
import './AdminSidebar.css'
import authService from '../../services/authService'

const AdminSidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation()

  const adminNavItems = [
    { path: '/admin', icon: Shield, label: 'Admin Dashboard' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/system', icon: Server, label: 'System Health' },
    { path: '/admin/activity', icon: Activity, label: 'Activity Logs' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/content', icon: FileText, label: 'Content Management' },
    { path: '/admin/discussions', icon: MessageSquare, label: 'Discussions' },
    { path: '/admin/reports', icon: AlertTriangle, label: 'Reports' },
  ]

  const userNavItems = [
    { 
      path: '/dashboard', 
      icon: Home, 
      label: 'User Dashboard',
      description: 'Switch to user view'
    },
    { path: '/roadmap', icon: Target, label: 'Roadmaps' },
    { path: '/projects', icon: Briefcase, label: 'Projects' },
    { path: '/resume-parser', icon: Upload, label: 'Resume Parser' },
    { path: '/community', icon: Globe, label: 'Community' },
  ]

  const handleLogout = () => {
    authService.logout()
    window.location.href = '/login'
  }

  return (
    <motion.aside 
      className={`sidebar admin-sidebar ${collapsed ? 'collapsed' : ''}`}
      initial={{ width: collapsed ? 80 : 280 }}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <div className="sidebar-header">
        <motion.button 
          className="menu-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.08 }}
        >
          <Menu size={20} />
        </motion.button>
        {!collapsed && (
          <motion.div 
            className="admin-logo"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15, delay: 0.02 }}
          >
            <Shield size={24} className="admin-icon" />
            <div>
              <h2 className="logo">PathWise</h2>
              <span className="admin-badge">Admin Panel</span>
            </div>
          </motion.div>
        )}
      </div>

      <nav className="sidebar-nav">
        {/* Admin Section */}
        {!collapsed && (
          <motion.div 
            className="nav-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="nav-section-title">Administration</h3>
          </motion.div>
        )}

        {adminNavItems.map((item, index) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.01, duration: 0.12 }}
            >
              <NavLink
                to={item.path}
                className={`nav-item admin-nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <Icon size={20} />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -3 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.1, delay: 0.02 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </NavLink>
            </motion.div>
          )
        })}

        {/* Divider */}
        {!collapsed && (
          <motion.div 
            className="nav-divider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          />
        )}

        {/* User Features Section */}
        {!collapsed && (
          <motion.div 
            className="nav-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <h3 className="nav-section-title">Platform Features</h3>
          </motion.div>
        )}

        {userNavItems.map((item, index) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (adminNavItems.length + index) * 0.01, duration: 0.12 }}
            >
              <NavLink
                to={item.path}
                className={`nav-item user-nav-item ${isActive ? 'active' : ''} ${item.path === '/dashboard' ? 'switch-view' : ''}`}
                title={collapsed ? item.label : item.description || item.label}
              >
                <Icon size={20} />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -3 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.1, delay: 0.02 }}
                  >
                    {item.label}
                  </motion.span>
                )}
                {!collapsed && item.path === '/dashboard' && (
                  <span className="switch-indicator">👁️</span>
                )}
              </NavLink>
            </motion.div>
          )
        })}

        {/* Settings and Logout */}
        <div className="nav-footer">
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.12 }}
          >
            <NavLink
              to="/settings"
              className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
              title={collapsed ? 'Settings' : ''}
            >
              <Settings size={20} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -3 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1, delay: 0.02 }}
                >
                  Settings
                </motion.span>
              )}
            </NavLink>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.12 }}
          >
            <button
              onClick={handleLogout}
              className="nav-item logout-btn"
              title={collapsed ? 'Logout' : ''}
            >
              <LogOut size={20} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -3 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1, delay: 0.02 }}
                >
                  Logout
                </motion.span>
              )}
            </button>
          </motion.div>
        </div>
      </nav>
    </motion.aside>
  )
}

export default AdminSidebar
