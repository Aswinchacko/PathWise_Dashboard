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

      return response.data;
    } catch (error) {
      console.error('Error generating roadmap:', error);
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

    // Create a single root node with all steps as children
    const rootNode = {
      id: 'roadmap_root',
      title: roadmap.goal || 'Learning Roadmap',
      children: roadmap.steps.map((step, stepIndex) => ({
        id: `step_${stepIndex}`,
        title: step.category,
        children: step.skills.map((skill, skillIndex) => ({
          id: `step_${stepIndex}_skill_${skillIndex}`,
          title: skill
        }))
      }))
    };

    return [rootNode];
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

