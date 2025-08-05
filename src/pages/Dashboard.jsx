import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  BookOpen, 
  Target, 
  CheckCircle, 
  Flame, 
  FileText, 
  Lightbulb,
  User,
  Calendar,
  Award,
  BarChart3,
  Clock,
  Zap,
  Star,
  ArrowUpRight,
  Users,
  Briefcase,
  MessageSquare,
  Eye,
  Download,
  Plus,
  Sparkles,
  Trophy,
  TrendingDown,
  Activity,
  Target as TargetIcon,
  BookOpen as BookOpenIcon,
  Users as UsersIcon,
  Briefcase as BriefcaseIcon
} from 'lucide-react'
import authService from '../services/authService'
import './Dashboard.css'

const Dashboard = () => {
  // Get current user from auth service
  const currentUser = authService.getCurrentUser()
  const userName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User'

  const progressData = [
    { label: 'Resume Section', completed: true, progress: 100, icon: FileText },
    { label: 'Update LinkedIn', completed: true, progress: 100, icon: Users },
    { label: 'Practice Interviews', completed: false, progress: 30, icon: MessageSquare },
    { label: 'Portfolio Projects', completed: false, progress: 0, icon: Briefcase },
  ]

  const achievements = [
    { title: 'First Project Completed', description: 'Successfully finished your first project', icon: Trophy, date: '2 days ago', color: 'gold' },
    { title: 'Learning Streak', description: '7 days of consistent learning', icon: Flame, date: '1 week ago', color: 'orange' },
    { title: 'Profile Optimization', description: 'Your profile is now 85% complete', icon: User, date: '3 days ago', color: 'blue' },
  ]

  const recentActivity = [
    { type: 'project', title: 'React Portfolio', time: '2 hours ago', icon: Briefcase, status: 'completed' },
    { type: 'mentor', title: 'Session with Sarah Chen', time: '1 day ago', icon: Users, status: 'scheduled' },
    { type: 'resource', title: 'Advanced CSS Techniques', time: '2 days ago', icon: BookOpen, status: 'in-progress' },
  ]

  const quickStats = [
    { label: 'Hours This Week', value: '12.5', icon: Clock, trend: '+2.3h', positive: true, color: 'blue' },
    { label: 'Projects Completed', value: '3', icon: CheckCircle, trend: '+1', positive: true, color: 'green' },
    { label: 'Mentor Sessions', value: '2', icon: Users, trend: '+1', positive: true, color: 'purple' },
    { label: 'Skills Improved', value: '5', icon: Zap, trend: '+2', positive: true, color: 'orange' },
  ]

  const weeklyData = [
    { day: 'Mon', hours: 2.5, goal: 3 },
    { day: 'Tue', hours: 3.2, goal: 3 },
    { day: 'Wed', hours: 1.8, goal: 3 },
    { day: 'Thu', hours: 4.1, goal: 3 },
    { day: 'Fri', hours: 2.9, goal: 3 },
    { day: 'Sat', hours: 1.5, goal: 2 },
    { day: 'Sun', hours: 0.8, goal: 2 },
  ]

  return (
    <div className="dashboard">
      {/* Enhanced Header */}
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="welcome-section">
          <div className="welcome-content">
            <div className="welcome-badge">
              <Sparkles size={16} />
              <span>Welcome back!</span>
            </div>
            <h1>Good morning, {currentUser?.firstName || 'User'}! 👋</h1>
            <p className="subtitle">You're making great progress. Keep up the momentum!</p>
            <div className="welcome-stats">
              <div className="stat-item">
                <div className="stat-circle">
                  <span className="stat-value">85%</span>
                </div>
                <span className="stat-label">Profile Complete</span>
              </div>
              <div className="stat-item">
                <div className="stat-circle streak">
                  <span className="stat-value">7</span>
                </div>
                <span className="stat-label">Day Streak</span>
              </div>
              <div className="stat-item">
                <div className="stat-circle">
                  <span className="stat-value">12.5h</span>
                </div>
                <span className="stat-label">This Week</span>
              </div>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline">
            <Download size={16} />
            Export Report
          </button>
          <button className="btn btn-primary">
            <Plus size={16} />
            New Goal
          </button>
          <button className="theme-toggle-btn">
            <Lightbulb size={20} />
          </button>
        </div>
      </motion.div>

      {/* Quick Stats Row */}
      <motion.div 
        className="quick-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {quickStats.map((stat, index) => (
          <motion.div 
            key={index}
            className="stat-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className={`stat-icon ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
              <div className={`stat-trend ${stat.positive ? 'positive' : 'negative'}`}>
                {stat.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {stat.trend}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="dashboard-grid">
        {/* Enhanced Progress Tracker */}
        <motion.div 
          className="card progress-tracker"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card-header">
            <div className="card-title">
              <Activity className="card-icon" />
              <h3>Weekly Progress</h3>
            </div>
            <div className="card-actions">
              <button className="btn-icon">
                <Eye size={16} />
              </button>
            </div>
          </div>
          <div className="progress-chart">
            <div className="chart-container">
              <div className="chart-bars">
                {weeklyData.map((data, index) => (
                  <div key={index} className="chart-bar-group">
                    <div className="chart-bar">
                      <div 
                        className="chart-bar-fill" 
                        style={{ 
                          height: `${(data.hours / Math.max(...weeklyData.map(d => d.goal))) * 100}%`,
                          backgroundColor: data.hours >= data.goal ? 'var(--success-500)' : 'var(--primary-500)'
                        }}
                      ></div>
                    </div>
                    <span className="chart-label">{data.day}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="chart-metrics">
              <div className="metric">
                <span className="metric-label">Weekly Goal</span>
                <span className="metric-value">15h / 20h</span>
              </div>
              <div className="metric">
                <span className="metric-label">Completion</span>
                <span className="metric-value">75%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Current Learning */}
        <motion.div 
          className="card current-learning"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="card-header">
            <div className="card-title">
              <BookOpenIcon className="card-icon" />
              <h3>Current Learning</h3>
            </div>
            <div className="learning-progress">
              <span>75% Complete</span>
            </div>
          </div>
          <div className="learning-content">
            <div className="current-topic">
              <div className="topic-info">
                <h4>Advanced React Patterns</h4>
                <p>Mastering hooks, context, and performance optimization</p>
                <div className="topic-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '75%' }}></div>
                  </div>
                  <span>3 of 4 modules</span>
                </div>
              </div>
              <button className="btn btn-primary">
                Continue
                <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="upcoming-topics">
              <h5>Upcoming</h5>
              <div className="topic-list">
                <div className="topic-item">
                  <div className="topic-icon">🎯</div>
                  <div className="topic-details">
                    <span>State Management</span>
                    <small>Next week</small>
                  </div>
                </div>
                <div className="topic-item">
                  <div className="topic-icon">⚡</div>
                  <div className="topic-details">
                    <span>Performance Optimization</span>
                    <small>In 2 weeks</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Streak Card */}
        <motion.div 
          className="card streak-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="card-header">
            <Flame className="card-icon" />
            <h3>Learning Streak</h3>
          </div>
          <div className="streak-content">
            <div className="streak-number">7</div>
            <span className="streak-label">days</span>
            <div className="streak-calendar">
              {[...Array(7)].map((_, index) => (
                <div key={index} className={`streak-day ${index < 5 ? 'active' : ''}`}></div>
              ))}
            </div>
            <div className="streak-message">
              <Star size={16} />
              <span>You're on fire! 🔥</span>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Resume Overview */}
        <motion.div 
          className="card resume-overview"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="card-header">
            <FileText className="card-icon" />
            <h3>Resume Score</h3>
          </div>
          <div className="resume-content">
            <div className="score-circle">
              <div className="score-ring">
                <div className="score-fill" style={{ '--progress': '85%' }}></div>
              </div>
              <div className="score-text">
                <span className="score-value">85%</span>
                <span className="score-label">ATS Score</span>
              </div>
            </div>
            <div className="resume-actions">
              <button className="btn btn-primary">
                <Download size={16} />
                Download PDF
              </button>
              <button className="btn btn-outline">
                <Eye size={16} />
                Preview
              </button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Goals Card */}
        <motion.div 
          className="card goals-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="card-header">
            <TargetIcon className="card-icon" />
            <h3>Weekly Goals</h3>
            <button className="btn-icon">
              <Plus size={16} />
            </button>
          </div>
          <div className="goals-list">
            {progressData.map((goal, index) => {
              const Icon = goal.icon
              return (
                <div key={index} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
                  <div className="goal-checkbox">
                    <Icon size={16} />
                  </div>
                  <div className="goal-content">
                    <span className="goal-label">{goal.label}</span>
                    <div className="goal-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${goal.progress}%` }}></div>
                      </div>
                      <span className="progress-text">{goal.progress}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          className="card activity-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="card-header">
            <Clock className="card-icon" />
            <h3>Recent Activity</h3>
          </div>
          <div className="activity-list">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon
              return (
                <div key={index} className={`activity-item ${activity.status}`}>
                  <div className="activity-icon">
                    <Icon size={16} />
                  </div>
                  <div className="activity-content">
                    <span className="activity-title">{activity.title}</span>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                  <div className="activity-status">
                    <span className={`status-badge ${activity.status}`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Enhanced Achievements */}
        <motion.div 
          className="card achievements-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0 }}
        >
          <div className="achievements-header">
            <div className="achievement-icon">
              <Award size={24} />
            </div>
            <div>
              <h3>Achievements</h3>
              <p>Keep up the great work!</p>
            </div>
          </div>
          <div className="achievements-list">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon
              return (
                <div key={index} className={`achievement-item ${achievement.color}`}>
                  <div className="achievement-icon-small">
                    <Icon size={16} />
                  </div>
                  <div className="achievement-content">
                    <h4>{achievement.title}</h4>
                    <p>{achievement.description}</p>
                    <span className="achievement-date">{achievement.date}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard 