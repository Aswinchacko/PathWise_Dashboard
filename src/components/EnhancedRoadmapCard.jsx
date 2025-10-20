import React, { useState, useEffect } from 'react';
import {
  Clock,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Info,
  Star,
  Calendar,
  BarChart3,
  Zap
} from 'lucide-react';
import roadmapAnalyticsService from '../services/roadmapAnalyticsService';
import './EnhancedRoadmapCard.css';

const EnhancedRoadmapCard = ({ roadmapData, userProgress = [], userId, onProgressUpdate }) => {
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (roadmapData && userId) {
      loadAnalytics();
    }
  }, [roadmapData, userId, userProgress]);

  const loadAnalytics = async () => {
    try {
      const userAnalytics = await roadmapAnalyticsService.getUserAnalytics(userId);
      const prediction = roadmapAnalyticsService.predictCompletionTime(roadmapData, userProgress);
      const velocity = roadmapAnalyticsService.calculateLearningVelocity(userProgress);
      const recs = roadmapAnalyticsService.generateRecommendations(
        { ...userAnalytics, progressData: userProgress, learningVelocity: velocity },
        roadmapData
      );

      setAnalytics({
        ...userAnalytics,
        prediction,
        velocity
      });
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleSkillComplete = async (skillId) => {
    if (userId) {
      await roadmapAnalyticsService.trackProgress(
        userId,
        roadmapData.id,
        skillId,
        'completed',
        { skill_name: skillId }
      );
      onProgressUpdate && onProgressUpdate(skillId, 'completed');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'var(--success-500)';
      case 'intermediate': return 'var(--warning-500)';
      case 'advanced': return 'var(--error-500)';
      default: return 'var(--neutral-500)';
    }
  };

  const formatTime = (hours) => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  const getVelocityIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="text-success-500" size={16} />;
      case 'decreasing': return <TrendingUp className="text-error-500 rotate-180" size={16} />;
      default: return <BarChart3 className="text-neutral-500" size={16} />;
    }
  };

  if (!roadmapData || !roadmapData.metadata) {
    return <div className="enhanced-roadmap-card loading">Loading roadmap data...</div>;
  }

  const { metadata } = roadmapData;

  return (
    <div className="enhanced-roadmap-card">
      {/* Header */}
      <div className="roadmap-header">
        <div className="header-main">
          <h2 className="roadmap-title">{roadmapData.title}</h2>
          <div className="roadmap-badges">
            <span 
              className="difficulty-badge"
              style={{ backgroundColor: getDifficultyColor(metadata.difficulty) }}
            >
              {metadata.difficulty}
            </span>
            {metadata.matchScore > 0 && (
              <span className="match-badge">
                <Star size={14} />
                {(metadata.matchScore * 100).toFixed(0)}% match
              </span>
            )}
          </div>
        </div>
        
        <div className="header-stats">
          <div className="stat-item">
            <Clock size={16} />
            <span>{formatTime(metadata.estimatedHours)}</span>
          </div>
          <div className="stat-item">
            <Target size={16} />
            <span>{metadata.domain}</span>
          </div>
          {analytics?.velocity && (
            <div className="stat-item">
              {getVelocityIcon(analytics.velocity.trend)}
              <span>{analytics.velocity.velocity}/day</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      {analytics?.prediction && (
        <div className="progress-overview">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${analytics.prediction.completionPercentage}%` }}
            />
          </div>
          <div className="progress-stats">
            <span>{analytics.prediction.completionPercentage}% complete</span>
            <span>{analytics.prediction.remainingItems} items left</span>
            <span>~{formatTime(analytics.prediction.estimatedHours)} remaining</span>
          </div>
        </div>
      )}

      {/* Prerequisites */}
      {metadata.prerequisites && (
        <div className="prerequisites-section">
          <h4>
            <BookOpen size={16} />
            Prerequisites
          </h4>
          <p>{metadata.prerequisites}</p>
        </div>
      )}

      {/* Learning Outcomes */}
      {metadata.learningOutcomes && (
        <div className="outcomes-section">
          <h4>
            <Award size={16} />
            What You'll Learn
          </h4>
          <p>{metadata.learningOutcomes}</p>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <h4>
            <Zap size={16} />
            Recommendations
          </h4>
          {recommendations.slice(0, 2).map((rec, index) => (
            <div key={index} className={`recommendation ${rec.priority}`}>
              <div className="rec-header">
                {rec.priority === 'high' ? (
                  <AlertCircle size={16} />
                ) : (
                  <Info size={16} />
                )}
                <span className="rec-title">{rec.title}</span>
              </div>
              <p className="rec-description">{rec.description}</p>
              {rec.action && (
                <button className="rec-action">{rec.action}</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Roadmap Steps */}
      <div className="roadmap-steps">
        {roadmapData.children?.map((step, stepIndex) => (
          <div key={step.id} className="roadmap-step">
            <div className="step-header">
              <div className="step-icon" style={{ color: step.color }}>
                {step.icon || <Target size={20} />}
              </div>
              <h3 className="step-title">{step.title}</h3>
              <span className="step-count">
                {step.children?.length || 0} skills
              </span>
            </div>
            
            <div className="step-skills">
              {step.children?.map((skill, skillIndex) => {
                const isCompleted = userProgress.some(
                  p => p.item_id === skill.id && p.action === 'completed'
                );
                
                return (
                  <div 
                    key={skill.id} 
                    className={`skill-item ${isCompleted ? 'completed' : ''}`}
                    onClick={() => !isCompleted && handleSkillComplete(skill.id)}
                  >
                    <div className="skill-checkbox">
                      {isCompleted ? (
                        <CheckCircle2 size={16} className="text-success-500" />
                      ) : (
                        <div className="checkbox-empty" />
                      )}
                    </div>
                    <div className="skill-content">
                      <span className="skill-title">{skill.title}</span>
                      {skill.estimatedTime && (
                        <span className="skill-time">{skill.estimatedTime}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="roadmap-footer">
        <button 
          className="details-toggle"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
        
        {userId && (
          <button 
            className="export-progress"
            onClick={() => roadmapAnalyticsService.exportProgressData(userId)}
          >
            Export Progress
          </button>
        )}
      </div>

      {/* Detailed Analytics */}
      {showDetails && analytics && (
        <div className="detailed-analytics">
          <h4>Learning Analytics</h4>
          <div className="analytics-grid">
            <div className="analytics-item">
              <span className="analytics-label">Learning Velocity</span>
              <span className="analytics-value">
                {analytics.velocity.velocity} items/day
              </span>
            </div>
            <div className="analytics-item">
              <span className="analytics-label">Trend</span>
              <span className="analytics-value">
                {getVelocityIcon(analytics.velocity.trend)}
                {analytics.velocity.trend}
              </span>
            </div>
            {analytics.prediction && (
              <>
                <div className="analytics-item">
                  <span className="analytics-label">Completion</span>
                  <span className="analytics-value">
                    {analytics.prediction.completionPercentage}%
                  </span>
                </div>
                <div className="analytics-item">
                  <span className="analytics-label">Time Remaining</span>
                  <span className="analytics-value">
                    {formatTime(analytics.prediction.estimatedHours)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedRoadmapCard;

