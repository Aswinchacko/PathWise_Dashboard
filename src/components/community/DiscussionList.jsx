import { motion } from 'framer-motion';
import DiscussionCard from './DiscussionCard';

const DiscussionList = ({ discussions, setSelectedDiscussion }) => {
  if (discussions.length === 0) {
    return (
      <div className="empty-state">
        <h3>No discussions yet</h3>
        <p>Be the first to start a discussion in this category!</p>
      </div>
    );
  }

  return (
    <div className="discussions-list">
      {discussions.map((discussion, index) => (
        <motion.div
          key={discussion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => setSelectedDiscussion(discussion)}
        >
          <DiscussionCard discussion={discussion} />
        </motion.div>
      ))}
    </div>
  );
};

export default DiscussionList;
