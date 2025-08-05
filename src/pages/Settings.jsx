import { motion } from 'framer-motion'
import { Lightbulb, User, Target, FileText, Upload, CheckSquare, Square, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import './Settings.css'

const Settings = () => {
  // Get current user from auth service
  const currentUser = authService.getCurrentUser()
  const navigate = useNavigate()

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  const settings = [
    {
      id: 1,
      title: 'Profile',
      icon: User,
      content: (
        <div className="profile-section">
          <div className="profile-avatar">
            <User size={32} />
          </div>
          <div className="profile-info">
            <h4>{currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User'}</h4>
            <p>Software Developer • 2 years experience</p>
            <p>{currentUser?.email || 'user@email.com'}</p>
          </div>
          <button className="edit-btn">
            <Upload size={16} />
          </button>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Goals',
      icon: Target,
      content: (
        <div className="goals-section">
          <div className="progress-chart">
            <div className="chart-circle">
              <div className="chart-progress" style={{ '--progress': '60%' }}></div>
            </div>
          </div>
          <div className="goals-stats">
            <div className="stat-item">
              <div className="stat-circle yellow">1</div>
              <span>Completed</span>
            </div>
            <div className="stat-item">
              <div className="stat-circle orange">1</div>
              <span>In Progress</span>
            </div>
            <div className="stat-item">
              <div className="stat-circle blue">1</div>
              <span>Planned</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Resume',
      icon: FileText,
      content: (
        <div className="resume-section">
          <div className="resume-icon">
            <FileText size={24} />
          </div>
          <div className="resume-info">
            <h4>Uploaded Resume</h4>
            <p>Last updated: 2 days ago</p>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: 'Preferences',
      icon: CheckSquare,
      content: (
        <div className="preferences-section">
          <div className="checkbox-item">
            <Square size={20} />
            <span>Email notifications</span>
          </div>
          <div className="checkbox-item checked">
            <CheckSquare size={20} />
            <span>Session reminders</span>
          </div>
          <div className="checkbox-item">
            <Square size={20} />
            <span>Weekly reports</span>
          </div>
          <div className="checkbox-item checked">
            <CheckSquare size={20} />
            <span>Progress updates</span>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: 'Account',
      icon: LogOut,
      content: (
        <div className="account-section">
          <div className="account-info">
            <p>Signed in as: {currentUser?.email || 'user@email.com'}</p>
            <p>Last login: {currentUser?.lastLogin ? new Date(currentUser.lastLogin).toLocaleDateString() : 'Unknown'}</p>
          </div>
          <button className="btn btn-danger" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="settings-page">
      <motion.div 
        className="settings-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Settings</h1>
        <button className="theme-toggle-btn">
          <Lightbulb size={20} />
        </button>
      </motion.div>

      <div className="settings-grid">
        {settings.map((setting, index) => {
          const Icon = setting.icon
          return (
            <motion.div
              key={setting.id}
              className="setting-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="setting-header">
                <Icon size={20} />
                <h3>{setting.title}</h3>
              </div>
              <div className="setting-content">
                {setting.content}
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div 
        className="empty-section"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="empty-placeholder">
          <h3>Additional Settings</h3>
          <p>More configuration options coming soon...</p>
        </div>
      </motion.div>
    </div>
  )
}

export default Settings 