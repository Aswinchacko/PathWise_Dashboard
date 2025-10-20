const DiscussionCard = ({ discussion }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCount = (count) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count;
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' mins ago';
    
    return 'just now';
  };

  const repliesCount = discussion.comments?.length || discussion.replies || 0;
  const hasAnswers = repliesCount > 0;

  return (
    <div className="discussion-card">
      <div className="discussion-stats">
        <div className={`stat-item ${discussion.likes > 0 ? 'has-votes' : ''}`}>
          <span className="stat-number">{formatCount(discussion.likes || 0)}</span>
          <span>votes</span>
        </div>
        <div className={`stat-item ${hasAnswers ? 'has-answers' : ''}`}>
          <span className="stat-number">{formatCount(repliesCount)}</span>
          <span>answers</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{formatCount(discussion.views || 0)}</span>
          <span>views</span>
        </div>
      </div>
      
      <div className="discussion-content">
        <h3 className="discussion-title">{discussion.title}</h3>
        <p className="discussion-description">{discussion.description}</p>
        
        <div className="discussion-tags">
          <span className="tag">{discussion.category}</span>
        </div>
        
        <div className="discussion-footer">
          <div className="discussion-meta">
            <div className="user-info">
              <div className="user-avatar">{getInitials(discussion.author)}</div>
              <span className="user-name">{discussion.author}</span>
            </div>
            <span>asked {getTimeAgo(discussion.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionCard;
