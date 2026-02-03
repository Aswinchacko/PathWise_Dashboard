import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8006/api/v1/microlearning';

class MicroLearningService {
    /**
     * Get user progress for a specific roadmap
     */
    async getUserProgress(roadmapId) {
        try {
            const user = authService.getCurrentUser();
            if (!user) return null;

            const response = await axios.get(`${API_URL}/progress/${user.id}/${roadmapId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching progress:', error);
            throw error;
        }
    }

    /**
     * Initialize roadmap structure from existing roadmap data
     */
    async initializeStructure(roadmapId, milestones) {
        try {
            const response = await axios.post(`${API_URL}/initialize-structure`, milestones, {
                params: { roadmap_id: roadmapId }
            });
            // Note: Axios post signature is (url, data, config). 
            // But the endpoint expects query param roadmap_id AND body milestones.
            // Let's refine the call based on standard patterns.
            return response.data;
        } catch (error) {
            console.error('Error initializing structure:', error);
            throw error;
        }
    }

    /**
     * Get full roadmap structure
     */
    async getRoadmapStructure(roadmapId) {
        try {
            const response = await axios.get(`${API_URL}/${roadmapId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching structure:', error);
            throw error;
        }
    }

    /**
     * Get content for a specific milestone
     */
    async getMilestoneContent(roadmapId, milestoneId) {
        try {
            const response = await axios.get(`${API_URL}/${roadmapId}/${milestoneId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching content:', error);
            throw error;
        }
    }

    /**
     * Create an AI-generated topic on the fly (helper)
     */
    async generateContent(topicData) {
        try {
            const response = await axios.post(`${API_URL}/generate`, topicData);
            return response.data;
        } catch (error) {
            console.error('Error generating AI content:', error);
            throw error;
        }
    }

    /**
     * Mark a topic as complete
     */
    async completeTopic(roadmapId, topicId) {
        try {
            const user = authService.getCurrentUser();
            if (!user) throw new Error("User not authenticated");

            const response = await axios.post(`${API_URL}/complete-topic`, null, {
                params: {
                    user_id: user.id,
                    roadmap_id: roadmapId,
                    topic_id: topicId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error completing topic:', error);
            throw error;
        }
    }
}

export default new MicroLearningService();
