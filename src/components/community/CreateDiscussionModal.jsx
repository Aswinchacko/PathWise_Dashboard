import { motion } from 'framer-motion';

const CreateDiscussionModal = ({
  newDiscussion,
  setNewDiscussion,
  handleCreateDiscussion,
  setShowCreateForm,
  categories,
}) => {
  const isValid = newDiscussion.title.trim() && newDiscussion.description.trim();

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowCreateForm(false);
        }
      }}
    >
      <motion.div
        className="create-discussion-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="modal-header">
          <h2>Ask a Question</h2>
          <button onClick={() => setShowCreateForm(false)}>×</button>
        </div>
        <div className="modal-body">
          <div>
            <label>Title</label>
            <input
              type="text"
              placeholder="e.g. How do I implement authentication in React?"
              value={newDiscussion.title}
              onChange={(e) =>
                setNewDiscussion({ ...newDiscussion, title: e.target.value })
              }
            />
          </div>
          
          <div>
            <label>Category</label>
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
          </div>
          
          <div>
            <label>Description</label>
            <textarea
              placeholder="Include all the information someone would need to answer your question..."
              value={newDiscussion.description}
              onChange={(e) =>
                setNewDiscussion({ ...newDiscussion, description: e.target.value })
              }
              rows={8}
            />
          </div>
          
          <div className="modal-actions">
            <button onClick={() => setShowCreateForm(false)}>Cancel</button>
            <button 
              onClick={handleCreateDiscussion} 
              className="primary"
              disabled={!isValid}
            >
              Post Your Question
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateDiscussionModal;
