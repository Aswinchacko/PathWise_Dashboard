import { motion } from 'framer-motion';
import DiscussionCard from './DiscussionCard';

const DiscussionList = ({ discussions, setSelectedDiscussion, onLikeDiscussion, onShareDiscussion }) => {
  if (discussions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__illu" aria-hidden>
          <span />
        </div>
        <h3 className="empty-state__title">No posts in this feed yet</h3>
        <p className="empty-state__text">Switch category or ask the first question — the community is listening.</p>
      </div>
    );
  }

  return (
    <div className="discussions-feed">
      <div className="discussions-feed__label">
        <span>Latest</span>
        <span className="discussions-feed__count">{discussions.length} in view</span>
      </div>
      <div className="discussions-list">
        {discussions.map((discussion, index) => (
          <motion.div
            key={discussion.id}
            className="discussion-card-wrap"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setSelectedDiscussion(discussion)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedDiscussion(discussion);
              }
            }}
          >
            <DiscussionCard
              discussion={discussion}
              onLike={onLikeDiscussion}
              onShare={onShareDiscussion}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DiscussionList;
