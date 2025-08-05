import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import './Layout.css'

const Layout = ({ children, sidebarCollapsed, setSidebarCollapsed }) => {
  return (
    <div className="layout">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <motion.main 
        className="main-content"
        initial={{ opacity: 0, x: 20 }}
        animate={{ 
          opacity: 1, 
          x: 0,
          marginLeft: sidebarCollapsed ? '100px' : '260px'
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