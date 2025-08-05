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
  FolderOpen
} from 'lucide-react'
import './Sidebar.css'

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/roadmap', icon: Target, label: 'Roadmap' },
    { path: '/projects', icon: FolderOpen, label: 'Projects' },
    { path: '/mentors', icon: Users, label: 'Mentors' },
    { path: '/jobs', icon: Briefcase, label: 'Jobs' },
    { path: '/chatbot', icon: MessageCircle, label: 'Chatbot' },
    { path: '/resources', icon: FileText, label: 'Resources' },
    { path: '/community', icon: Globe, label: 'Community' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <motion.aside 
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      initial={{ width: collapsed ? 80 : 240 }}
      animate={{ width: collapsed ? 80 : 240 }}
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
                className={`nav-item ${isActive ? 'active' : ''}`}
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
      </nav>
    </motion.aside>
  )
}

export default Sidebar 