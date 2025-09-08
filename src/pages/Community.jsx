import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus } from 'lucide-react';
import DiscussionList from '../components/community/DiscussionList';
import CreateDiscussionModal from '../components/community/CreateDiscussionModal';
import DiscussionDetailModal from '../components/community/DiscussionDetailModal';
import Sidebar from '../components/community/Sidebar';
import discussionService from '../services/discussionService';
import './Community.css';

const Community = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    description: '',
    category: 'Web Development',
  });
  const [newComment, setNewComment] = useState('');

  const categories = ['Web Development', 'Data Science', 'Career Advice', 'Development', 'Mobile Development', 'DevOps'];

  // Fetch discussions on component mount and when category changes
  useEffect(() => {
    fetchDiscussions();
  }, [selectedCategory]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await discussionService.getDiscussions(selectedCategory);
      setDiscussions(data);
    } catch (err) {
      setError('Failed to load discussions');
      console.error('Error fetching discussions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async () => {
    if (!newDiscussion.title.trim() || !newDiscussion.description.trim()) return;

    try {
      const discussion = await discussionService.createDiscussion(newDiscussion);
      setDiscussions([discussion, ...discussions]);
      setNewDiscussion({ title: '', description: '', category: 'Web Development' });
      setShowCreateForm(false);
    } catch (err) {
      setError('Failed to create discussion');
      console.error('Error creating discussion:', err);
    }
  };

  const handleAddComment = async (discussionId) => {
    if (!newComment.trim()) return;

    try {
      const comment = await discussionService.addComment(discussionId, newComment);
      
      setDiscussions(
        discussions.map((d) =>
          d.id === discussionId
            ? { ...d, comments: [...d.comments, comment], replies: d.comments.length + 1 }
            : d
        )
      );
      setNewComment('');
    } catch (err) {
      setError('Failed to add comment');
      console.error('Error adding comment:', err);
    }
  };

  const handleLikeDiscussion = async (discussionId) => {
    try {
      const result = await discussionService.likeDiscussion(discussionId);
      setDiscussions(discussions.map(d => 
        d.id === discussionId ? { ...d, likes: result.likes } : d
      ));
    } catch (err) {
      setError('Failed to like discussion');
      console.error('Error liking discussion:', err);
    }
  };

  // No need for filtering since we're doing it on the backend
  const filteredDiscussions = discussions;

  return (
    <div className="community-page">
      {showCreateForm && (
        <CreateDiscussionModal
          newDiscussion={newDiscussion}
          setNewDiscussion={setNewDiscussion}
          handleCreateDiscussion={handleCreateDiscussion}
          setShowCreateForm={setShowCreateForm}
          categories={categories}
        />
      )}

      {selectedDiscussion && (
        <DiscussionDetailModal
          selectedDiscussion={selectedDiscussion}
          setSelectedDiscussion={setSelectedDiscussion}
          newComment={newComment}
          setNewComment={setNewComment}
          handleAddComment={handleAddComment}
          handleLikeDiscussion={handleLikeDiscussion}
        />
      )}

      <header className="community-header">
        <h1>Community Discussion</h1>
        <p>Connect with fellow learners and share knowledge</p>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={20} />
            <input type="text" placeholder="Search topics..." />
          </div>
          <button className="create-discussion-btn" onClick={() => setShowCreateForm(true)}>
            <Plus size={20} />
            New Discussion
          </button>
        </div>
      </header>

      <div className="community-body">
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <main className="community-main">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading discussions...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchDiscussions} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : (
            <DiscussionList
              discussions={filteredDiscussions}
              setSelectedDiscussion={setSelectedDiscussion}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Community; 