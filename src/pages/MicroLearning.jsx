import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Flame,
    Target,
    CheckCircle,
    Lock,
    PlayCircle,
    X,
    Clock,
    Zap
} from 'lucide-react';
import Confetti from 'react-confetti';
import microLearningService from '../services/microLearningService';
import authService from '../services/authService';
import roadmapService from '../services/roadmapService';
import './MicroLearning.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css'; // Modern syntax highlighting

const TopicCard = ({ topic, status, onClick }) => {
    const isLocked = status === 'locked';
    const isCompleted = status === 'completed';

    return (
        <div
            className={`topic-card ${status}`}
            onClick={() => !isLocked && onClick(topic)}
        >
            <div className="topic-meta">
                <span className="topic-badge">
                    {isCompleted ? 'Completed' : isLocked ? 'Locked' : 'Ready'}
                </span>
                <div className="status-icon-wrapper">
                    {isCompleted && <CheckCircle size={18} className="status-icon completed" />}
                    {!isLocked && !isCompleted && <PlayCircle size={18} className="status-icon unlocked" />}
                    {isLocked && <Lock size={16} className="status-icon locked" />}
                </div>
            </div>

            <h4>{topic.title.replace("Error Generating: ", "")}</h4>

            <div className="topic-footer">
                <Clock size={14} />
                <span>{topic.estimated_duration_minutes} min read</span>
            </div>
        </div >
    );
};

