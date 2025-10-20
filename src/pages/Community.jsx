import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus } from 'lucide-react';
import DiscussionList from '../components/community/DiscussionList';
import CreateDiscussionModal from '../components/community/CreateDiscussionModal';
import DiscussionDetailModal from '../components/community/DiscussionDetailModal';
import Sidebar from '../components/community/Sidebar';
import AuthChecker from '../components/AuthChecker';
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
    if (!newDiscussion.title.trim() || !newDiscussion.description.trim()) {
      alert('Please fill in both title and description');
      return;
    }

    try {
      const discussion = await discussionService.createDiscussion(newDiscussion);
      setDiscussions([discussion, ...discussions]);
      setNewDiscussion({ title: '', description: '', category: 'Web Development' });
      setShowCreateForm(false);
      alert('Question posted successfully!');
    } catch (err) {
      setError('Failed to create discussion');
      console.error('Error creating discussion:', err);
      alert('Failed to create question. Please make sure you are logged in.');
    }
  };

  const handleAddComment = async (discussionId) => {
    if (!newComment.trim()) return;

    try {
      const comment = await discussionService.addComment(discussionId, newComment);
      
      // Update discussions list
      const updatedDiscussions = discussions.map((d) =>
        d.id === discussionId
          ? { ...d, comments: [...(d.comments || []), comment], replies: (d.comments?.length || 0) + 1 }
          : d
      );
      setDiscussions(updatedDiscussions);
      
      // Update selected discussion in modal
      if (selectedDiscussion && selectedDiscussion.id === discussionId) {
        setSelectedDiscussion({
          ...selectedDiscussion,
          comments: [...(selectedDiscussion.comments || []), comment]
        });
      }
      
      setNewComment('');
    } catch (err) {
      setError('Failed to add comment');
      console.error('Error adding comment:', err);
      alert('Failed to add comment. Please make sure you are logged in.');
    }
  };

  const handleLikeDiscussion = async (discussionId) => {
    try {
      const result = await discussionService.likeDiscussion(discussionId);
      
      // Update discussions list
      const updatedDiscussions = discussions.map(d => 
        d.id === discussionId ? { ...d, likes: result.likes } : d
      );
      setDiscussions(updatedDiscussions);
      
      // Update selected discussion in modal
      if (selectedDiscussion && selectedDiscussion.id === discussionId) {
        setSelectedDiscussion({
          ...selectedDiscussion,
          likes: result.likes
        });
      }
    } catch (err) {
      setError('Failed to like discussion');
      console.error('Error liking discussion:', err);
      alert('Failed to vote. Please make sure you are logged in.');
    }
  };

  // No need for filtering since we're doing it on the backend
  const filteredDiscussions = discussions;

  return (
    <AuthChecker>
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
          <h1>All Questions</h1>
          <p>Connect with fellow learners, ask questions, and share knowledge</p>
          <div className="header-actions">
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search..." />
            </div>
            <button className="create-discussion-btn" onClick={() => setShowCreateForm(true)}>
              <Plus size={18} />
              Ask Question
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
    </AuthChecker>
  );
};

export default Community; 