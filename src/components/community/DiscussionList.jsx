import { motion } from 'framer-motion';
import DiscussionCard from './DiscussionCard';

const DiscussionList = ({ discussions, setSelectedDiscussion }) => (
  <div className="discussions-grid">
    {discussions.map((discussion, index) => (
      <motion.div
        key={discussion.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        onClick={() => setSelectedDiscussion(discussion)}
      >
        <DiscussionCard discussion={discussion} />
      </motion.div>
    ))}
  </div>
);

export default DiscussionList;
