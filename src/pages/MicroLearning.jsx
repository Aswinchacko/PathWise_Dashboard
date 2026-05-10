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
    Zap,
    ChevronLeft,
    ChevronRight,
    Star,
    Share2,
    BookOpen
} from 'lucide-react';
import Confetti from 'react-confetti';
import microLearningService, { roadmapStepsToMicroMilestones } from '../services/microLearningService';
import authService from '../services/authService';
import { Link } from 'react-router-dom';
import roadmapService from '../services/roadmapService';
import './MicroLearning.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';

const TopicCard = ({ topic, status, onClick }) => {
    const isLocked = status === 'locked';
    const isCompleted = status === 'completed';
    const isReady = status === 'unlocked' || status === 'ready';

    return (
        <motion.div
            className={`topic-card ${status}`}
            onClick={() => !isLocked && onClick(topic)}
            whileHover={!isLocked ? { scale: 1.03, y: -5 } : {}}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <div className="card-bg-pattern"></div>
            <div className="topic-header">
                <div className={`status-badge ${status}`}>
                    {isCompleted ? <CheckCircle size={14} /> : isLocked ? <Lock size={14} /> : <Zap size={14} />}
                    <span>{isCompleted ? 'Mastered' : isLocked ? 'Locked' : 'Ready'}</span>
                </div>
                {isCompleted && <div className="stars"><Star size={12} fill="#fbbf24" stroke="#fbbf24" /><Star size={12} fill="#fbbf24" stroke="#fbbf24" /><Star size={12} fill="#fbbf24" stroke="#fbbf24" /></div>}
            </div>

            <div className="topic-content">
                <h4>{topic.title.replace("Error Generating: ", "")}</h4>
                <div className="topic-meta-row">
                    <div className="meta-item">
                        <Clock size={14} />
                        <span>{topic.estimated_duration_minutes || 5} min</span>
                    </div>
                </div>
            </div>

            <div className="topic-action">
                {isLocked ? (
                    <span className="locked-text">Complete previous to unlock</span>
                ) : (
                    <button className="play-btn">
                        {isCompleted ? 'Review' : 'Start Learning'}
                    </button>
                )}
            </div>
        </motion.div >
    );
};

const SlideContent = ({ slide }) => (
    <div className="slide-content">
        <h3 className="slide-title">{slide.title}</h3>
        <div className="slide-body markdown-body">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    code: ({ node, inline, className, children, ...props }) => {
                        return !inline ? (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        ) : (
                            <code className="inline-code" {...props}>
                                {children}
                            </code>
                        )
                    }
                }}
            >
                {slide.content}
            </ReactMarkdown>
        </div>
    </div>
);

