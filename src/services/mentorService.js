import axios from 'axios';

const MENTOR_API_BASE_URL = import.meta.env.VITE_MENTOR_API_URL || 'http://localhost:8004';

// Create axios instance for mentor service
const mentorApi = axios.create({
  baseURL: MENTOR_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

class MentorService {
  async getMentorsForRoadmap(userId, roadmapGoal, domain = null, experienceLevel = 'intermediate', platforms = ['linkedin', 'github'], limit = 10) {
    try {
      const response = await mentorApi.post('/api/mentors/roadmap-based', {
        user_id: userId,
        roadmap_goal: roadmapGoal,
        domain: domain,
        experience_level: experienceLevel,
        preferred_platforms: platforms,
        limit: limit
      });

      console.log(`Found ${response.data.mentors.length} mentors for roadmap: ${roadmapGoal}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching roadmap mentors:', error);
      throw error;
    }
  }

  async getMentorRecommendations(userId, domain, topics, experienceLevel = 'intermediate', platforms = ['linkedin', 'github', 'stackoverflow']) {
    try {
      const response = await mentorApi.post('/api/mentors/recommend', {
        user_id: userId,
        domain: domain,
        topics: topics,
        experience_level: experienceLevel,
        preferred_platforms: platforms
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching mentor recommendations:', error);
      throw error;
    }
  }

  async getAvailableDomains() {
    try {
      const response = await mentorApi.get('/api/mentors/domains');
      return response.data;
    } catch (error) {
      console.error('Error fetching mentor domains:', error);
      throw error;
    }
  }

  async checkMentorServiceHealth() {
    try {
      const response = await mentorApi.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('Mentor service health check failed:', error);
      return false;
    }
  }

  // Helper method to format mentor data for UI
  formatMentorForUI(mentor) {
    return {
      id: mentor.mentor_id,
      name: mentor.name,
      title: mentor.title,
      company: mentor.company,
      location: mentor.location,
      expertise: mentor.expertise,
      rating: mentor.rating,
      hourlyRate: mentor.hourly_rate,
      languages: mentor.languages || ['English'],
      sessions: mentor.connections ? Math.floor(mentor.connections / 10) : Math.floor(Math.random() * 100) + 20,
      responseTime: this.calculateResponseTime(mentor.response_rate),
      verified: mentor.platform === 'linkedin',
      featured: mentor.rating > 4.7 && !mentor.is_real_profile, // Don't mark as featured if it's a real profile (has its own badge)
      avatar: this.generateAvatarUrl(mentor.name),
      description: mentor.bio,
      platform: mentor.platform,
      profileUrl: mentor.profile_url,
      availability: mentor.availability,
      contactInfo: mentor.contact_info,
      followers: mentor.followers,
      connections: mentor.connections,
      postsPerMonth: mentor.posts_per_month,
      responseRate: mentor.response_rate,
      certifications: mentor.certifications || [],
      education: mentor.education,
      recentActivity: mentor.recent_activity || [],
      relevanceScore: mentor.relevance_score,
      isRealProfile: mentor.is_real_profile || false,  // Flag for real scraped profiles
      scrapedAt: mentor.scraped_at
    };
  }

  calculateResponseTime(responseRate) {
    if (!responseRate) return '6 hours';
    if (responseRate >= 95) return '1 hour';
    if (responseRate >= 85) return '2 hours';
    if (responseRate >= 75) return '4 hours';
    return '6+ hours';
  }

  generateAvatarUrl(name) {
    // Generate consistent avatar URLs based on name
    const seed = name.toLowerCase().replace(/\s+/g, '-');
    return `https://images.unsplash.com/photo-${this.getPhotoId(seed)}?w=150&h=150&fit=crop&crop=face`;
  }

  getPhotoId(seed) {
    // Map names to specific photo IDs for consistency
    const photoIds = [
      '1494790108755-2616b612b786',
      '1507003211169-0a1dd7228f2d',
      '1438761681033-6461ffad8d80',
      '1472099645785-5658abf4ff4e',
      '1544005313-94ddf0286df2',
      '1500648767791-00dcc994a43e',
      '1573496359142-b8d87734a5a2',
      '1580489944761-15a19d654956',
      '1519345182560-3f2917c472ef',
      '1506794778202-cad84cf45f1d'
    ];
    
    const hash = seed.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return photoIds[Math.abs(hash) % photoIds.length];
  }

  // Get current user's roadmap goal from MongoDB (via API)
  async getCurrentRoadmapGoal(userId = null) {
    try {
      // If userId provided, fetch from roadmap service (MongoDB) - PRIMARY SOURCE
      if (userId) {
        try {
          const roadmapApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
          console.log(`🔍 Fetching roadmap from MongoDB for user: ${userId}`);
          
          const response = await axios.get(`${roadmapApiUrl}/api/roadmap/roadmaps/user/${userId}`);
          
          if (response.data.roadmaps && response.data.roadmaps.length > 0) {
            // Get the most recent roadmap (already sorted by updated_at)
            const latest = response.data.roadmaps[0];
            
            console.log(`✅ Found roadmap in MongoDB:`, {
              goal: latest.goal,
              domain: latest.domain,
              updated: latest.updated_at
            });
            
            // Cache in localStorage for offline fallback
            const roadmapData = {
              goal: latest.goal || latest.title,
              domain: latest.domain,
              roadmapId: latest.id,
              updated_at: latest.updated_at
            };
            localStorage.setItem('current_roadmap', JSON.stringify(roadmapData));
            
            return {
              goal: latest.goal || latest.title,
              domain: latest.domain,
              roadmapId: latest.id
            };
          } else {
            console.log('⚠️ No roadmaps found in MongoDB for this user');
          }
        } catch (error) {
          console.error('❌ Error fetching roadmap from MongoDB:', error);
          // Fall through to localStorage backup
        }
      }
      
      // FALLBACK: Try localStorage only if MongoDB fetch failed or no userId
      console.log('📦 Checking localStorage as fallback...');
      
      const savedRoadmap = localStorage.getItem('current_roadmap');
      if (savedRoadmap) {
        const roadmap = JSON.parse(savedRoadmap);
        console.log('✅ Found roadmap in localStorage:', roadmap);
        return {
          goal: roadmap.goal,
          domain: roadmap.domain,
          roadmapId: roadmap.roadmapId
        };
      }
      
      const savedGoal = localStorage.getItem('current_goal');
      if (savedGoal) {
        const goalData = JSON.parse(savedGoal);
        console.log('✅ Found goal in localStorage:', goalData);
        return {
          goal: goalData.goal,
          domain: goalData.domain,
          roadmapId: goalData.roadmapId
        };
      }
      
      console.log('❌ No roadmap found in MongoDB or localStorage');
      return null;
    } catch (error) {
      console.error('Error getting current roadmap goal:', error);
      return null;
    }
  }

  // Save current roadmap goal for mentor recommendations
  saveCurrentRoadmapGoal(goal, domain) {
    try {
      const roadmapData = { goal, domain, timestamp: Date.now() };
      localStorage.setItem('current_roadmap', JSON.stringify(roadmapData));
    } catch (error) {
      console.error('Error saving roadmap goal:', error);
    }
  }
}

export default new MentorService();
