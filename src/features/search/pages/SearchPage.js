import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { searchAll, searchMore, setActiveTab, CATEGORIES } from '../slice/searchSlice';
import SearchResultCard from '../components/SearchResultCard';
import './SearchPage.css';

function SearchPage() {
  const dispatch = useDispatch();
  const { query, activeTab, results, loading, moreLoading } = useSelector(
    (state) => state.search
  );
  const [inputValue, setInputValue] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    dispatch(searchAll({ query: inputValue.trim() }));
  };

  const activeResult = results[activeTab];
  const items = activeResult?.items || [];
  const total = activeResult?.total || 0;

  const handleLoadMore = () => {
    dispatch(
      searchMore({
        category: activeTab,
        query,
        start: items.length + 1,
      })
    );
  };

  return (
    <div className="search-page">
      <header className="search-header">
        <div className="search-header-inner">
          <h1 className="search-logo">DAMO</h1>
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

      {query && (
        <div className="search-tabs">
          <div className="tabs-inner">
            {CATEGORIES.map((cat) => {
              const count = results[cat.key]?.total;
              return (
                <button
                  key={cat.key}
                  className={`tab ${activeTab === cat.key ? 'active' : ''}`}
                  onClick={() => dispatch(setActiveTab(cat.key))}
                >
                  {cat.label}
                  {count !== undefined && (
                    <span className="tab-count">
                      {count > 999 ? '999+' : count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <main className="search-results">
        {loading && (
          <div className="search-loading">
            <div className="spinner" />
            <p>검색중...</p>
          </div>
        )}

        {!loading && query && items.length === 0 && (
          <div className="search-empty">
            <p>'{query}' 검색 결과가 없습니다.</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <>
            <div className="results-info">
              <span>약 {total.toLocaleString()}개 결과</span>
            </div>

            <div className={`results-grid ${activeTab === 'image' ? 'image-grid' : ''}`}>
              {items.map((item, idx) => (
                <SearchResultCard key={idx} category={activeTab} item={item} />
              ))}
            </div>

            {items.length < total && (
              <button
                className="load-more-btn"
                onClick={handleLoadMore}
                disabled={moreLoading}
              >
                {moreLoading ? '불러오는 중...' : '더보기'}
              </button>
            )}
          </>
        )}

        {!query && !loading && (
          <div className="search-welcome">
            <img src="/favicon.svg" alt="DAMO" className="welcome-logo" />
            <h2>다모</h2>
            <p>여러 플랫폼의 콘텐츠를 한 번에 검색하세요</p>
            <div className="welcome-tags">
              {CATEGORIES.map((cat) => (
                <span key={cat.key} className="welcome-tag">{cat.label}</span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default SearchPage;