const LearningModal = ({ topic, onClose, onComplete }) => {
    const [loading, setLoading] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Prepare slides: use backend slides or fallback to chunking short_explanation
    const slides = topic.slides && topic.slides.length > 0
        ? topic.slides
        : [{ title: "Overview", content: topic.short_explanation || "No content available." }];

    // If we have key points, add them as a final summary slide
    const hasKeyPoints = topic.key_points && topic.key_points.length > 0;
    const totalSlides = slides.length + (hasKeyPoints ? 1 : 0) + (topic.challenge ? 1 : 0);

    const handleNext = () => {
        if (currentSlide < totalSlides - 1) {
            setCurrentSlide(curr => curr + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide(curr => curr - 1);
        }
    };

    const handleComplete = async () => {
        setLoading(true);
        await onComplete();
        setLoading(false);
    };

    // Render logic for different "types" of slides constructed on the fly
    const renderCurrentSlide = () => {
        if (loading) return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Saving progress...</p>
            </div>
        );

        if (topic.isLoading) return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>AI is crafting your personalized lesson...</p>
            </div>
        );

        // Standard Content Slides
        if (currentSlide < slides.length) {
            return <SlideContent slide={slides[currentSlide]} />;
        }

        // Key Points Slide
        if (hasKeyPoints && currentSlide === slides.length) {
            return (
                <div className="slide-content summary-slide">
                    <h3>🔑 Key Takeaways</h3>
                    <ul className="key-points-list">
                        {topic.key_points.map((point, index) => (
                            <motion.li
                                key={index}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <CheckCircle size={16} className="point-icon" />
                                {point}
                            </motion.li>
                        ))}
                    </ul>
                </div>
            );
        }

        // Challenge/Final Slide
        return (
            <div className="slide-content challenge-slide">
                <div className="challenge-icon-wrapper">
                    <Trophy size={48} />
                </div>
                <h3>Ready to Level Up?</h3>
                <p className="challenge-text">{topic.challenge}</p>
                <div className="example-box">
                    <h4>Example Output:</h4>
                    <pre>{topic.example || "No example provided."}</pre>
                </div>
                <button className="complete-action-btn" onClick={handleComplete} disabled={loading}>
                    {loading ? 'Completing...' : 'Complete & Collect XP'}
                </button>
            </div>
        );
    };

    return (
        <div className="learning-modal-overlay">
            <motion.div
                className="learning-card-social"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
            >
                <div className="social-header">
                    <div className="author-info">
                        <div className="avatar">AI</div>
                        <div className="names">
                            <span className="name">PathWise Mentor</span>
                            <span className="handle">@ai_tutor • {topic.title}</span>
                        </div>
                    </div>
                    <button className="close-btn-social" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="social-body">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentSlide}
                            className="slide-container"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderCurrentSlide()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {!topic.isLoading && !loading && (
                    <div className="social-footer">
                        <div className="progress-dots">
                            {Array.from({ length: totalSlides }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`dot ${idx === currentSlide ? 'active' : ''}`}
                                    onClick={() => setCurrentSlide(idx)}
                                />
                            ))}
                        </div>
                        <div className="nav-controls">
                            <button
                                className="nav-btn"
                                onClick={handlePrev}
                                disabled={currentSlide === 0}
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                className="nav-btn primary"
                                onClick={handleNext}
                            >
                                {currentSlide === totalSlides - 1 ? 'Finish' : <ChevronRight size={24} />}
                            </button>
                        </div>
                    </div>
                )}
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
    /** Why the empty state: service down, no id, stale id, or no skills in roadmap */
    const [emptyHint, setEmptyHint] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const loadStructureAndProgress = async (roadmapId) => {
            const structureRes = await microLearningService.getRoadmapStructure(roadmapId);
            const list = structureRes.milestones || [];
            if (!list.length) return { milestones: [], progress: null };
            const progressRes = await microLearningService.getUserProgress(roadmapId);
            return { milestones: list, progress: progressRes };
        };

        const fetchData = async () => {
            try {
                setLoading(true);
                setEmptyHint(null);
                const currentUser = authService.getCurrentUser();
                setUser(currentUser);
                if (!currentUser) {
                    setLoading(false);
                    return;
                }

                let roadmapId = null;
                const savedGoal = localStorage.getItem('current_goal');
                if (savedGoal) {
                    try {
                        roadmapId = JSON.parse(savedGoal).roadmapId;
                    } catch (e) { /* ignore */ }
                }

                if (!roadmapId) {
                    const latest = await roadmapService.getLatestRoadmap();
                    if (latest) roadmapId = latest.id;
                }

                if (!roadmapId) {
                    if (!cancelled) setEmptyHint('no_roadmap');
                    return;
                }

                if (!cancelled) setCurrentRoadmapId(roadmapId);

                try {
                    const { milestones: ms, progress: pr } = await loadStructureAndProgress(roadmapId);
                    if (!cancelled) {
                        setMilestones(ms);
                        setProgress(pr);
                    }
                    return;
                } catch (err) {
                    const status = err.response?.status;
                    const isNoStructure =
                        status === 404 ||
                        (typeof err.response?.data?.detail === 'string' &&
                            err.response.data.detail.includes('Roadmap structure'));

                    if (!isNoStructure) {
                        console.error('Micro-learning load failed:', err);
                        if (!cancelled) setEmptyHint('service');
                        return;
                    }

                    const { roadmaps = [] } = await roadmapService.getUserRoadmaps(currentUser.id);
                    const roadmap = roadmaps.find(
                        (r) => String(r.id) === String(roadmapId) || String(r._id) === String(roadmapId)
                    );

                    if (!roadmap) {
                        if (!cancelled) setEmptyHint('stale_roadmap');
                        return;
                    }

                    const payload = roadmapStepsToMicroMilestones(roadmap.steps);
                    if (!payload.length) {
                        if (!cancelled) setEmptyHint('no_steps');
                        return;
                    }

                    try {
                        await microLearningService.initializeStructure(roadmapId, payload);
                    } catch (initErr) {
                        console.error('initialize-structure failed:', initErr);
                        if (!cancelled) setEmptyHint('service');
                        return;
                    }

                    try {
                        const { milestones: ms2, progress: pr2 } = await loadStructureAndProgress(roadmapId);
                        if (!cancelled) {
                            setMilestones(ms2);
                            setProgress(pr2);
                        }
                    } catch (e2) {
                        console.error('Micro-learning reload after init failed:', e2);
                        if (!cancelled) setEmptyHint('service');
                    }
                }
            } catch (error) {
                console.error('Failed to load micro-learning', error);
                if (!cancelled) setEmptyHint('service');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchData();
        return () => {
            cancelled = true;
        };
    }, []);

    const getTopicStatus = (topicId) => {
        if (!progress) return 'locked';
        if (progress.completed_topic_ids.includes(topicId)) return 'completed';
        if (progress.unlocked_topic_ids.includes(topicId)) return 'unlocked';
        return 'locked';
    };

    const handleTopicClick = async (topic, milestoneId) => {
        let topicToDisplay = topic;
        const isError = topic.title.startsWith("Error Generating") ||
            (topic.short_explanation && topic.short_explanation.includes("encountered an error"));

        // Trigger generation if: 1. Error, 2. No content, 3. No slides (for new format)
        const needsGeneration = !topic.short_explanation || topic.short_explanation.length < 5 || isError || (!topic.slides && !topic.short_explanation);

        if (needsGeneration) {
            const loadingTopic = { ...topic, isLoading: true };
            setSelectedTopic(loadingTopic);

            try {
                const generatedContent = await microLearningService.generateContent({
                    title: isError ? topic.title.replace("Error Generating: ", "") : topic.title,
                    context: `Part of roadmap milestone: ${milestoneId}`,
                    difficulty: "Beginner",
                    roadmap_id: currentRoadmapId,
                    milestone_id: milestoneId,
                    topic_id: topic.topic_id
                });

                topicToDisplay = { ...generatedContent, topic_id: topic.topic_id };
                setMilestones(prev => prev.map(m => {
                    if (m.milestone_id === milestoneId) {
                        return { ...m, topics: m.topics.map(t => t.topic_id === topic.topic_id ? topicToDisplay : t) };
                    }
                    return m;
                }));
            } catch (error) {
                alert("Failed to generate content.");
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
            setProgress(prev => ({
                ...prev,
                completed_topic_ids: [...prev.completed_topic_ids, selectedTopic.topic_id],
                total_progress_percentage: result.progress_percentage || prev.total_progress_percentage,
                streak: { ...prev.streak, current_streak: result.streak_days || prev.streak.current_streak }
            }));
            const updatedProgress = await microLearningService.getUserProgress(currentRoadmapId); // Refresh unlocked
            setProgress(updatedProgress);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);
            setSelectedTopic(null);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Loading your journey...</p></div>;
    if (!progress || !milestones.length) {
        const hints = {
            service: {
                title: 'Micro-learning service unavailable',
                body: 'Nothing answered on port 8008. Start the gamified API (same port as Docker): from repo root `docker compose up microlearning-service`, or `cd gamified_micro_learning` with PORT=8008 in `.env`, then `python -m uvicorn app.main:app --host 127.0.0.1 --port 8008 --reload`. Resume-parser uses 8005 (local + docker-compose) — keep micro-learning on 8008.',
            },
            stale_roadmap: {
                title: 'Roadmap ID not found for your account',
                body: 'Your browser still points at an old roadmap. Open your Python (or other) roadmap on the Roadmap page once so it syncs, then return here.',
            },
            no_steps: {
                title: 'Roadmap has no skills to turn into topics',
                body: 'This saved roadmap has empty steps. Regenerate or pick another roadmap on the Roadmap page.',
            },
            no_roadmap: {
                title: 'No roadmap selected',
                body: 'Generate or open a roadmap first. Micro-Learning reuses that plan as bite-sized cards.',
            },
            default: {
                title: 'No learning path here yet',
                body: 'This page is the practice view (short lessons and streaks). If you already have a roadmap, we try to build micro-topics automatically when the gamified service is reachable (see VITE_MICROLEARNING_API_URL).',
            },
        };
        const h = hints[emptyHint] || hints.default;

        return (
            <div className="empty-state micro-learning-empty">
                <BookOpen size={40} className="empty-state-icon" aria-hidden />
                <h2 className="empty-state-title">{h.title}</h2>
                <p className="empty-state-copy">{h.body}</p>
                <div className="empty-state-actions">
                    <Link to="/roadmap" className="empty-state-cta">
                        Go to Roadmap
                    </Link>
                    {emptyHint === 'service' && (
                        <button
                            type="button"
                            className="empty-state-secondary"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="micro-learning-page">
            {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}

            <header className="gamified-header">
                <div className="header-left">
                    <h1>Agile Learner</h1>
                    <p>Level up your skills, one card at a time.</p>
                </div>
                <div className="stats-container">
                    <div className="stat-pill fire">
                        <Flame size={18} />
                        <span>{progress.streak.current_streak} Day Streak</span>
                    </div>
                    <div className="stat-pill xp">
                        <Zap size={18} />
                        <span>{Math.round(progress.total_progress_percentage * 10)} XP</span>
                    </div>
                    <div className="stat-pill mastery">
                        <Target size={18} />
                        <span>{Math.round(progress.total_progress_percentage)}% Mastery</span>
                    </div>
                </div>
            </header>

            <div className="path-container">
                {milestones.map((milestone, mIndex) => {
                    const completedCount = milestone.topics.filter(t => progress.completed_topic_ids.includes(t.topic_id)).length;
                    const totalCount = milestone.topics.length;
                    const isMilestoneComplete = completedCount === totalCount;

                    return (
                        <div key={milestone.milestone_id} className="level-section">
                            <div className="level-marker">
                                <div className={`marker-circle ${isMilestoneComplete ? 'completed' : 'active'}`}>
                                    {mIndex + 1}
                                </div>
                                <div className="level-line"></div>
                            </div>

                            <div className="level-content">
                                <div className="level-header">
                                    <h3>{milestone.title}</h3>
                                    <div className="level-progress">
                                        <div className="mini-bar">
                                            <div className="mini-fill" style={{ width: `${(completedCount / totalCount) * 100}%` }}></div>
                                        </div>
                                        <span>{completedCount}/{totalCount}</span>
                                    </div>
                                </div>

                                <div className="cards-grid">
                                    {milestone.topics.map((topic, tIndex) => (
                                        <TopicCard
                                            key={topic.topic_id}
                                            topic={topic}
                                            status={getTopicStatus(topic.topic_id)}
                                            onClick={() => handleTopicClick(topic, milestone.milestone_id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
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
