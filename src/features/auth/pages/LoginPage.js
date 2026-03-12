import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './LoginPage.css';

const GOOGLE_CLIENT_ID = '546301713753-tnosu460h0nsiirqs0uqfue1oa7tvldv.apps.googleusercontent.com';
const REDIRECT_URI = window.location.origin + '/auth/google/callback';

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) navigate('/search');
  }, [user, navigate]);

  const handleGoogleLogin = () => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth`
      + `?client_id=${GOOGLE_CLIENT_ID}`
      + `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
      + `&response_type=code`
      + `&scope=openid%20email%20profile`
      + `&access_type=offline`
      + `&prompt=consent`;
    window.location.href = url;
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-logo">DAMO</h1>
        <p className="login-subtitle">통합 콘텐츠 검색 플랫폼</p>

        <div className="login-buttons">
          <button className="login-btn google-btn" onClick={handleGoogleLogin}>
            <svg className="login-btn-icon" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google로 계속하기
          </button>
        </div>

        <p className="login-terms">
          로그인하면 <a href="/terms">이용약관</a> 및 <a href="/privacy">개인정보 처리방침</a>에 동의합니다.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
