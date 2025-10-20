import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const DiscussionDetailModal = ({
  selectedDiscussion,
  setSelectedDiscussion,
  newComment,
  setNewComment,
  handleAddComment,
  handleLikeDiscussion,
}) => {
  const [voted, setVoted] = useState(false);
  
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
    if (interval > 1) return Math.floor(interval) + ' mins ago';
    
    return 'just now';
  };

  const handleVote = () => {
    if (!voted) {
      handleLikeDiscussion(selectedDiscussion.id);
      setVoted(true);
    }
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedDiscussion(null);
        }
      }}
    >
      <motion.div
        className="discussion-detail-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="modal-header">
          <h2>{selectedDiscussion.title}</h2>
          <button onClick={() => setSelectedDiscussion(null)}>×</button>
        </div>
        <div className="modal-body">
          <div className="discussion-detail-content">
            <div className="vote-section">
              <button className="vote-btn" onClick={handleVote} disabled={voted}>
                <ChevronUp size={20} />
              </button>
              <span className="vote-count">{selectedDiscussion.likes || 0}</span>
              <button className="vote-btn" disabled>
                <ChevronDown size={20} />
              </button>
            </div>
            
            <p className="discussion-detail-description">{selectedDiscussion.description}</p>
            
            <div className="discussion-tags">
              <span className="tag">{selectedDiscussion.category}</span>
            </div>
            
            <div className="discussion-detail-meta">
              <div className="user-info">
                <div className="user-avatar">{getInitials(selectedDiscussion.author)}</div>
                <span className="user-name">{selectedDiscussion.author}</span>
              </div>
              <span>asked {getTimeAgo(selectedDiscussion.createdAt)}</span>
              <span>{selectedDiscussion.views || 0} views</span>
            </div>
          </div>

          <div className="comments-section">
            <h3>{selectedDiscussion.comments?.length || 0} Answers</h3>
            {selectedDiscussion.comments?.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-date">
                    answered {getTimeAgo(comment.createdAt)}
                  </span>
                </div>
                <p>{comment.text}</p>
              </div>
            ))}

            <div className="add-comment">
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--so-black)' }}>
                Your Answer
              </h4>
              <textarea
                placeholder="Write your answer here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={6}
              />
              <button
                onClick={() => handleAddComment(selectedDiscussion.id)}
                disabled={!newComment.trim()}
              >
                Post Your Answer
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DiscussionDetailModal;
