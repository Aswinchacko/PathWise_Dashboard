import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import AdminSidebar from './AdminSidebar'
import authService from '../../services/authService'
import './Layout.css'

const Layout = ({ children, sidebarCollapsed, setSidebarCollapsed }) => {
  const isAdmin = authService.isAdmin()
  const { pathname } = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const lockMainScroll = !isAdmin && pathname === '/community'
  const mainMargin = sidebarCollapsed ? '100px' : '300px'

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  return (
    <div className="layout">
      {!isAdmin && (
        <button
          type="button"
          className="mobile-nav-open-btn"
          aria-label="Open navigation menu"
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu size={22} />
        </button>
      )}
      {isAdmin ? (
        <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      ) : (
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />
      )}
      <motion.main
        className={`main-content ${isAdmin ? 'admin-main-content' : ''} ${lockMainScroll ? 'main-content--community-lock' : ''}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{
          opacity: 1,
          x: 0,
          marginLeft: mainMargin
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
      >
        {children}
      </motion.main>
    </div>
  )
}

export default Layout 