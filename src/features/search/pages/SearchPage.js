import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { searchAll, fetchTrending, fetchMoreTrending, setActiveFilter, clearSearch, FILTERS } from '../slice/searchSlice';
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
  const { query, activeFilter, items, loading, loadingMore, trendingLoaded } = useSelector(
    (state) => state.search
  );
  const { user } = useSelector((state) => state.auth);
  const [inputValue, setInputValue] = useState('');
  const observerRef = useRef(null);

  useEffect(() => {
    if (!trendingLoaded && !query) {
      dispatch(fetchTrending());
    }
  }, [dispatch, trendingLoaded, query]);

  useEffect(() => {
    logEvent(analytics, 'page_view', { page_title: 'Search', page_path: '/search' });
  }, []);

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
    dispatch(searchAll({ query: inputValue.trim() }));
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

  // Build banner insertion map: every 8 items, insert a banner
  const bannerMap = useMemo(() => {
    if (!query && userInterests.length > 0) {
      const map = {};
      let bannerIdx = 0;
      for (let i = 7; i < nonShortsItems.length; i += 8) {
        const interest = userInterests[bannerIdx % userInterests.length];
        const template = INTEREST_BANNERS[bannerIdx % INTEREST_BANNERS.length];
        map[i] = template(userName, interest);
        bannerIdx++;
      }
      return map;
    }
    return {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, nonShortsItems.length, userName, userInterests.join(',')]);

  return (
    <div className="search-page">
      <header className="search-header">
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
              autoFocus
            />
            <button type="submit" disabled={loading}>
              {loading ? '...' : '검색'}
            </button>
          </form>
        </div>
      </header>

      <div className="search-filters">
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
                className={`filter-chip ${activeFilter === f.key ? 'active' : ''}`}
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
        </div>
      </div>

      <main className="search-feed">
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
