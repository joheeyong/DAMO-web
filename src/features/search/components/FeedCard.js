import { analytics, logEvent } from '../../../core/firebase';
import './FeedCard.css';

const PLATFORM_LABELS = {
  youtube: { label: 'YouTube', color: '#ff0000' },
  blog: { label: '블로그', color: '#03c75a' },
  news: { label: '뉴스', color: '#4a90d9' },
  cafe: { label: '카페', color: '#03c75a' },
  shop: { label: '쇼핑', color: '#00b493' },
  image: { label: '이미지', color: '#a855f7' },
  kin: { label: '지식iN', color: '#03c75a' },
  book: { label: '도서', color: '#f59e0b' },
  webkr: { label: '웹', color: '#6b7280' },
};

function FeedCard({ item }) {
  const platform = PLATFORM_LABELS[item.platform] || { label: item.platform, color: '#6b7280' };
  const isYoutube = item.platform === 'youtube';
  const isShop = item.platform === 'shop';
  const isBook = item.platform === 'book';
  const hasImage = !!item.image;

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`feed-card ${isYoutube ? 'feed-card-youtube' : ''}`}
      onClick={() => logEvent(analytics, 'select_content', {
        content_type: item.platform,
        item_id: item.id,
      })}
    >
      {isYoutube && hasImage && (
        <div className="feed-thumbnail-wrap">
          <img src={item.image} alt="" className="feed-thumbnail" />
          <div className="feed-play-icon">&#9654;</div>
        </div>
      )}

      {!isYoutube && hasImage && (
        <div className="feed-card-body">
          <img
            src={item.image}
            alt=""
            className={`feed-image ${isBook ? 'feed-image-book' : ''}`}
          />
          <div className="feed-text">
            <div className="feed-badge" style={{ background: platform.color }}>
              {platform.label}
            </div>
            <h3 className="feed-title">{item.title}</h3>
            {isShop && item.extra?.price && (
              <p className="feed-price">{Number(item.extra.price).toLocaleString()}원</p>
            )}
            {!isShop && <p className="feed-desc">{item.description}</p>}
            <div className="feed-meta">
              {item.author && <span>{item.author}</span>}
              {item.date && <span>{item.date}</span>}
            </div>
          </div>
        </div>
      )}

      {!isYoutube && !hasImage && (
        <div className="feed-text-only">
          <div className="feed-badge" style={{ background: platform.color }}>
            {platform.label}
          </div>
          <h3 className="feed-title">{item.title}</h3>
          <p className="feed-desc">{item.description}</p>
          <div className="feed-meta">
            {item.author && <span>{item.author}</span>}
            {item.date && <span>{item.date}</span>}
          </div>
        </div>
      )}

      {isYoutube && (
        <div className="feed-yt-info">
          <div className="feed-badge" style={{ background: platform.color }}>
            {platform.label}
          </div>
          <h3 className="feed-title">{item.title}</h3>
          <div className="feed-meta">
            {item.author && <span>{item.author}</span>}
            {item.date && <span>{item.date}</span>}
          </div>
        </div>
      )}
    </a>
  );
}

export default FeedCard;
