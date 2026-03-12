import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { logout, updateInterests } from '../slice/authSlice';
import './ProfilePage.css';

const INTEREST_OPTIONS = [
  { key: '맛집', emoji: '🍽️' },
  { key: '여행', emoji: '✈️' },
  { key: 'IT', emoji: '💻' },
  { key: '영화', emoji: '🎬' },
  { key: '음악', emoji: '🎵' },
  { key: '패션', emoji: '👗' },
  { key: '게임', emoji: '🎮' },
  { key: '요리', emoji: '🍳' },
  { key: '운동', emoji: '💪' },
  { key: '뷰티', emoji: '💄' },
  { key: '일상', emoji: '📸' },
  { key: '리뷰', emoji: '⭐' },
  { key: '먹방', emoji: '🤤' },
  { key: '캠핑', emoji: '⛺' },
  { key: '인테리어', emoji: '🏠' },
  { key: '자동차', emoji: '🚗' },
  { key: '펫', emoji: '🐶' },
  { key: '공부', emoji: '📚' },
  { key: '재테크', emoji: '💰' },
  { key: '드라마', emoji: '📺' },
  { key: '축구', emoji: '⚽' },
  { key: '야구', emoji: '⚾' },
  { key: '농구', emoji: '🏀' },
  { key: '헬스', emoji: '🏋️' },
  { key: '사진', emoji: '📷' },
  { key: '독서', emoji: '📖' },
  { key: '코딩', emoji: '👨‍💻' },
  { key: '주식', emoji: '📈' },
  { key: '부동산', emoji: '🏢' },
  { key: '육아', emoji: '👶' },
];

function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [showInterests, setShowInterests] = useState(false);
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (user?.interests) {
      setSelected(user.interests.split(',').filter(Boolean));
    }
  }, [user?.interests]);

  if (!user) return null;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleInterest = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSaveInterests = async () => {
    setSaving(true);
    await dispatch(updateInterests(selected)).unwrap();
    setSaving(false);
    setShowInterests(false);
  };

  const userInterests = user.interests ? user.interests.split(',').filter(Boolean) : [];

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">
          {user.profileImage ? (
            <img src={user.profileImage} alt="" className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar-fallback">
              {(user.name || user.email || '?').charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <h1 className="profile-name">{user.name || '사용자'}</h1>
        <p className="profile-email">{user.email}</p>

        {user.provider && (
          <span className="profile-provider">
            {user.provider === 'google' ? 'Google' : user.provider === 'naver' ? 'Naver' : user.provider} 계정
          </span>
        )}

        {userInterests.length > 0 && !showInterests && (
          <div className="profile-interests-preview">
            {userInterests.map((key) => {
              const opt = INTEREST_OPTIONS.find((o) => o.key === key);
              return (
                <span key={key} className="interest-preview-tag">
                  {opt ? opt.emoji : ''} {key}
                </span>
              );
            })}
          </div>
        )}

        {showInterests && (
          <div className="interests-panel">
            <h3 className="interests-title">관심사를 선택하세요</h3>
            <p className="interests-subtitle">선택한 관심사가 추천 피드에 반영됩니다</p>
            <div className="interests-grid">
              {INTEREST_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  className={`interest-chip ${selected.includes(opt.key) ? 'selected' : ''}`}
                  onClick={() => toggleInterest(opt.key)}
                >
                  <span className="interest-emoji">{opt.emoji}</span>
                  <span>{opt.key}</span>
                </button>
              ))}
            </div>
            <div className="interests-actions">
              <button className="interests-cancel" onClick={() => {
                setSelected(userInterests);
                setShowInterests(false);
              }}>
                취소
              </button>
              <button className="interests-save" onClick={handleSaveInterests} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        )}

        <div className="profile-menu">
          <div className="profile-menu-item" onClick={() => setShowInterests(!showInterests)}>
            <span className="profile-menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6e6e73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </span>
            <span>관심사 설정</span>
            {userInterests.length > 0 ? (
              <span className="profile-menu-badge">{userInterests.length}개 선택</span>
            ) : (
              <span className="profile-menu-arrow">›</span>
            )}
          </div>

          <div className="profile-menu-item" onClick={() => navigate('/terms')}>
            <span className="profile-menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6e6e73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </span>
            <span>이용약관</span>
            <span className="profile-menu-arrow">›</span>
          </div>

          <div className="profile-menu-item" onClick={() => navigate('/privacy')}>
            <span className="profile-menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6e6e73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <span>개인정보 처리방침</span>
            <span className="profile-menu-arrow">›</span>
          </div>
        </div>

        <button className="profile-logout-btn" onClick={handleLogout}>
          로그아웃
        </button>

        <p className="profile-version">DAMO v1.0.0</p>
      </div>
    </div>
  );
}

export default ProfilePage;