const LearningModal = ({ topic, onClose, onComplete }) => {
    const [loading, setLoading] = useState(false);

    const handleComplete = async () => {
        setLoading(true);
        await onComplete();
        setLoading(false);
    };

    return (
        <div className="learning-modal-overlay">
            <motion.div
                className="learning-card"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
            >
                <div className="card-header">
                    <h2>{topic.title}</h2>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="card-content">
                    {topic.isLoading ? (
                        <div className="loading-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px' }}>
                            <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
                            <p>Generating personalized lesson...</p>
                            <style>{`
                                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                            `}</style>
                        </div>
                    ) : (
                        <>
                            <div className="explanation-section blog-content">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeHighlight]}
                                    components={{
                                        h3: ({ node, ...props }) => <h3 style={{ marginTop: '24px', marginBottom: '12px', color: '#2c3e50' }} {...props} />,
                                        p: ({ node, ...props }) => <p style={{ lineHeight: '1.7', marginBottom: '16px', color: '#4a5568' }} {...props} />,
                                        li: ({ node, ...props }) => <li style={{ marginBottom: '8px' }} {...props} />,
                                        code: ({ node, inline, className, children, ...props }) => {
                                            return !inline ? (
                                                <code className={className} style={{ borderRadius: '8px' }} {...props}>
                                                    {children}
                                                </code>
                                            ) : (
                                                <code className={className} style={{ background: '#edf2f7', padding: '2px 6px', borderRadius: '4px', color: '#e53e3e' }} {...props}>
                                                    {children}
                                                </code>
                                            )
                                        }
                                    }}
                                >
                                    {topic.short_explanation}
                                </ReactMarkdown>
                            </div>

                            <div className="key-points-section">
                                <h4>🔑 Key Takeaways</h4>
                                <ul>
                                    {topic.key_points && topic.key_points.map((point, index) => (
                                        <li key={index}>{point}</li>
                                    ))}
                                </ul>
                            </div>

                            {topic.example && (
                                <div className="example-section" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
                                    <h4>💡 Example</h4>
                                    <p style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{topic.example}</p>
                                </div>
                            )}

                            {topic.challenge && (
                                <div className="challenge-section">
                                    <h4>⚔️ Challenge</h4>
                                    <p>{topic.challenge}</p>
                                </div>
                            )}

                            <button
                                className="complete-btn"
                                onClick={handleComplete}
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Mark as Completed & Unlock Next'}
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const MicroLearning = () => {
    const [progress, setProgress] = useState(null);
    const [milestones, setMilestones] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [user, setUser] = useState(null);
    const [currentRoadmapId, setCurrentRoadmapId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
                if (!currentUser) {
                    setLoading(false);
                    return;
                }

                // Determine Roadmap ID
                let roadmapId = null;
                const savedGoal = localStorage.getItem('current_goal');
                if (savedGoal) {
                    try {
                        const parsed = JSON.parse(savedGoal);
                        roadmapId = parsed.roadmapId;
                    } catch (e) {
                        console.error("Error parsing current_goal", e);
                    }
                }

                if (!roadmapId) {
                    // Fallback to latest roadmap from service
                    const latest = await roadmapService.getLatestRoadmap();
                    if (latest) {
                        roadmapId = latest.id;
                    }
                }

                if (roadmapId) {
                    setCurrentRoadmapId(roadmapId);

                    try {
                        // Parallel fetch: Structure and Progress
                        const [structureRes, progressRes] = await Promise.all([
                            microLearningService.getRoadmapStructure(roadmapId),
                            microLearningService.getUserProgress(roadmapId)
                        ]);
                        setMilestones(structureRes.milestones || []);
                        setProgress(progressRes);
                    } catch (err) {
                        // If structure not found (404), try to initialize it
                        if (err.response && err.response.status === 404) {
                            console.log("Structure not found, attempting to initialize...");
                            try {
                                // 1. Get full roadmap details
                                // We might need to fetch by ID or use the latest if ID matches
                                // roadmapService.getUserRoadmaps returns a list. 
                                // Let's try to get specific roadmap details if possible, or filter from list.
                                const userRoadmaps = await roadmapService.getUserRoadmaps(currentUser.id);
                                const currentRoadmap = userRoadmaps.roadmaps.find(r => r.id === roadmapId);

                                if (currentRoadmap && currentRoadmap.steps) {
                                    // 2. Format for micro-learning service
                                    const payload = currentRoadmap.steps.map((step, idx) => ({
                                        id: `m_${idx}`,
                                        title: step.category,
                                        topics: step.skills
                                    }));

                                    // 3. Initialize
                                    await microLearningService.initializeStructure(roadmapId, payload);

                                    // 4. Retry fetch
                                    const [structureResRetry, progressResRetry] = await Promise.all([
                                        microLearningService.getRoadmapStructure(roadmapId),
                                        microLearningService.getUserProgress(roadmapId)
                                    ]);
                                    setMilestones(structureResRetry.milestones || []);
                                    setProgress(progressResRetry);
                                } else {
                                    console.error("Could not find roadmap details to initialize structure.");
                                }
                            } catch (initErr) {
                                console.error("Failed to auto-initialize structure:", initErr);
                            }
                        } else {
                            throw err;
                        }
                    }
                } else {
                    console.log("No active roadmap found for micro-learning.");
                }

            } catch (error) {
                console.error("Failed to load micro-learning data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getTopicStatus = (topicId) => {
        if (!progress) return 'locked';
        if (progress.completed_topic_ids.includes(topicId)) return 'completed';
        if (progress.unlocked_topic_ids.includes(topicId)) return 'unlocked';
        return 'locked';
    };

    const handleTopicClick = async (topic, milestoneId) => {
        // Check if content needs generation
        let topicToDisplay = topic;

        // If short_explanation is missing/empty, OR if it contains an error message, we treat it as needing generation
        const isError = topic.title.startsWith("Error Generating") ||
            (topic.short_explanation && topic.short_explanation.includes("encountered an error"));

        if (!topic.short_explanation || topic.short_explanation.length < 5 || isError) {
            // We'll pass a flag to the modal or handle it here?
            // Better to handle it here so we can save it back to state

            // Create a temporary "loading" topic
            const loadingTopic = {
                ...topic,
                title: isError ? topic.title.replace("Error Generating: ", "") : topic.title, // Clean title for loading state
                isLoading: true
            };
            setSelectedTopic(loadingTopic);

            try {
                console.log(`Generating content for ${topic.title}...`);
                const generatedContent = await microLearningService.generateContent({
                    title: isError ? topic.title.replace("Error Generating: ", "") : topic.title,
                    context: `Part of roadmap milestone: ${milestoneId}`,
                    difficulty: "Beginner", // Could be dynamic
                    roadmap_id: currentRoadmapId,
                    milestone_id: milestoneId,
                    topic_id: topic.topic_id
                });

                // Merge generated content with existing ID
                topicToDisplay = { ...generatedContent, topic_id: topic.topic_id };

                // Update local state so we don't regenerate next time
                setMilestones(prevMilestones => prevMilestones.map(m => {
                    if (m.milestone_id === milestoneId) {
                        return {
                            ...m,
                            topics: m.topics.map(t => t.topic_id === topic.topic_id ? topicToDisplay : t)
                        };
                    }
                    return m;
                }));

            } catch (error) {
                console.error("Failed to generate content:", error);
                alert("Failed to generate content. Please try again.");
                setSelectedTopic(null);
                return;
            }
        }

        setSelectedTopic(topicToDisplay);
    };

    const handleTopicComplete = async () => {
        if (!selectedTopic || !currentRoadmapId) return;

        try {
            const result = await microLearningService.completeTopic(currentRoadmapId, selectedTopic.topic_id);

            // Update local state with result from server
            setProgress(prev => ({
                ...prev,
                completed_topic_ids: [...prev.completed_topic_ids, selectedTopic.topic_id],
                // We might need to refresh progress to get unlocked topics if the server logic is complex
                // But for now, let's assume result might return updated unlocked list or we re-fetch?
                total_progress_percentage: result.progress_percentage || prev.total_progress_percentage,
                streak: {
                    ...prev.streak,
                    current_streak: result.streak_days || prev.streak.current_streak
                }
            }));

            // Re-fetch progress to ensure consistency (especially for unlocked topics)
            const updatedProgress = await microLearningService.getUserProgress(currentRoadmapId);
            setProgress(updatedProgress);

            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);
            setSelectedTopic(null);

        } catch (error) {
            console.error("Error completing topic:", error);
            alert("Failed to complete topic. Please try again.");
        }
    };

    if (loading) return (
        <div className="micro-learning-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="loading">Loading Learning Path...</div>
        </div>
    );

    if (!progress || !milestones.length) return (
        <div className="micro-learning-page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div className="empty-state">No Micro-Learning content available for your current roadmap.</div>
            {/* Add a button to go back to roadmap or generate one */}
        </div>
    );

    return (
        <div className="micro-learning-page">
            {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}

            <header className="ml-header">
                <div className="header-content">
                    <h1>Learning Path</h1>
                    <p>Track your progress and master specific skills.</p>
                </div>

                <div className="ml-stats">
                    <div className="stat-card">
                        <div className="stat-icon-wrapper fire">
                            <Flame size={20} />
                        </div>
                        <div className="stat-info">
                            <span className="value">{progress.streak.current_streak} days</span>
                            <span className="label">Streak</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon-wrapper trophy">
                            <Trophy size={20} />
                        </div>
                        <div className="stat-info">
                            <span className="value">{progress.badges_earned.length}</span>
                            <span className="label">Badges</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon-wrapper chart">
                            <Target size={20} />
                        </div>
                        <div className="stat-info">
                            <span className="value">{progress.total_progress_percentage}%</span>
                            <span className="label">Mastery</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="roadmap-container">
                {milestones.map(milestone => {
                    // Logic to calculate progress within milestone
                    const total = milestone.topics.length;
                    const completed = milestone.topics.filter(t => progress.completed_topic_ids.includes(t.topic_id)).length;
                    const percent = Math.round((completed / total) * 100);

                    return (
                        <motion.div
                            key={milestone.milestone_id}
                            className="milestone-section"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="milestone-header">
                                <div className="milestone-info">
                                    <h3>{milestone.title}</h3>
                                    <span>{milestone.topics.length} Micro-lessons</span>
                                </div>
                                <div className="milestone-progress">
                                    <span className="progress-text">{percent}% Complete</span>
                                    <div className="progress-bar-bg">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="topic-grid">
                                {milestone.topics.map(topic => (
                                    <TopicCard
                                        key={topic.topic_id}
                                        topic={topic}
                                        status={getTopicStatus(topic.topic_id)}
                                        onClick={() => handleTopicClick(topic, milestone.milestone_id)}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            <AnimatePresence>
                {selectedTopic && (
                    <LearningModal
                        topic={selectedTopic}
                        onClose={() => setSelectedTopic(null)}
                        onComplete={handleTopicComplete}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default MicroLearning;
