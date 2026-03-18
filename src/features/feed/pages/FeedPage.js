import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTrending, fetchMoreTrending } from '../../search/slice/searchSlice';
import { analytics, logEvent } from '../../../core/firebase';
import { activityApi } from '../../search/api/activityApi';
import { bookmarkApi } from '../../../shared/api/bookmarkApi';
import { PLATFORM_LABELS } from '../../../shared/constants/platforms';
import { getVideoId, isFlutterApp } from '../../../shared/utils/helpers';
import './FeedPage.css';

function FeedPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, trendingLoaded } = useSelector((state) => state.search);
  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const loadMoreRef = useRef(null);

  // Filter to items with images (fullscreen needs visuals)
  const feedItems = items.filter((item) => item.image);

  useEffect(() => {
    if (!trendingLoaded) {
      dispatch(fetchTrending());
    }
  }, [dispatch, trendingLoaded]);

  useEffect(() => {
    logEvent(analytics, 'page_view', { page_title: 'Feed', page_path: '/feed' });
  }, []);

  // Detect current slide via IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const slides = container.querySelectorAll('.feed-slide');
    if (slides.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.index);
            if (!isNaN(idx)) setCurrentIndex(idx);
          }
        }
      },
      { root: container, threshold: 0.6 }
    );

    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [feedItems.length]);

  // Load more when near the end
  useEffect(() => {
    if (currentIndex >= feedItems.length - 3 && feedItems.length > 0 && !loading) {
      dispatch(fetchMoreTrending());
    }
  }, [currentIndex, feedItems.length, loading, dispatch]);

  // Notify Flutter
  useEffect(() => {
    if (!loading && feedItems.length > 0) {
      try { window.DamoReady?.postMessage('ready'); } catch {}
    }
  }, [loading, feedItems.length]);

  if (loading && feedItems.length === 0) {
    return (
      <div className="feed-page-loading">
        <div className="feed-page-spinner" />
        <p>피드를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="feed-page" ref={containerRef}>
      {feedItems.map((item, idx) => (
        <FeedSlide
          key={item.id}
          item={item}
          index={idx}
          isActive={idx === currentIndex}
          navigate={navigate}
        />
      ))}
      {feedItems.length === 0 && !loading && (
        <div className="feed-page-empty">
          <p>표시할 콘텐츠가 없습니다</p>
        </div>
      )}
    </div>
  );
}

function FeedSlide({ item, index, isActive, navigate }) {
  const [bookmarked, setBookmarked] = useState(() => bookmarkApi.isBookmarked(item.id));
  const platform = PLATFORM_LABELS[item.platform] || { label: item.platform, color: '#6b7280' };
  const isVideo = item.platform === 'youtube' || item.platform === 'shorts';
  const videoId = isVideo ? getVideoId(item) : null;
  const inApp = isFlutterApp();

  const handleBookmark = useCallback((e) => {
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
  }, [bookmarked, item]);

  const handleOpen = useCallback(() => {
    logEvent(analytics, 'select_content', {
      content_type: item.platform,
      item_id: item.id,
    });
    if (localStorage.getItem('auth_token')) {
      activityApi.recordClick(item.id, item.platform, item.sourceKeyword);
    }
    if (inApp) {
      try {
        const parsed = new URL(item.link);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          window.location.href = item.link;
        }
      } catch {}
    } else {
      navigate('/content', { state: { item } });
    }
  }, [item, inApp, navigate]);

  const handleShare = useCallback((e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: item.title, url: item.link }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(item.link);
    }
  }, [item]);

  return (
    <div className="feed-slide" data-index={index} onClick={handleOpen}>
      {/* Background */}
      {isVideo && isActive ? (
        <iframe
          className="feed-slide-video"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&loop=1&playlist=${videoId}`}
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={item.title}
        />
      ) : (
        <img src={item.image} alt="" className="feed-slide-image" />
      )}

      {/* Gradient overlay */}
      <div className="feed-slide-gradient" />

      {/* Right side actions */}
      <div className="feed-slide-actions">
        <button
          className={`feed-slide-action ${bookmarked ? 'active' : ''}`}
          onClick={handleBookmark}
          aria-label="저장"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill={bookmarked ? '#6366f1' : 'none'} stroke={bookmarked ? '#6366f1' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <span>저장</span>
        </button>
        <button className="feed-slide-action" onClick={handleShare} aria-label="공유">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span>공유</span>
        </button>
      </div>

      {/* Bottom info */}
      <div className="feed-slide-info">
        <div className="feed-slide-badge" style={{ background: platform.color, color: platform.textColor || '#fff' }}>
          {platform.label}
        </div>
        <h2 className="feed-slide-title">{item.title}</h2>
        {item.description && (
          <p className="feed-slide-desc">{item.description}</p>
        )}
        <div className="feed-slide-meta">
          {item.author && <span>{item.author}</span>}
          {item.date && <span>{item.date}</span>}
        </div>
      </div>

      {/* Progress dots indicator */}
      {isVideo && isActive && (
        <div className="feed-slide-playing">
          <span className="feed-slide-playing-dot" />
          <span className="feed-slide-playing-dot" />
          <span className="feed-slide-playing-dot" />
        </div>
      )}
    </div>
  );
}

export default FeedPage;
