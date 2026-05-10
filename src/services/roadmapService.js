import axios from 'axios';
import { getPublicApiOrigin, apiUrl } from '../config/apiBase';

const API_BASE_URL = apiUrl('/api/roadmap');

/** FastAPI often puts errors in `detail` (string or validation array). */
export function formatRoadmapApiError(error) {
  const d = error?.response?.data?.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) {
    return d
      .map((x) => (typeof x === 'object' && x?.msg ? x.msg : JSON.stringify(x)))
      .join(' ');
  }
  const msg = error?.message || '';
  if (error?.code === 'ECONNREFUSED' || msg === 'Network Error') {
    return `Cannot reach roadmap API (${API_BASE_URL}). Start docker compose (nginx + roadmap-api) or set VITE_PUBLIC_API_URL.`;
  }
  return msg || 'Request failed';
}

/**
 * Client-side guardrails (API enforces the same rules).
 * @param {string} goal
 * @returns {string|null} Error message, or null if valid
 */
export function validateRoadmapGoal(goal) {
  const t = String(goal ?? '').trim();
  if (!t) return 'Please enter a goal.';
  if (t.length < 3) return 'Goal is too short — use at least 3 characters.';
  if (t.length > 400) return 'Goal is too long — keep it under 400 characters.';
  if (/^\d+$/.test(t)) return 'Use words to describe what you want to learn or achieve, not only numbers.';
  if (!/\p{L}/u.test(t)) {
    return 'Include at least one letter (describe your goal in any language you use).';
  }
  const noSpace = t.replace(/\s/g, '');
  if (noSpace.length >= 6) {
    const counts = {};
    for (const c of noSpace) counts[c] = (counts[c] || 0) + 1;
    const maxCount = Math.max(...Object.values(counts));
    if (maxCount / noSpace.length > 0.85) {
      return 'That looks like random repetition. Enter a short phrase or sentence for your goal.';
    }
  }
  return null;
}

// Create axios instance
const api = axios.create({
  baseURL: getPublicApiOrigin(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000,
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

    const rawSteps = Array.isArray(roadmap.steps) ? roadmap.steps : [];
    const children = rawSteps
      .map((step, stepIndex) => {
        const title =
          step && step.category != null ? String(step.category).trim() : '';
        if (!title) return null;

        let skillList = step.skills;
        if (!Array.isArray(skillList)) {
          skillList =
            typeof skillList === 'string'
              ? skillList
                  .split(/[;|]/)
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [];
        }
        const skills = skillList
          .map((s) => (s == null ? '' : String(s).trim()))
          .filter(Boolean);
        const safeSkills = skills.length ? skills : [`Complete core activities: ${title}`];

        return {
          id: `step_${stepIndex}`,
          title,
          icon: this.getIconForCategory(title),
          color: this.getColorForLevel(stepIndex + 1),
          children: safeSkills.map((skill, skillIndex) => ({
            id: `step_${stepIndex}_skill_${skillIndex}`,
            title: skill,
            icon: this.getIconForSkill(skill),
            estimatedTime: this.estimateSkillTime(skill),
          })),
        };
      })
      .filter(Boolean);

    if (!children.length) return [];

    const rootNode = {
      id: 'roadmap_root',
      title: roadmap.goal || 'Learning Roadmap',
      metadata: {
        difficulty: roadmap.difficulty || 'Intermediate',
        estimatedHours: roadmap.estimated_hours || 300,
        prerequisites: roadmap.prerequisites || '',
        learningOutcomes: roadmap.learning_outcomes || '',
        matchScore: roadmap.match_score || 0,
        domain: roadmap.domain,
      },
      children,
    };

    return [rootNode];
  }

  // Estimate time for individual skills
  estimateSkillTime(skill) {
    const skillLower = String(skill || '').toLowerCase();
    
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
    const cat = String(category || '');
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
      if (cat.toLowerCase().includes(key.toLowerCase())) {
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

    const skillLower = String(skill || '').toLowerCase();
    for (const [key, icon] of Object.entries(skillMap)) {
      if (skillLower.includes(key)) {
        return icon;
      }
    }
    return 'Circle'; // Default icon
  }
}

export default new RoadmapService();

