import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { searchAll, fetchTrending, fetchMoreTrending, setActiveFilter, setSort, clearSearch, FILTERS } from '../slice/searchSlice';
import { analytics, logEvent } from '../../../core/firebase';
import FeedCard from '../components/FeedCard';
import './SearchPage.css';

const INTEREST_BANNERS = [
  (name, interest) => `${name}님이 좋아할 ${interest} 콘텐츠`,
  (name, interest) => `${name}님에게 딱 맞는 ${interest}`,
  (name, interest) => `${interest}, ${name}님을 위해 골랐어요`,
  (name, interest) => `${name}님의 관심사 ${interest} 모아보기`,
  (name, interest) => `${interest} 좋아하시죠? ${name}님 취향저격`,
  (name, interest) => `${name}님이 관심 있을 ${interest} 소식`,
  (name, interest) => `오늘의 ${interest}, ${name}님 맞춤 추천`,
  (name, interest) => `${name}님 취향 ${interest} 핫 콘텐츠`,
  (name, interest) => `${interest} 덕후 ${name}님을 위한 픽`,
  (name, interest) => `${name}님, ${interest} 새로운 소식이에요`,
];

function SearchPage() {
  const dispatch = useDispatch();
  const { query, activeFilter, sort, items, loading, loadingMore, trendingLoaded } = useSelector(
    (state) => state.search
  );
  const { user } = useSelector((state) => state.auth);
  const [inputValue, setInputValue] = useState('');
  const [headerHidden, setHeaderHidden] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [filterHeight, setFilterHeight] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const headerRef = useRef(null);
  const filterRef = useRef(null);
  const observerRef = useRef(null);
  const lastScrollY = useRef(0);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);
  const PULL_THRESHOLD = 80;

  useEffect(() => {
    const measure = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
      if (filterRef.current) setFilterHeight(filterRef.current.offsetHeight);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 60) {
        setHeaderHidden(true);
      } else if (currentY < lastScrollY.current) {
        setHeaderHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!trendingLoaded && !query) {
      dispatch(fetchTrending());
    }
  }, [dispatch, trendingLoaded, query]);

  useEffect(() => {
    logEvent(analytics, 'page_view', { page_title: 'Search', page_path: '/search' });
  }, []);

  // Notify Flutter when content is ready
  useEffect(() => {
    if (!loading && items.length > 0) {
      try {
        window.DamoReady?.postMessage('ready');
      } catch (e) { /* not in Flutter WebView */ }
    }
  }, [loading, items.length]);

  // Pull to refresh
  const handleTouchStart = useCallback((e) => {
    if (window.scrollY <= 0 && !refreshing) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling.current || refreshing) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0) {
      // Dampen the pull distance for a rubber-band feel
      setPullDistance(Math.min(diff * 0.4, 120));
    }
  }, [refreshing]);

  const handleTouchEnd = useCallback(() => {
    if (!isPulling.current) return;
    isPulling.current = false;
    if (pullDistance >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDistance(60);
      dispatch(clearSearch());
      dispatch(fetchTrending()).finally(() => {
        setRefreshing(false);
        setPullDistance(0);
      });
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, refreshing, dispatch, PULL_THRESHOLD]);

  const lastItemRef = useCallback(
    (node) => {
      if (loading || loadingMore || query) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          dispatch(fetchMoreTrending());
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loading, loadingMore, query, dispatch]
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    logEvent(analytics, 'search', { search_term: inputValue.trim() });
    dispatch(searchAll({ query: inputValue.trim(), sort }));
  };

  const handleSortChange = (newSort) => {
    dispatch(setSort(newSort));
    if (query) {
      dispatch(searchAll({ query, sort: newSort }));
    }
  };

  const filteredItems =
    activeFilter === 'all'
      ? items
      : items.filter((item) => item.platform === activeFilter);

  const shortsItems = filteredItems.filter((item) => item.platform === 'shorts');
  const nonShortsItems = filteredItems.filter((item) => item.platform !== 'shorts');
  const showShortsRow = activeFilter === 'all' && shortsItems.length > 0;

  const userInterests = user?.interests ? user.interests.split(',').filter(Boolean) : [];
  const userName = user?.name || '회원';

  // Build banner map: show banner at the first item of each sourceKeyword group
  const bannerMap = useMemo(() => {
    if (!query) {
      const map = {};
      const seenKeywords = new Set();
      let bannerIdx = 0;
      for (let i = 0; i < nonShortsItems.length; i++) {
        const kw = nonShortsItems[i].sourceKeyword;
        if (kw && !seenKeywords.has(kw)) {
          seenKeywords.add(kw);
          const template = INTEREST_BANNERS[bannerIdx % INTEREST_BANNERS.length];
          map[i] = template(userName, kw);
          bannerIdx++;
        }
      }
      return map;
    }
    return {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, nonShortsItems.length, userName]);

  return (
    <div
      className="search-page"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div
        className={`pull-indicator ${refreshing ? 'refreshing' : ''} ${pullDistance >= PULL_THRESHOLD ? 'ready' : ''}`}
        style={{ height: pullDistance, opacity: Math.min(pullDistance / PULL_THRESHOLD, 1) }}
      >
        <div className="pull-indicator-inner">
          <svg className="pull-arrow" viewBox="0 0 24 24" width="22" height="22">
            <path d="M12 4v12m0 0l-5-5m5 5l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span className="pull-text">{refreshing ? '새로고침 중...' : pullDistance >= PULL_THRESHOLD ? '놓으면 새로고침' : '당겨서 새로고침'}</span>
        </div>
      </div>

      <header ref={headerRef} className={`search-header ${headerHidden ? 'header-hidden' : ''}`}>
        <div className="search-header-inner">
          <h1 className="search-logo" onClick={() => {
            setInputValue('');
            dispatch(clearSearch());
            dispatch(fetchTrending());
          }}>DAMO</h1>
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" disabled={loading} aria-label="검색">
              {loading ? (
                <div className="spinner-small" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </header>

      <div
        ref={filterRef}
        className="search-filters"
        style={{ transform: `translateY(${headerHidden ? 0 : headerHeight}px)` }}
      >
        <div className="filters-inner">
          {FILTERS.map((f) => {
            const count =
              f.key === 'all'
                ? items.length
                : items.filter((i) => i.platform === f.key).length;
            if (f.key !== 'all' && count === 0) return null;
            return (
              <button
                key={f.key}
                className={`filter-chip ${f.key === 'blog' ? 'filter-chip-nblog' : ''} ${activeFilter === f.key ? 'active' : ''}`}
                onClick={() => {
                  logEvent(analytics, 'select_filter', { filter: f.key });
                  dispatch(setActiveFilter(f.key));
                }}
              >
                {f.label}
                {count > 0 && <span className="filter-count">{count}</span>}
              </button>
            );
          })}
          {userInterests.length > 0 && (
            <>
              <span className="filter-divider" />
              {userInterests.map((interest) => (
                <button
                  key={`interest-${interest}`}
                  className={`filter-chip filter-chip-interest ${query === interest ? 'active' : ''}`}
                  onClick={() => {
                    logEvent(analytics, 'select_filter', { filter: `interest:${interest}` });
                    setInputValue(interest);
                    dispatch(searchAll({ query: interest, sort }));
                  }}
                >
                  {interest}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      <main className="search-feed" style={headerHeight && filterHeight ? { paddingTop: headerHeight + filterHeight + 16 } : undefined}>
        {query && items.length > 0 && !loading && (
          <div className="sort-bar">
            <button
              className={`sort-btn ${sort === 'sim' ? 'active' : ''}`}
              onClick={() => handleSortChange('sim')}
            >
              정확도순
            </button>
            <button
              className={`sort-btn ${sort === 'date' ? 'active' : ''}`}
              onClick={() => handleSortChange('date')}
            >
              최신순
            </button>
          </div>
        )}
        {loading && (
          <div className="search-loading">
            <div className="spinner" />
            <p>콘텐츠를 불러오는 중...</p>
          </div>
        )}

        {!loading && !query && items.length > 0 && (
          <div className="trending-header">
            <h2>추천 피드</h2>
            <p>지금 인기 있는 콘텐츠</p>
          </div>
        )}

        {!loading && query && filteredItems.length === 0 && (
          <div className="search-empty">
            <p>'{query}' 검색 결과가 없습니다.</p>
          </div>
        )}

        {!loading && filteredItems.length > 0 && (
          <>
            {showShortsRow && (
              <div className="shorts-section">
                <h3 className="shorts-section-title">Shorts</h3>
                <div className="shorts-row">
                  {shortsItems.map((item) => (
                    <FeedCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            <div className="feed-grid">
              {(activeFilter === 'shorts' ? shortsItems : nonShortsItems).map((item, idx) => {
                const list = activeFilter === 'shorts' ? shortsItems : nonShortsItems;
                const isLast = idx === list.length - 1;
                return (
                  <div key={item.id}>
                    {bannerMap[idx] && (
                      <div className="feed-interest-banner">
                        <span className="feed-interest-banner-text">{bannerMap[idx]}</span>
                      </div>
                    )}
                    <div ref={isLast ? lastItemRef : null}>
                      <FeedCard item={item} />
                    </div>
                  </div>
                );
              })}
            </div>

            {loadingMore && (
              <div className="search-loading-more">
                <div className="spinner" />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default SearchPage;
