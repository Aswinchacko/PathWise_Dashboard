import { motion } from 'framer-motion';

const DiscussionDetailModal = ({
  selectedDiscussion,
  setSelectedDiscussion,
  newComment,
  setNewComment,
  handleAddComment,
}) => (
  <motion.div
    className="modal-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      className="discussion-detail-modal"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <div className="modal-header">
        <h2>{selectedDiscussion.title}</h2>
        <button onClick={() => setSelectedDiscussion(null)}>×</button>
      </div>
      <div className="modal-body">
        <div className="discussion-content">
          <p>{selectedDiscussion.description}</p>
          <div className="discussion-meta">
            <span>By {selectedDiscussion.author}</span>
            <span>
              {new Date(selectedDiscussion.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="comments-section">
          <h3>Comments ({selectedDiscussion.comments.length})</h3>
          {selectedDiscussion.comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <span className="comment-author">{comment.author}</span>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p>{comment.text}</p>
            </div>
          ))}

          <div className="add-comment">
            <textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <button
              onClick={() => handleAddComment(selectedDiscussion.id)}
            >
              Post Comment
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

export default DiscussionDetailModal;
