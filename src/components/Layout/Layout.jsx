import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import authService from '../../services/authService'
import './Layout.css'

const Layout = ({ children, sidebarCollapsed, setSidebarCollapsed }) => {
  const isAdmin = authService.isAdmin()

  return (
    <div className="layout">
      {!isAdmin && (
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      )}
      <motion.main
        className={`main-content ${isAdmin ? 'admin-main-content' : ''}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{
          opacity: 1,
          x: 0,
          marginLeft: isAdmin ? '0' : (sidebarCollapsed ? '100px' : '300px')
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