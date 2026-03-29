import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

class RoadmapService {
  async generateRoadmap(goal, domain = null, userId = null) {
    try {
      const response = await api.post('/api/roadmap/generate-roadmap', {
        goal,
        domain,
        user_id: userId
      });

      // Log enhanced metadata for debugging
      const data = response.data;
      console.log(`Generated roadmap: ${data.title}`);
      console.log(`Difficulty: ${data.difficulty}`);
      console.log(`Estimated hours: ${data.estimated_hours}`);
      console.log(`Match score: ${data.match_score}`);
      
      return data;
    } catch (error) {
      console.error('Error generating roadmap:', error);
      throw error;
    }
  }

  async getRoadmapRecommendations(interests = '', experienceLevel = 'intermediate', timeCommitment = 300, limit = 5) {
    try {
      const params = {
        interests,
        experience_level: experienceLevel,
        time_commitment: timeCommitment,
        limit
      };

      const response = await api.get('/api/roadmap/roadmaps/recommendations', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching roadmap recommendations:', error);
      throw error;
    }
  }

  async getSimilarRoadmaps(goal, domain = null, limit = 5) {
    try {
      const params = { goal, limit };
      if (domain) params.domain = domain;

      const response = await api.get('/api/roadmap/roadmaps/similar', { params });

      return response.data;
    } catch (error) {
      console.error('Error fetching similar roadmaps:', error);
      throw error;
    }
  }

  async getAvailableDomains() {
    try {
      const response = await api.get('/api/roadmap/roadmaps/domains');

      return response.data;
    } catch (error) {
      console.error('Error fetching domains:', error);
      throw error;
    }
  }

  async getUserRoadmaps(userId) {
    try {
      const response = await api.get(`/api/roadmap/roadmaps/user/${userId}`);

      return response.data;
    } catch (error) {
      console.error('Error fetching user roadmaps:', error);
      throw error;
    }
  }

  async deleteRoadmap(roadmapId, userId) {
    try {
      const response = await api.delete(`/api/roadmap/roadmaps/${roadmapId}`, {
        params: { user_id: userId }
      });

      return response.data;
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      throw error;
    }
  }

  /**
   * AI-refine a single skill in a saved roadmap (Groq on roadmap API).
   * @param {{ roadmapId: string, userId: string, stepIndex: number, skillIndex: number, instruction?: string, preset?: 'simplify'|'expand'|'diverge' }} params
   */
  async refineTopic(params) {
    const { roadmapId, userId, stepIndex, skillIndex, instruction = '', preset = null } = params;
    const response = await api.post('/api/roadmap/refine-topic', {
      roadmap_id: roadmapId,
      user_id: userId,
      step_index: stepIndex,
      skill_index: skillIndex,
      instruction: instruction || '',
      preset: preset || null,
    });
    return response.data;
  }

  async getLatestRoadmap() {
    try {
      const response = await api.get('/api/roadmap/roadmaps/all', {
        params: { limit: 1, skip: 0 }
      });

      if (response.data.roadmaps && response.data.roadmaps.length > 0) {
        return response.data.roadmaps[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching latest roadmap:', error);
      throw error;
    }
  }

  // Helper function to convert roadmap steps to the format expected by the UI
  convertToRoadmapData(roadmap) {
    if (!roadmap || !roadmap.steps) {
      return [];
    }

    // Create enhanced root node with metadata
    const rootNode = {
      id: 'roadmap_root',
      title: roadmap.goal || 'Learning Roadmap',
      metadata: {
        difficulty: roadmap.difficulty || 'Intermediate',
        estimatedHours: roadmap.estimated_hours || 300,
        prerequisites: roadmap.prerequisites || '',
        learningOutcomes: roadmap.learning_outcomes || '',
        matchScore: roadmap.match_score || 0,
        domain: roadmap.domain
      },
      children: roadmap.steps.map((step, stepIndex) => ({
        id: `step_${stepIndex}`,
        title: step.category,
        icon: this.getIconForCategory(step.category),
        color: this.getColorForLevel(stepIndex + 1),
        children: step.skills.map((skill, skillIndex) => ({
          id: `step_${stepIndex}_skill_${skillIndex}`,
          title: skill,
          icon: this.getIconForSkill(skill),
          estimatedTime: this.estimateSkillTime(skill)
        }))
      }))
    };

    return [rootNode];
  }

  // Estimate time for individual skills
  estimateSkillTime(skill) {
    const skillLower = skill.toLowerCase();
    
    // Basic skills - shorter time
    if (skillLower.includes('basic') || skillLower.includes('introduction') || skillLower.includes('fundamentals')) {
      return '2-4 hours';
    }
    
    // Advanced skills - longer time
    if (skillLower.includes('advanced') || skillLower.includes('optimization') || skillLower.includes('architecture')) {
      return '8-12 hours';
    }
    
    // Framework/library specific
    if (skillLower.includes('react') || skillLower.includes('vue') || skillLower.includes('angular')) {
      return '6-10 hours';
    }
    
    // Default time
    return '4-6 hours';
  }

  getColorForLevel(level) {
    const colors = [
      'var(--primary-500)',
      'var(--success-500)',
      'var(--warning-500)',
      'var(--error-500)',
      'var(--info-500)',
      'var(--neutral-500)'
    ];
    return colors[(level - 1) % colors.length];
  }

  getIconForCategory(category) {
    // Map categories to appropriate icons
    const iconMap = {
      'Foundations': 'BookOpen',
      'JavaScript Core': 'Code',
      'Frameworks': 'Layers',
      'Styling & UX': 'Palette',
      'Testing & Tooling': 'TestTube',
      'Deployment': 'Rocket',
      'Backend': 'Server',
      'Database': 'Database',
      'Security': 'Shield',
      'DevOps': 'Settings',
      'Cloud': 'Cloud',
      'Mobile': 'Smartphone',
      'Data Science': 'BarChart',
      'Machine Learning': 'Brain',
      'AI': 'Cpu'
    };

    for (const [key, icon] of Object.entries(iconMap)) {
      if (category.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return 'Target'; // Default icon
  }

  getIconForSkill(skill) {
    // Map skills to appropriate icons
    const skillMap = {
      'javascript': 'Code',
      'react': 'Layers',
      'css': 'Palette',
      'html': 'FileText',
      'node': 'Server',
      'python': 'Code',
      'java': 'Code',
      'sql': 'Database',
      'git': 'GitBranch',
      'docker': 'Container',
      'aws': 'Cloud',
      'testing': 'TestTube',
      'api': 'Zap',
      'security': 'Shield',
      'mobile': 'Smartphone',
      'data': 'BarChart',
      'ml': 'Brain',
      'ai': 'Cpu'
    };

    const skillLower = skill.toLowerCase();
    for (const [key, icon] of Object.entries(skillMap)) {
      if (skillLower.includes(key)) {
        return icon;
      }
    }
    return 'Circle'; // Default icon
  }
}

export default new RoadmapService();

