import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { analytics, logEvent } from '../../../core/firebase';
import { activityApi } from '../api/activityApi';
import './FeedCard.css';

const PLATFORM_LABELS = {
  youtube: { label: 'YouTube', color: '#ff0000' },
  blog: { label: 'N 블로그', color: '#03c75a' },
  news: { label: 'N 뉴스', color: '#03c75a' },
  cafe: { label: 'N 카페', color: '#03c75a' },
  shop: { label: 'N 쇼핑', color: '#00b493' },
  image: { label: 'N 이미지', color: '#03c75a' },
  kin: { label: '지식iN', color: '#03c75a' },
  book: { label: 'N 도서', color: '#03c75a' },
  webkr: { label: 'N 웹', color: '#03c75a' },
  'kakao-blog': { label: 'D 블로그', color: '#FEE500', textColor: '#3C1E1E' },
  'kakao-cafe': { label: 'D 카페', color: '#FEE500', textColor: '#3C1E1E' },
  'kakao-web': { label: 'D 웹', color: '#FEE500', textColor: '#3C1E1E' },
  'kakao-video': { label: 'D 영상', color: '#FEE500', textColor: '#3C1E1E' },
  'kakao-image': { label: 'D 이미지', color: '#FEE500', textColor: '#3C1E1E' },
  reddit: { label: 'Reddit', color: '#ff4500' },
  shorts: { label: 'Shorts', color: '#ff0000' },
  instagram: { label: 'Instagram', color: '#E1306C' },
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

function getBookmarks() {
  try { return JSON.parse(localStorage.getItem('damo_bookmarks') || '[]'); } catch { return []; }
}

function toggleBookmark(item) {
  const bookmarks = getBookmarks();
  const idx = bookmarks.findIndex((b) => b.id === item.id);
  if (idx >= 0) {
    bookmarks.splice(idx, 1);
  } else {
    bookmarks.unshift({
      id: item.id,
      platform: item.platform,
      title: item.title,
      description: item.description,
      link: item.link,
      image: item.image,
      author: item.author,
      date: item.date,
      extra: item.extra,
      savedAt: new Date().toISOString(),
    });
  }
  localStorage.setItem('damo_bookmarks', JSON.stringify(bookmarks));
  window.dispatchEvent(new Event('bookmarks-changed'));
  return idx < 0; // true if added
}

function FeedCard({ item }) {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(() => getBookmarks().some((b) => b.id === item.id));
  const platform = PLATFORM_LABELS[item.platform] || { label: item.platform, color: '#6b7280' };
  const isYoutube = item.platform === 'youtube';
  const isShorts = item.platform === 'shorts';
  const isReddit = item.platform === 'reddit';
  const isShop = item.platform === 'shop';
  const isBook = item.platform === 'book';
  const hasImage = !!item.image;
  const isVideo = isYoutube || isShorts;

  const inApp = !!window.DamoReady; // Flutter WebView has DamoReady channel

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleBookmark(item);
    setBookmarked(added);
    logEvent(analytics, added ? 'add_bookmark' : 'remove_bookmark', { item_id: item.id, platform: item.platform });
  };

  const handleClick = (e) => {
    e.preventDefault();
    logEvent(analytics, 'select_content', {
      content_type: item.platform,
      item_id: item.id,
    });
    if (localStorage.getItem('auth_token')) {
      activityApi.recordClick(item.id, item.platform, item.sourceKeyword);
    }
    if (inApp) {
      // Trigger real navigation so Flutter's NavigationDelegate intercepts it
      window.location.href = item.link;
    } else {
      navigate('/content', { state: { item } });
    }
  };

  return (
    <a
      href={item.link}
      className={`feed-card ${isYoutube ? 'feed-card-youtube' : ''} ${isShorts ? 'feed-card-shorts' : ''}`}
      onClick={handleClick}
    >
      {isShorts && hasImage && (
        <VideoPreview item={item} isShorts={true} />
      )}

      {isYoutube && hasImage && (
        <div className="feed-thumbnail-wrap">
          <img src={item.image} alt="" className="feed-thumbnail" />
          <div className="feed-play-icon">&#9654;</div>
        </div>
      )}

      {!isVideo && hasImage && (
        <div className="feed-card-body">
          <img
            src={item.image}
            alt=""
            className={`feed-image ${isBook ? 'feed-image-book' : ''}`}
          />
          <div className="feed-text">
            <div className="feed-badge" style={{ background: platform.color, color: platform.textColor || '#fff' }}>
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
          <div className="feed-badge" style={{ background: platform.color, color: platform.textColor || '#fff' }}>
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
          <div className="feed-badge" style={{ background: platform.color, color: platform.textColor || '#fff' }}>
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
          <div className="feed-badge" style={{ background: platform.color, color: platform.textColor || '#fff' }}>
            {platform.label}
          </div>
          <h3 className="feed-title">{item.title}</h3>
          <div className="feed-meta">
            {item.author && <span>{item.author}</span>}
            {item.date && <span>{item.date}</span>}
          </div>
        </div>
      )}

      <button className={`feed-bookmark ${bookmarked ? 'active' : ''}`} onClick={handleBookmark} aria-label="북마크">
        <svg width="18" height="18" viewBox="0 0 24 24" fill={bookmarked ? '#6366f1' : 'none'} stroke={bookmarked ? '#6366f1' : '#aeaeb2'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </a>
  );
}

export default FeedCard;
