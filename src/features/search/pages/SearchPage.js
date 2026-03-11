import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { searchAll, fetchTrending, setActiveFilter, clearSearch, FILTERS } from '../slice/searchSlice';
import { analytics, logEvent } from '../../../core/firebase';
import FeedCard from '../components/FeedCard';
import './SearchPage.css';

function SearchPage() {
  const dispatch = useDispatch();
  const { query, activeFilter, items, loading, trendingLoaded } = useSelector(
    (state) => state.search
  );
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!trendingLoaded && !query) {
      dispatch(fetchTrending());
    }
  }, [dispatch, trendingLoaded, query]);

  useEffect(() => {
    logEvent(analytics, 'page_view', { page_title: 'Search', page_path: '/search' });
  }, []);

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
          <div className="feed-grid">
            {filteredItems.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default SearchPage;
