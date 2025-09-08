import { motion } from 'framer-motion';

const CreateDiscussionModal = ({
  newDiscussion,
  setNewDiscussion,
  handleCreateDiscussion,
  setShowCreateForm,
  categories,
}) => (
  <motion.div
    className="modal-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="create-discussion-modal"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <div className="modal-header">
        <h2>Create New Discussion</h2>
        <button onClick={() => setShowCreateForm(false)}>×</button>
      </div>
      <div className="modal-body">
        <input
          type="text"
          placeholder="Discussion title"
          value={newDiscussion.title}
          onChange={(e) =>
            setNewDiscussion({ ...newDiscussion, title: e.target.value })
          }
        />
        <select
          value={newDiscussion.category}
          onChange={(e) =>
            setNewDiscussion({ ...newDiscussion, category: e.target.value })
          }
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Describe your discussion..."
          value={newDiscussion.description}
          onChange={(e) =>
            setNewDiscussion({ ...newDiscussion, description: e.target.value })
          }
          rows={4}
        />
        <div className="modal-actions">
          <button onClick={() => setShowCreateForm(false)}>Cancel</button>
          <button onClick={handleCreateDiscussion} className="primary">
            Create
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

export default CreateDiscussionModal;
