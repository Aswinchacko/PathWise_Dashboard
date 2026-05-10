import { motion } from 'framer-motion';
import { X, Heart, MessageCircle, Layers, Send } from 'lucide-react';

const DiscussionDetailModal = ({
  selectedDiscussion,
  setSelectedDiscussion,
  newComment,
  setNewComment,
  handleAddComment,
  handleLikeDiscussion,
}) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';

    return 'just now';
  };

  const liked = !!selectedDiscussion.likedByMe;

  const handleLike = () => {
    if (liked) return;
    handleLikeDiscussion(selectedDiscussion.id);
  };

  const close = () => setSelectedDiscussion(null);

  const answerCount = selectedDiscussion.comments?.length || 0;

  return (
    <motion.div
      className="modal-overlay ddm-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <motion.div
        className="discussion-detail-modal ddm-shell"
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ddm-header">
          <div className="ddm-header__accent" aria-hidden />
          <div className="ddm-header__row">
            <div className="ddm-header__main">
              <h2 id="ddm-title" className="ddm-title">
                {selectedDiscussion.title}
              </h2>
              <div className="ddm-header__meta">
                <span className="ddm-pill">
                  <Layers size={14} strokeWidth={2} aria-hidden />
                  {selectedDiscussion.category}
                </span>
                <span className="ddm-header__dot">·</span>
                <span>{selectedDiscussion.views ?? 0} views</span>
              </div>
            </div>
            <button type="button" className="ddm-close" onClick={close} aria-label="Close">
              <X size={22} strokeWidth={1.75} />
            </button>
          </div>
        </header>

        <div className="ddm-scroll" role="region" aria-labelledby="ddm-title">
          <div className="ddm-post">
            <aside className="ddm-like-rail" aria-label="Reactions">
              <button
                type="button"
                className={`ddm-like-btn ${liked ? 'ddm-like-btn--on' : ''}`}
                onClick={handleLike}
                disabled={liked}
                aria-pressed={liked}
                aria-label={liked ? 'You liked this post' : 'Like this post'}
              >
                <Heart size={22} strokeWidth={1.75} fill={liked ? 'currentColor' : 'none'} />
              </button>
              <span className="ddm-like-count">{selectedDiscussion.likes ?? 0}</span>
              <span className="ddm-like-hint">{liked ? 'Liked' : 'Like'}</span>
            </aside>

            <div className="ddm-post-body">
              <p className="ddm-body-text">{selectedDiscussion.description}</p>

              <div className="ddm-author-card">
                <div className="ddm-author-card__avatar">{getInitials(selectedDiscussion.author)}</div>
                <div>
                  <div className="ddm-author-card__name">{selectedDiscussion.author}</div>
                  <div className="ddm-author-card__meta">
                    Asked {getTimeAgo(selectedDiscussion.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="ddm-answers" aria-label="Answers">
            <div className="ddm-answers__head">
              <MessageCircle size={18} strokeWidth={1.75} className="ddm-answers__icon" aria-hidden />
              <h3>
                {answerCount} {answerCount === 1 ? 'answer' : 'answers'}
              </h3>
            </div>

            {answerCount === 0 ? (
              <p className="ddm-answers__empty">No answers yet — be the first to help.</p>
            ) : (
              <ul className="ddm-answer-list">
                {selectedDiscussion.comments?.map((comment) => (
                  <li key={comment.id || comment._id} className="ddm-answer-card">
                    <div className="ddm-answer-card__top">
                      <span className="ddm-answer-card__author">{comment.author}</span>
                      <time className="ddm-answer-card__time" dateTime={comment.createdAt}>
                        {getTimeAgo(comment.createdAt)}
                      </time>
                    </div>
                    <p className="ddm-answer-card__text">{comment.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="ddm-compose">
            <label htmlFor="ddm-answer-input" className="ddm-compose__label">
              Your answer
            </label>
            <textarea
              id="ddm-answer-input"
              className="ddm-textarea"
              placeholder="Share what worked for you, links, or follow-up questions…"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
            />
            <div className="ddm-compose__actions">
              <button
                type="button"
                className="ddm-btn ddm-btn--ghost"
                onClick={() => setNewComment('')}
                disabled={!newComment.trim()}
              >
                Clear
              </button>
              <button
                type="button"
                className="ddm-btn ddm-btn--primary"
                onClick={() => handleAddComment(selectedDiscussion.id)}
                disabled={!newComment.trim()}
              >
                <Send size={16} strokeWidth={2} aria-hidden />
                Post answer
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DiscussionDetailModal;
