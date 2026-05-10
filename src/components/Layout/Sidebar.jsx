import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Menu,
  Home,
  GraduationCap,
  FileText,
  Users,
  MessageCircle,
  BarChart3,
  Settings,
  Target,
  Briefcase,
  Upload,
  Globe,
  FolderOpen,
  Shield,
  Crown,
  Zap,
  Gamepad2,
  LogOut
} from 'lucide-react'
import './Sidebar.css'
import authService from '../../services/authService'

const Sidebar = ({ collapsed, setCollapsed, mobileOpen = false, onMobileClose }) => {
  const location = useLocation()
  const isAdmin = authService.isAdmin()

  const handleLogout = () => {
    authService.logout()
    onMobileClose?.()
    window.location.href = '/login'
  }

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/roadmap', icon: Target, label: 'Roadmap' },
    { path: '/projects', icon: FolderOpen, label: 'Projects', premium: true },
    { path: '/resume-parser', icon: Upload, label: 'Resume Parser' },
    { path: '/mentors', icon: Users, label: 'Mentors', premium: true },
    { path: '/jobs', icon: Briefcase, label: 'Jobs', premium: true },
    { path: '/micro-learning', icon: Gamepad2, label: 'Micro-Learning', premium: true },
    { path: '/chatbot', icon: MessageCircle, label: 'Chatbot' },
    { path: '/resources', icon: FileText, label: 'Resources' },
    { path: '/community', icon: Globe, label: 'Community' },
    { path: '/subscription', icon: Zap, label: 'Subscription' },
    ...(isAdmin ? [{ path: '/admin', icon: Shield, label: 'Admin Panel' }] : []),
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation menu"
          onClick={onMobileClose}
        />
      )}
    <motion.aside
      className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}
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
          <motion.h2
            className="logo"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15, delay: 0.02 }}
          >
            PathWise
          </motion.h2>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, index) => {
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
                onClick={() => onMobileClose?.()}
                className={`nav-item ${isActive ? 'active' : ''} ${item.premium ? 'premium-feature' : ''}`}
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
                {item.premium && (
                  <Crown size={14} className="premium-badge" />
                )}
              </NavLink>
            </motion.div>
          )
        })}

        <div className="nav-footer">
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.12 }}
          >
            <button
              type="button"
              onClick={handleLogout}
              className="nav-item logout-btn"
              title={collapsed ? 'Log out' : ''}
            >
              <LogOut size={20} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -3 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1, delay: 0.02 }}
                >
                  Log out
                </motion.span>
              )}
            </button>
          </motion.div>
        </div>
      </nav>
    </motion.aside>
    </>
  )
}

export default Sidebar 