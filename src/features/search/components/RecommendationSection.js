import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { searchAll } from '../slice/searchSlice';
import { activityApi } from '../api/activityApi';
import { PLATFORM_LABELS } from '../../../shared/constants/platforms';
import './RecommendationSection.css';

function RecommendationSection() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    activityApi.getRecommendations()
      .then((result) => {
        if (result.items?.length > 0 || result.keywords?.length > 0) {
          setData(result);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (!token || loading || !data || dismissed) return null;
  if (data.items.length === 0 && data.keywords.length === 0) return null;

  const userName = data.userName || user?.name || '회원';

  const handleItemClick = (item) => {
    if (item.type === 'damo-blog') {
      navigate(`/blog/${item.id}`);
    } else if (item.type === 'damo-feed') {
      navigate(`/social/${item.id}`);
    }
  };

  const handleKeywordClick = (keyword) => {
    dispatch(searchAll({ query: keyword, sort: 'sim', period: 'all' }));
  };

  return (
    <div className="rec-section">
      <div className="rec-header">
        <div className="rec-header-left">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <h3>{userName}님을 위한 추천</h3>
        </div>
        <button className="rec-dismiss" onClick={() => setDismissed(true)} aria-label="닫기">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {data.keywords.length > 0 && (
        <div className="rec-keywords">
          {data.keywords.map((kw) => (
            <button
              key={kw.keyword}
              className="rec-keyword-chip"
              onClick={() => handleKeywordClick(kw.keyword)}
            >
              <span className="rec-keyword-text">{kw.keyword}</span>
              <span className="rec-keyword-reason">{kw.reason}</span>
            </button>
          ))}
        </div>
      )}

      {data.items.length > 0 && (
        <div className="rec-items-scroll">
          {data.items.map((item) => {
            const platform = PLATFORM_LABELS[item.type] || { label: item.type, color: '#6366f1' };
            return (
              <div
                key={`${item.type}-${item.id}`}
                className="rec-card"
                onClick={() => handleItemClick(item)}
              >
                {item.image ? (
                  <img src={item.image} alt="" className="rec-card-image" />
                ) : (
                  <div className="rec-card-image-placeholder">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                )}
                <div className="rec-card-body">
                  <div className="rec-card-badge" style={{ background: platform.color, color: platform.textColor || '#fff' }}>
                    {platform.label}
                  </div>
                  <p className="rec-card-title">{item.title}</p>
                  <span className="rec-card-reason">{item.reason}</span>
                  <div className="rec-card-stats">
                    <span>&#9829; {item.likeCount || 0}</span>
                    <span>&#128172; {item.commentCount || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RecommendationSection;
