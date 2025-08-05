import { motion } from 'framer-motion'
import { Search, Lightbulb, Lock, MapPin, DollarSign, Calendar, User } from 'lucide-react'
import './Jobs.css'

const Jobs = () => {
  const jobs = [
    {
      id: 1,
      title: 'Software Development Engineer',
      company: 'Google',
      location: 'San Francisco, CA',
      salary: '$200/hr',
      date: '2 days ago',
      unlocked: true,
      description: 'Join our team to build scalable software solutions and work on cutting-edge technologies.',
      logo: 'G',
    },
    {
      id: 2,
      title: 'React Developer',
      company: 'Microsoft',
      location: 'Seattle, WA',
      salary: '$180/hr',
      date: '1 week ago',
      unlocked: false,
      description: 'Develop modern web applications using React and contribute to our product ecosystem.',
      logo: 'M',
    },
    {
      id: 3,
      title: 'Data Scientist',
      company: 'Amazon',
      location: 'New York, NY',
      salary: '$220/hr',
      date: '3 days ago',
      unlocked: false,
      description: 'Apply machine learning techniques to solve complex business problems.',
      logo: 'A',
    },
    {
      id: 4,
      title: 'Full Stack Developer',
      company: 'Netflix',
      location: 'Los Angeles, CA',
      salary: '$190/hr',
      date: '5 days ago',
      unlocked: false,
      description: 'Build and maintain web applications that serve millions of users worldwide.',
      logo: 'N',
    },
  ]

  return (
    <div className="jobs-page">
      <motion.div 
        className="jobs-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <h1>OPPORTUNITIES (Career Hub)</h1>
          <p>Discover job and internship opportunities tailored to your skills</p>
        </div>
        <button className="theme-toggle-btn">
          <Lightbulb size={20} />
        </button>
      </motion.div>

      <div className="search-section">
        <div className="search-placeholder">
          <Search size={20} />
          <span>Search opportunities...</span>
        </div>
      </div>

      <div className="jobs-grid">
        {jobs.map((job, index) => (
          <motion.div
            key={job.id}
            className={`job-card ${job.unlocked ? 'unlocked' : 'locked'}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="job-header">
              <div className="job-meta">
                <span className="job-date">{job.date}</span>
                <div className="company-logo">
                  <span>{job.logo}</span>
                </div>
              </div>
              <div className="job-info">
                <h3>{job.title}</h3>
                <p className="company-name">{job.company}</p>
              </div>
            </div>

            <div className="job-details">
              <div className="job-tags">
                <span className="tag">React</span>
                <span className="tag">JavaScript</span>
              </div>
              <div className="job-location-salary">
                <div className="location">
                  <MapPin size={16} />
                  <span>{job.location}</span>
                </div>
                <div className="salary">
                  <DollarSign size={16} />
                  <span>{job.salary}</span>
                </div>
              </div>
            </div>

            <div className="job-actions">
              <button className="btn btn-primary">Details</button>
            </div>

            {!job.unlocked && (
              <div className="locked-overlay">
                <Lock size={32} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Jobs 