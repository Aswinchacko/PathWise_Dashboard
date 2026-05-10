import { useState, useEffect } from 'react';
import { Search, Plus, Sparkles, Users } from 'lucide-react';
import DiscussionList from '../components/community/DiscussionList';
import CreateDiscussionModal from '../components/community/CreateDiscussionModal';
import DiscussionDetailModal from '../components/community/DiscussionDetailModal';
import SuccessModal from '../components/community/SuccessModal';
import Sidebar from '../components/community/Sidebar';
import AuthChecker from '../components/AuthChecker';
import discussionService from '../services/discussionService';
import './Community.css';

const Community = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
      setSuccessMessage('Please fill in both title and description');
      setShowSuccessModal(true);
      return;
    }

    try {
      const discussion = await discussionService.createDiscussion(newDiscussion);
      setDiscussions([discussion, ...discussions]);
      setNewDiscussion({ title: '', description: '', category: 'Web Development' });
      setShowCreateForm(false);
      setSuccessMessage('Question posted successfully!');
      setShowSuccessModal(true);
    } catch (err) {
      setError('Failed to create discussion');
      console.error('Error creating discussion:', err);
      setSuccessMessage('Failed to create question. Please make sure you are logged in.');
      setShowSuccessModal(true);
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
      setSuccessMessage('Comment added successfully!');
      setShowSuccessModal(true);
    } catch (err) {
      setError('Failed to add comment');
      console.error('Error adding comment:', err);
      setSuccessMessage('Failed to add comment. Please make sure you are logged in.');
      setShowSuccessModal(true);
    }
  };

  const handleShareDiscussion = async (discussionId) => {
    const text = `${window.location.origin}/community#post-${discussionId}`;
    try {
      await navigator.clipboard.writeText(text);
      setSuccessMessage('Link copied — share it anywhere.');
      setShowSuccessModal(true);
    } catch {
      setSuccessMessage('Could not copy link.');
      setShowSuccessModal(true);
    }
  };

  const handleLikeDiscussion = async (discussionId) => {
    const sid = String(discussionId);
    const fromList = discussions.find((d) => String(d.id) === sid);
    const fromModal =
      selectedDiscussion && String(selectedDiscussion.id) === sid ? selectedDiscussion : null;
    if (fromList?.likedByMe || fromModal?.likedByMe) return;

    try {
      const result = await discussionService.likeDiscussion(discussionId);

      const patch = { likes: result.likes, likedByMe: true };
      setDiscussions((prev) =>
        prev.map((d) => (String(d.id) === sid ? { ...d, ...patch } : d))
      );

      if (selectedDiscussion && String(selectedDiscussion.id) === sid) {
        setSelectedDiscussion({ ...selectedDiscussion, ...patch });
      }
    } catch (err) {
      setError('Failed to like discussion');
      console.error('Error liking discussion:', err);
      setSuccessMessage('Failed to vote. Please make sure you are logged in.');
      setShowSuccessModal(true);
    }
  };

  // Filter discussions based on search query
  const filteredDiscussions = discussions.filter(discussion => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      discussion.title.toLowerCase().includes(query) ||
      discussion.description.toLowerCase().includes(query) ||
      discussion.category.toLowerCase().includes(query)
    );
  });

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

        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message={successMessage}
          title={successMessage.includes('successfully') ? "Success!" : "Notice"}
        />

        <header className="community-header">
          <div className="community-header__inner">
            <div className="community-header__intro">
              <p className="community-header__eyebrow">PathWise network</p>
              <h1>Community</h1>
              <p className="community-header__tagline">
                Questions, threads, and peer support — one calm, focused feed.
              </p>
            </div>
            <div className="header-actions">
              <div className="search-bar">
                <Search size={18} strokeWidth={1.75} />
                <input
                  type="search"
                  placeholder="Search posts, topics, people…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <button type="button" className="create-discussion-btn" onClick={() => setShowCreateForm(true)}>
                <Plus size={18} strokeWidth={2} />
                New post
              </button>
            </div>
          </div>
        </header>

        <div className="community-body">
          <Sidebar
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          <div className="community-main">
            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Loading your feed…</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
                <button type="button" onClick={fetchDiscussions} className="retry-btn">
                  Try again
                </button>
              </div>
            ) : (
              <DiscussionList
                discussions={filteredDiscussions}
                setSelectedDiscussion={setSelectedDiscussion}
                onLikeDiscussion={handleLikeDiscussion}
                onShareDiscussion={handleShareDiscussion}
              />
            )}
          </div>

          <aside className="community-aside" aria-label="Community highlights">
            <div className="aside-card">
              <div className="aside-card__icon">
                <Sparkles size={20} strokeWidth={1.75} />
              </div>
              <h3>Quality over noise</h3>
              <p>
                Thoughtful questions get better answers. Add context and what you have already tried.
              </p>
            </div>
            <div className="aside-card aside-card--muted">
              <div className="aside-card__icon aside-card__icon--soft">
                <Users size={20} strokeWidth={1.75} />
              </div>
              <h3>Grow with peers</h3>
              <p>Like posts you find useful — it helps others discover strong threads.</p>
            </div>
          </aside>
        </div>
      </div>
    </AuthChecker>
  );
};

export default Community; 