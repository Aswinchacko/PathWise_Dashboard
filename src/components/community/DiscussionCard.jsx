import { MessageCircle, Users, Heart } from 'lucide-react';

const DiscussionCard = ({ discussion }) => (
  <div className="discussion-card">
    <div className="discussion-header">
      <h3>{discussion.title}</h3>
      <span className="category-tag">{discussion.category}</span>
    </div>
    <p className="discussion-description">{discussion.description}</p>
    <div className="discussion-meta">
      <div className="meta-item">
        <Users size={16} />
        <span>{discussion.author}</span>
      </div>
      <div className="meta-item">
        <MessageCircle size={16} />
        <span>{discussion.replies} replies</span>
      </div>
      <div className="meta-item">
        <Heart size={16} />
        <span>{discussion.likes}</span>
      </div>
    </div>
  </div>
);

export default DiscussionCard;
