import { Heart, MessageCircle, Share2, Bookmark, Layers } from 'lucide-react';

const DiscussionCard = ({ discussion, onLike, onShare }) => {
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
    return String(count ?? 0);
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y ago';

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo ago';

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm ago';

    return 'now';
  };

  const slugify = (name) =>
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 32) || 'member';

  const repliesCount = discussion.comments?.length || discussion.replies || 0;

  const handleLike = (e) => {
    e.stopPropagation();
    if (discussion.likedByMe) return;
    onLike?.(discussion.id);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    onShare?.(discussion.id);
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
  };

  return (
    <article className="discussion-card">
      <div className="discussion-card__head">
        <div className="discussion-card__identity">
          <div className="user-avatar" aria-hidden>
            {getInitials(discussion.author || 'Member')}
          </div>
          <div className="discussion-card__who">
            <div className="user-name">{discussion.author || 'Community member'}</div>
            <div className="discussion-card__meta">
              <span className="discussion-card__handle">@{slugify(discussion.author || 'member')}</span>
              <span className="discussion-card__dot">·</span>
              <time dateTime={discussion.createdAt}>{getTimeAgo(discussion.createdAt)}</time>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="discussion-card__icon-btn"
          aria-label="Save"
          onClick={handleBookmark}
        >
          <Bookmark size={20} strokeWidth={1.75} />
        </button>
      </div>

      <h3 className="discussion-title">{discussion.title}</h3>
      <p className="discussion-description">{discussion.description}</p>

      <div className="discussion-preview">
        <div className="discussion-preview__icon" aria-hidden>
          <Layers size={18} strokeWidth={2} />
        </div>
        <div className="discussion-preview__text">
          <div className="discussion-preview__title">{discussion.category}</div>
          <div className="discussion-preview__sub">Discussion topic · PathWise</div>
        </div>
      </div>

      <div className="discussion-card__engagement">
        <button
          type="button"
          className={`engagement-cell ${discussion.likedByMe ? 'engagement-cell--liked' : ''}`}
          onClick={handleLike}
          aria-label={discussion.likedByMe ? 'Already liked' : 'Like'}
          aria-pressed={discussion.likedByMe}
          disabled={discussion.likedByMe}
        >
          <Heart
            size={18}
            strokeWidth={1.75}
            className="engagement-cell__heart"
            fill={discussion.likedByMe ? 'currentColor' : 'none'}
          />
          <span>{formatCount(discussion.likes || 0)}</span>
        </button>
        <div className="engagement-cell engagement-cell--static" aria-hidden>
          <MessageCircle size={18} strokeWidth={1.75} />
          <span>{formatCount(repliesCount)}</span>
        </div>
        <button type="button" className="engagement-cell" onClick={handleShare} aria-label="Share">
          <Share2 size={18} strokeWidth={1.75} />
          <span>Share</span>
        </button>
      </div>
    </article>
  );
};

export default DiscussionCard;
