import { motion } from 'framer-motion'
import { Edit3, Lightbulb, Target, BookOpen, Code, Users, Award } from 'lucide-react'
import './Roadmap.css'

const Roadmap = () => {
  const roadmapData = [
    {
      id: 1,
      title: 'Career Foundation',
      level: 1,
      color: 'var(--primary-500)',
      icon: Target,
      children: [
        {
          id: 2,
          title: 'Skill Assessment',
          level: 2,
          color: 'var(--neutral-500)',
          icon: BookOpen,
          children: [
            {
              id: 3,
              title: 'Technical Skills',
              level: 3,
              color: 'var(--success-500)',
              icon: Code,
              children: [
                {
                  id: 4,
                  title: 'Programming',
                  level: 4,
                  color: 'var(--primary-400)',
                  icon: Code,
                },
                {
                  id: 5,
                  title: 'Data Analysis',
                  level: 4,
                  color: 'var(--warning-500)',
                  icon: BookOpen,
                },
                {
                  id: 6,
                  title: 'Machine Learning',
                  level: 4,
                  color: 'var(--error-500)',
                  icon: Award,
                }
              ]
            },
            {
              id: 7,
              title: 'Soft Skills',
              level: 3,
              color: 'var(--primary-400)',
              icon: Users,
              children: [
                {
                  id: 8,
                  title: 'Communication',
                  level: 4,
                  color: 'var(--warning-500)',
                  icon: Users,
                },
                {
                  id: 9,
                  title: 'Leadership',
                  level: 4,
                  color: 'var(--error-500)',
                  icon: Award,
                }
              ]
            }
          ]
        }
      ]
    }
  ]

  const RoadmapNode = ({ node, isRoot = false }) => {
    const Icon = node.icon
    
    return (
      <motion.div
        className={`roadmap-node ${isRoot ? 'root' : ''}`}
        style={{ '--node-color': node.color }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="node-content">
          <Icon size={20} />
          <span className="node-title">{node.title}</span>
          <button className="edit-btn">
            <Edit3 size={16} />
          </button>
        </div>
        
        {node.children && (
          <div className="node-children">
            {node.children.map((child, index) => (
              <div key={child.id} className="child-wrapper">
                <div className="connection-line"></div>
                <RoadmapNode node={child} />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="roadmap-page">
      <motion.div 
        className="roadmap-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <h1>Career Roadmap</h1>
          <p>Your personalized learning path to success</p>
        </div>
        <button className="theme-toggle-btn">
          <Lightbulb size={20} />
        </button>
      </motion.div>

      <div className="roadmap-container">
        {roadmapData.map((node) => (
          <RoadmapNode key={node.id} node={node} isRoot={true} />
        ))}
      </div>
    </div>
  )
}

export default Roadmap 