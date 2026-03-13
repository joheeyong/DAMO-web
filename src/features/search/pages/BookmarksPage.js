import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookmarkApi } from '../api/bookmarkApi';
import FeedCard from '../components/FeedCard';
import './BookmarksPage.css';

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onMouseDown={onCancel}>
      <div className="confirm-dialog" onMouseDown={(e) => e.stopPropagation()}>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-cancel" onClick={onCancel}>취소</button>
          <button className="confirm-ok" onClick={onConfirm}>삭제</button>
        </div>
      </div>
    </div>
  );
}

function getLocalBookmarks() {
  try { return JSON.parse(localStorage.getItem('damo_bookmarks') || '[]'); } catch { return []; }
}

function BookmarksPage() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState(getLocalBookmarks);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // On mount: sync with server if logged in
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        // Sync merges localStorage → server, returns full list
        await bookmarkApi.sync();
        const list = await bookmarkApi.list();
        if (!cancelled) setBookmarks(list);
      } catch {
        if (!cancelled) setBookmarks(getLocalBookmarks());
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Listen for changes from FeedCard bookmark toggles
  useEffect(() => {
    const onChanged = () => setBookmarks(getLocalBookmarks());
    window.addEventListener('bookmarks-changed', onChanged);
    return () => window.removeEventListener('bookmarks-changed', onChanged);
  }, []);

  const handleClearAll = useCallback(async () => {
    setShowConfirm(false);
    await bookmarkApi.clearAll();
    setBookmarks([]);
  }, []);

  return (
    <div className="bookmarks-page">
      <header className="bookmarks-header">
        <div className="bookmarks-header-inner">
          <button className="bookmarks-back" onClick={() => navigate('/search')} aria-label="뒤로">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="bookmarks-title">저장한 콘텐츠</h1>
          {bookmarks.length > 0 && (
            <button className="bookmarks-clear" onClick={() => setShowConfirm(true)}>전체 삭제</button>
          )}
        </div>
      </header>

      <main className="bookmarks-feed">
        {loading ? (
          <div className="bookmarks-loading">
            <div className="spinner" />
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="bookmarks-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d1d6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <p className="bookmarks-empty-title">저장한 콘텐츠가 없어요</p>
            <p className="bookmarks-empty-desc">마음에 드는 콘텐츠의 북마크 버튼을 눌러보세요</p>
          </div>
        ) : (
          <>
            <p className="bookmarks-count">{bookmarks.length}개의 저장된 콘텐츠</p>
            <div className="bookmarks-grid">
              {bookmarks.map((item) => (
                <FeedCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </main>

      {showConfirm && (
        <ConfirmDialog
          message="저장된 북마크를 모두 삭제할까요?"
          onConfirm={handleClearAll}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}

export default BookmarksPage;
