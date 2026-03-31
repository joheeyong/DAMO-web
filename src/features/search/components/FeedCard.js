import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { analytics, logEvent } from '../../../core/firebase';
import { activityApi } from '../api/activityApi';
import { bookmarkApi } from '../../../shared/api/bookmarkApi';
import { PLATFORM_LABELS } from '../../../shared/constants/platforms';
import { getVideoId, isFlutterApp } from '../../../shared/utils/helpers';
import './FeedCard.css';

function VideoPreview({ item, isShorts }) {
  const [playing, setPlaying] = useState(false);
  const [inView, setInView] = useState(false);
  const cardRef = useRef(null);
  const hoverTimeout = useRef(null);
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const videoId = getVideoId(item);

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
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(() => bookmarkApi.isBookmarked(item.id));
  // TODO: AI 요약 기능 - API 키 설정 후 주석 해제
  // const [summary, setSummary] = useState('');
  // const [isSummarizing, setIsSummarizing] = useState(false);
  // const [showSummary, setShowSummary] = useState(false);

  const platform = PLATFORM_LABELS[item.platform] || { label: item.platform, color: '#6b7280' };
  const isYoutube = item.platform === 'youtube';
  const isShorts = item.platform === 'shorts';
  const isReddit = item.platform === 'reddit';
  const isShop = item.platform === 'shop';
  const isBook = item.platform === 'book';
  const hasImage = !!item.image;
  const isVideo = isYoutube || isShorts;

  const inApp = isFlutterApp();

  // TODO: AI 요약 기능 - API 키 설정 후 주석 해제
  // const handleSummarize = async (e) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   if (showSummary) { setShowSummary(false); return; }
  //   if (summary) { setShowSummary(true); return; }
  //   setIsSummarizing(true);
  //   setShowSummary(true);
  //   try {
  //     const response = await fetch('/api/ai/summarize', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  //       },
  //       body: JSON.stringify({ content: `${item.title}. ${item.description || ''}` })
  //     });
  //     if (response.ok) {
  //       const data = await response.json();
  //       setSummary(data.summary);
  //     } else {
  //       setSummary('요약을 가져오지 못했습니다.');
  //     }
  //   } catch (error) {
  //     setSummary('서버 연결 오류가 발생했습니다.');
  //   } finally {
  //     setIsSummarizing(false);
  //   }
  // };

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarked) {
      bookmarkApi.remove(item.id);
      setBookmarked(false);
      logEvent(analytics, 'remove_bookmark', { item_id: item.id, platform: item.platform });
    } else {
      bookmarkApi.add(item);
      setBookmarked(true);
      logEvent(analytics, 'add_bookmark', { item_id: item.id, platform: item.platform });
    }
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
    if (item.platform === 'damo-blog') {
      navigate(`/blog/${item.extra?.blogPostId}`);
      return;
    }
    if (item.platform === 'damo-feed') {
      navigate(`/social/${item.extra?.socialPostId}`);
      return;
    }
    if (inApp) {
      try {
        const parsed = new URL(item.link);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          window.location.href = item.link;
        }
      } catch {
      }
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
      {isShorts && hasImage && <VideoPreview item={item} isShorts={true} />}

      {isYoutube && hasImage && (
        <div className="feed-thumbnail-wrap">
          <img src={item.image} alt="" className="feed-thumbnail" />
          <div className="feed-play-icon">&#9654;</div>
        </div>
      )}

      {!isVideo && hasImage && (
        <div className="feed-card-body">
          <img src={item.image} alt="" className={`feed-image ${isBook ? 'feed-image-book' : ''}`} />
          <div className="feed-text">
            <div className="feed-badge" style={{ background: platform.color, color: platform.textColor || '#fff' }}>
              {platform.label}
            </div>
            <h3 className="feed-title">{item.title}</h3>
            {isShop && item.extra?.price && <p className="feed-price">{Number(item.extra.price).toLocaleString()}원</p>}
            {isReddit && item.extra?.subreddit && <p className="feed-subreddit">{item.extra.subreddit}</p>}
            {!isShop && <p className="feed-desc">{item.description}</p>}
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

      {/* TODO: AI 요약 기능 - API 키 설정 후 주석 해제
      {showSummary && (
        <div className="feed-ai-summary" onClick={(e) => e.stopPropagation()}>
          <div className="feed-ai-summary-header">
            <span className="ai-sparkle">✨</span> AI 3줄 요약
          </div>
          <div className="feed-ai-summary-content">
            {isSummarizing ? <div className="summary-loading">요약 중...</div> : <pre className="summary-text">{summary}</pre>}
          </div>
        </div>
      )}
      */}

      <div className="feed-card-actions">
        {/* TODO: AI 요약 버튼 - API 키 설정 후 주석 해제
        <button className={`feed-ai-btn ${showSummary ? 'active' : ''}`} onClick={handleSummarize} title="AI 요약">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 1 7.107 7.107c0 .13 0 .261 0 .393a7.5 7.5 0 0 1-7.107 7.107c-.13 0-.261 0-.393 0a7.5 7.5 0 0 1-7.107-7.107c0-.13 0-.261 0-.393A7.5 7.5 0 0 1 12 3z" />
            <path d="M12 8v8M8 12h8" />
          </svg>
        </button>
        */}
        <button className={`feed-bookmark ${bookmarked ? 'active' : ''}`} onClick={handleBookmark} aria-label="북마크">
          <svg width="18" height="18" viewBox="0 0 24 24" fill={bookmarked ? '#6366f1' : 'none'} stroke={bookmarked ? '#6366f1' : '#aeaeb2'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>
    </a>
  );
}

export default FeedCard;
