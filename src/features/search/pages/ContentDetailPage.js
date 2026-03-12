import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import './ContentDetailPage.css';

const PLATFORM_LABELS = {
  youtube: { label: 'YouTube', color: '#ff0000' },
  shorts: { label: 'Shorts', color: '#ff0000' },
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
  instagram: { label: 'Instagram', color: '#E1306C' },
};

function toMobileUrl(url, platform) {
  if (!url) return url;
  try {
    const u = new URL(url);
    // Naver blog
    if (u.hostname === 'blog.naver.com') {
      u.hostname = 'm.blog.naver.com';
      return u.toString();
    }
    // Naver news
    if (u.hostname === 'news.naver.com' || u.hostname === 'n.news.naver.com') {
      u.hostname = 'm.news.naver.com';
      return u.toString();
    }
    // Naver cafe
    if (u.hostname === 'cafe.naver.com') {
      u.hostname = 'm.cafe.naver.com';
      return u.toString();
    }
    // Naver kin
    if (u.hostname === 'kin.naver.com') {
      u.hostname = 'm.kin.naver.com';
      return u.toString();
    }
    // Naver shopping
    if (u.hostname === 'search.shopping.naver.com') {
      u.hostname = 'msearch.shopping.naver.com';
      return u.toString();
    }
    // Naver book/webkr - keep original
  } catch {
    // invalid URL, return as-is
  }
  return url;
}

function getVideoId(item) {
  if (item.platform === 'shorts') return item.id.replace('shorts-', '');
  return item.id.replace('yt-', '');
}

function ContentDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item;
  const iframeRef = useRef(null);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    if (!item) navigate('/search', { replace: true });
  }, [item, navigate]);

  if (!item) return null;

  const platform = PLATFORM_LABELS[item.platform] || { label: item.platform, color: '#6b7280' };
  const isYoutube = item.platform === 'youtube';
  const isShorts = item.platform === 'shorts';
  const isVideo = isYoutube || isShorts;
  const isImage = item.platform === 'image' || item.platform === 'kakao-image';
  const videoId = isVideo ? getVideoId(item) : null;
  const mobileLink = toMobileUrl(item.link, item.platform);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/search');
    }
  };

  // YouTube / Shorts: full custom page
  if (isVideo) {
    return (
      <div className="detail-page">
        <header className="detail-header">
          <button className="detail-back" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="detail-header-badge" style={{ background: platform.color, color: platform.textColor || '#fff' }}>
            {platform.label}
          </div>
          <div className="detail-header-spacer" />
        </header>

        <div className={`detail-video-wrap ${isShorts ? 'detail-video-shorts' : ''}`}>
          <iframe
            className="detail-video-iframe"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            title={item.title}
          />
        </div>

        <div className="detail-video-info">
          <h1 className="detail-video-title">{item.title}</h1>
          <div className="detail-video-meta">
            {item.author && <span className="detail-video-author">{item.author}</span>}
            {item.date && <span className="detail-video-date">{item.date}</span>}
          </div>
          {item.description && (
            <p className="detail-video-desc">{item.description}</p>
          )}
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="detail-original-link">
            YouTube에서 보기
          </a>
        </div>
      </div>
    );
  }

  // Image: full custom viewer
  if (isImage) {
    return (
      <div className="detail-page">
        <header className="detail-header">
          <button className="detail-back" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="detail-header-badge" style={{ background: platform.color, color: platform.textColor || '#fff' }}>
            {platform.label}
          </div>
          <div className="detail-header-spacer" />
        </header>

        <div className="detail-image-viewer">
          <img src={item.image} alt={item.title} className="detail-image-full" />
        </div>

        <div className="detail-video-info">
          <h1 className="detail-video-title">{item.title}</h1>
          {item.description && (
            <p className="detail-video-desc">{item.description}</p>
          )}
          <div className="detail-video-meta">
            {item.author && <span className="detail-video-author">{item.author}</span>}
            {item.date && <span className="detail-video-date">{item.date}</span>}
          </div>
          <a href={mobileLink} target="_blank" rel="noopener noreferrer" className="detail-original-link">
            원본 보기
          </a>
        </div>
      </div>
    );
  }

  // All other content: header + iframe
  return (
    <div className="detail-page">
      <header className="detail-header">
        <button className="detail-back" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="detail-header-info">
          <div className="detail-header-badge" style={{ background: platform.color, color: platform.textColor || '#fff' }}>
            {platform.label}
          </div>
          <span className="detail-header-title">{item.title}</span>
        </div>
        <a href={mobileLink} target="_blank" rel="noopener noreferrer" className="detail-header-external">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </header>

      {!iframeError ? (
        <iframe
          ref={iframeRef}
          className="detail-iframe"
          src={mobileLink}
          title={item.title}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          onError={() => setIframeError(true)}
        />
      ) : (
        <div className="detail-iframe-fallback">
          <p>이 페이지는 앱 내에서 표시할 수 없습니다.</p>
          <a href={mobileLink} target="_blank" rel="noopener noreferrer" className="detail-original-link">
            원본 페이지로 이동
          </a>
        </div>
      )}
    </div>
  );
}

export default ContentDetailPage;
