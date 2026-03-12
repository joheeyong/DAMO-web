import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { logout } from '../slice/authSlice';
import './ProfilePage.css';

function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

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
            {user.provider === 'google' ? 'Google' : user.provider} 계정
          </span>
        )}

        <div className="profile-menu">
          <div className="profile-menu-item">
            <span className="profile-menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6e6e73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </span>
            <span>설정</span>
            <span className="profile-menu-badge">준비 중</span>
          </div>

          <div className="profile-menu-item">
            <span className="profile-menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6e6e73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </span>
            <span>관심사 설정</span>
            <span className="profile-menu-badge">준비 중</span>
          </div>

          <div className="profile-menu-item">
            <span className="profile-menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6e6e73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </span>
            <span>이용약관</span>
            <span className="profile-menu-arrow" onClick={() => navigate('/terms')}>›</span>
          </div>

          <div className="profile-menu-item">
            <span className="profile-menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6e6e73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <span>개인정보 처리방침</span>
            <span className="profile-menu-arrow" onClick={() => navigate('/privacy')}>›</span>
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
