import axios from 'axios';
import { getPublicApiOrigin } from '../config/apiBase';

// Create axios instance
const api = axios.create({
  baseURL: getPublicApiOrigin(),
  headers: {
    'Content-Type': 'application/json',
  },
});

class RoadmapAnalyticsService {
  // Track user progress on roadmap items
  async trackProgress(userId, roadmapId, itemId, action, metadata = {}) {
    try {
      const progressData = {
        user_id: userId,
        roadmap_id: roadmapId,
        item_id: itemId,
        action: action, // 'started', 'completed', 'bookmarked', 'skipped'
        timestamp: new Date().toISOString(),
        metadata: {
          ...metadata,
          user_agent: navigator.userAgent,
          session_id: this.getSessionId()
        }
      };

      // Store locally for offline capability
      this.storeProgressLocally(progressData);

      // Send to server
      const response = await api.post('/api/roadmap/analytics/progress', progressData);
      return response.data;
    } catch (error) {
      console.error('Error tracking progress:', error);
      // Fail silently for analytics
      return null;
    }
  }

  // Get user's learning analytics
  async getUserAnalytics(userId, timeframe = '30d') {
    try {
      const response = await api.get(`/api/roadmap/analytics/user/${userId}`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return this.getDefaultAnalytics();
    }
  }

  // Get roadmap completion insights
  async getRoadmapInsights(roadmapId) {
    try {
      const response = await api.get(`/api/roadmap/analytics/roadmap/${roadmapId}/insights`);
      return response.data;
    } catch (error) {
      console.error('Error fetching roadmap insights:', error);
      return this.getDefaultInsights();
    }
  }

  // Calculate learning velocity
  calculateLearningVelocity(progressData) {
    if (!progressData || progressData.length < 2) {
      return { velocity: 0, trend: 'stable' };
    }

    const completions = progressData.filter(p => p.action === 'completed');
    const timeSpan = 7; // days
    const recentCompletions = completions.filter(c => {
      const completionDate = new Date(c.timestamp);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeSpan);
      return completionDate >= cutoffDate;
    });

    const velocity = recentCompletions.length / timeSpan;
    
    // Calculate trend
    const previousWeekCompletions = completions.filter(c => {
      const completionDate = new Date(c.timestamp);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (timeSpan * 2));
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - timeSpan);
      return completionDate >= startDate && completionDate < endDate;
    });

    const previousVelocity = previousWeekCompletions.length / timeSpan;
    let trend = 'stable';
    
    if (velocity > previousVelocity * 1.2) {
      trend = 'increasing';
    } else if (velocity < previousVelocity * 0.8) {
      trend = 'decreasing';
    }

    return { velocity: Math.round(velocity * 10) / 10, trend };
  }

  // Predict completion time
  predictCompletionTime(roadmapData, userProgress) {
    if (!roadmapData || !roadmapData.metadata) {
      return null;
    }

    const totalHours = roadmapData.metadata.estimatedHours || 300;
    const completedItems = userProgress?.filter(p => p.action === 'completed').length || 0;
    const totalItems = this.countTotalItems(roadmapData);
    
    if (totalItems === 0) return null;

    const completionPercentage = completedItems / totalItems;
    const remainingHours = totalHours * (1 - completionPercentage);
    
    // Factor in user's learning velocity
    const velocity = this.calculateLearningVelocity(userProgress);
    const adjustedHours = velocity.velocity > 0 
      ? remainingHours / Math.max(velocity.velocity, 0.1)
      : remainingHours;

    return {
      estimatedHours: Math.round(adjustedHours),
      completionPercentage: Math.round(completionPercentage * 100),
      remainingItems: totalItems - completedItems
    };
  }

  // Generate personalized recommendations
  generateRecommendations(userAnalytics, roadmapData) {
    const recommendations = [];

    // Learning pace recommendations
    const velocity = userAnalytics.learningVelocity || { velocity: 0, trend: 'stable' };
    
    if (velocity.velocity < 0.5) {
      recommendations.push({
        type: 'pace',
        priority: 'medium',
        title: 'Consider increasing your learning pace',
        description: 'You\'re completing less than 0.5 items per day. Try setting aside more time for learning.',
        action: 'Set daily learning goals'
      });
    }

    if (velocity.trend === 'decreasing') {
      recommendations.push({
        type: 'motivation',
        priority: 'high',
        title: 'Your learning pace is slowing down',
        description: 'Consider taking a break or switching to different topics to maintain motivation.',
        action: 'Review your learning strategy'
      });
    }

    // Difficulty recommendations
    if (roadmapData?.metadata?.difficulty === 'Advanced' && velocity.velocity < 0.3) {
      recommendations.push({
        type: 'difficulty',
        priority: 'high',
        title: 'This roadmap might be too challenging',
        description: 'Consider starting with intermediate-level content first.',
        action: 'Explore prerequisite topics'
      });
    }

    // Time management recommendations
    const prediction = this.predictCompletionTime(roadmapData, userAnalytics.progressData);
    if (prediction && prediction.estimatedHours > 500) {
      recommendations.push({
        type: 'time',
        priority: 'medium',
        title: 'This is a long-term commitment',
        description: `Estimated ${prediction.estimatedHours} hours remaining. Consider breaking it into smaller milestones.`,
        action: 'Set monthly goals'
      });
    }

    return recommendations;
  }

  // Local storage helpers
  storeProgressLocally(progressData) {
    try {
      const key = 'roadmap_progress_offline';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(progressData);
      
      // Keep only last 100 entries
      const trimmed = existing.slice(-100);
      localStorage.setItem(key, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error storing progress locally:', error);
    }
  }

  getLocalProgress() {
    try {
      const key = 'roadmap_progress_offline';
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
      console.error('Error getting local progress:', error);
      return [];
    }
  }

  // Utility functions
  getSessionId() {
    let sessionId = sessionStorage.getItem('roadmap_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('roadmap_session_id', sessionId);
    }
    return sessionId;
  }

  countTotalItems(roadmapData) {
    if (!roadmapData || !roadmapData.children) return 0;
    
    let count = 0;
    const traverse = (node) => {
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => traverse(child));
      } else {
        count++; // Leaf node (skill)
      }
    };
    
    roadmapData.children.forEach(child => traverse(child));
    return count;
  }

  getDefaultAnalytics() {
    return {
      totalProgress: 0,
      completedItems: 0,
      learningVelocity: { velocity: 0, trend: 'stable' },
      timeSpent: 0,
      progressData: []
    };
  }

  getDefaultInsights() {
    return {
      averageCompletionTime: 0,
      popularSkills: [],
      difficultyRating: 0,
      userSatisfaction: 0
    };
  }

  // Export progress data
  exportProgressData(userId) {
    try {
      const localProgress = this.getLocalProgress();
      const userProgress = localProgress.filter(p => p.user_id === userId);
      
      const exportData = {
        userId,
        exportDate: new Date().toISOString(),
        progressData: userProgress,
        summary: {
          totalActions: userProgress.length,
          completedItems: userProgress.filter(p => p.action === 'completed').length,
          timeSpan: this.calculateTimeSpan(userProgress)
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `roadmap_progress_${userId}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error exporting progress data:', error);
      return false;
    }
  }

  calculateTimeSpan(progressData) {
    if (!progressData || progressData.length === 0) return 0;
    
    const timestamps = progressData.map(p => new Date(p.timestamp));
    const earliest = new Date(Math.min(...timestamps));
    const latest = new Date(Math.max(...timestamps));
    
    return Math.ceil((latest - earliest) / (1000 * 60 * 60 * 24)); // days
  }
}

export default new RoadmapAnalyticsService();

