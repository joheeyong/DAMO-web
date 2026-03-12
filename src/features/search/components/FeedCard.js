import { useState, useRef, useEffect, useCallback } from 'react';
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
  reddit: { label: 'Reddit', color: '#ff4500' },
  shorts: { label: 'Shorts', color: '#ff0000' },
};

function getVideoId(item) {
  if (item.platform === 'shorts') {
    return item.id.replace('shorts-', '');
  }
  return item.id.replace('yt-', '');
}

function VideoPreview({ item, isShorts }) {
  const [playing, setPlaying] = useState(false);
  const [inView, setInView] = useState(false);
  const cardRef = useRef(null);
  const hoverTimeout = useRef(null);
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const videoId = getVideoId(item);

  // Mobile: auto-play when centered in viewport
  useEffect(() => {
    if (!isMobile || !cardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.7 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setPlaying(inView);
    }
  }, [inView, isMobile]);

  const handleMouseEnter = useCallback(() => {
    if (isMobile) return;
    hoverTimeout.current = setTimeout(() => setPlaying(true), 500);
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;
    clearTimeout(hoverTimeout.current);
    setPlaying(false);
  }, [isMobile]);

  const wrapClass = isShorts ? 'feed-shorts-wrap' : 'feed-thumbnail-wrap';
  const thumbClass = isShorts ? 'feed-shorts-thumb' : 'feed-thumbnail';
  const playClass = isShorts ? 'feed-shorts-play' : 'feed-play-icon';

  return (
    <div
      ref={cardRef}
      className={wrapClass}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {playing ? (
        <iframe
          className="feed-video-iframe"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&loop=1&playlist=${videoId}`}
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={item.title}
        />
      ) : (
        <>
          <img src={item.image} alt="" className={thumbClass} />
          <div className={playClass}>&#9654;</div>
        </>
      )}
    </div>
  );
}

function FeedCard({ item }) {
  const platform = PLATFORM_LABELS[item.platform] || { label: item.platform, color: '#6b7280' };
  const isYoutube = item.platform === 'youtube';
  const isShorts = item.platform === 'shorts';
  const isReddit = item.platform === 'reddit';
  const isShop = item.platform === 'shop';
  const isBook = item.platform === 'book';
  const hasImage = !!item.image;
  const isVideo = isYoutube || isShorts;

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`feed-card ${isYoutube ? 'feed-card-youtube' : ''} ${isShorts ? 'feed-card-shorts' : ''}`}
      onClick={() => logEvent(analytics, 'select_content', {
        content_type: item.platform,
        item_id: item.id,
      })}
    >
      {isVideo && hasImage && (
        <VideoPreview item={item} isShorts={isShorts} />
      )}

      {!isVideo && hasImage && (
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
            {isReddit && item.extra?.subreddit && (
              <p className="feed-subreddit">{item.extra.subreddit}</p>
            )}
            {!isShop && <p className="feed-desc">{item.description}</p>}
            {isReddit && (
              <div className="feed-reddit-stats">
                <span>▲ {item.extra?.score?.toLocaleString()}</span>
                <span>💬 {item.extra?.numComments?.toLocaleString()}</span>
              </div>
            )}
            <div className="feed-meta">
              {item.author && <span>{item.author}</span>}
              {item.date && <span>{item.date}</span>}
            </div>
          </div>
        </div>
      )}

      {!isVideo && !hasImage && (
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

      {isShorts && (
        <div className="feed-shorts-info">
          <div className="feed-badge" style={{ background: platform.color }}>
            {platform.label}
          </div>
          <h3 className="feed-title">{item.title}</h3>
          <div className="feed-meta">
            {item.author && <span>{item.author}</span>}
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
