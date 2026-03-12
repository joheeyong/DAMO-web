import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './LoginPage.css';

const GOOGLE_CLIENT_ID = '546301713753-tnosu460h0nsiirqs0uqfue1oa7tvldv.apps.googleusercontent.com';
const NAVER_CLIENT_ID = 'MRyB2GQo4D7YUW_epid5';
const KAKAO_CLIENT_ID = '17dff873debbf3988118d7b429c6ad99';

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) navigate('/search');
  }, [user, navigate]);

  const handleGoogleLogin = () => {
    const redirectUri = window.location.origin + '/auth/google/callback';
    const url = `https://accounts.google.com/o/oauth2/v2/auth`
      + `?client_id=${GOOGLE_CLIENT_ID}`
      + `&redirect_uri=${encodeURIComponent(redirectUri)}`
      + `&response_type=code`
      + `&scope=openid%20email%20profile`
      + `&access_type=offline`
      + `&prompt=consent`;
    window.location.href = url;
  };

  const handleKakaoLogin = () => {
    const redirectUri = window.location.origin + '/auth/kakao/callback';
    const url = `https://kauth.kakao.com/oauth/authorize`
      + `?client_id=${KAKAO_CLIENT_ID}`
      + `&redirect_uri=${encodeURIComponent(redirectUri)}`
      + `&response_type=code`;
    window.location.href = url;
  };

  const handleNaverLogin = () => {
    const redirectUri = window.location.origin + '/auth/naver/callback';
    const state = Math.random().toString(36).substring(2);
    sessionStorage.setItem('naver_oauth_state', state);
    const url = `https://nid.naver.com/oauth2.0/authorize`
      + `?response_type=code`
      + `&client_id=${NAVER_CLIENT_ID}`
      + `&redirect_uri=${encodeURIComponent(redirectUri)}`
      + `&state=${state}`;
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

          <button className="login-btn kakao-btn" onClick={handleKakaoLogin}>
            <svg className="login-btn-icon" viewBox="0 0 24 24">
              <path d="M12 3C6.48 3 2 6.36 2 10.44c0 2.62 1.75 4.93 4.38 6.24l-1.12 4.16c-.1.36.3.65.6.44l4.97-3.3c.38.04.77.06 1.17.06 5.52 0 10-3.36 10-7.6C22 6.36 17.52 3 12 3z" fill="#3C1E1E"/>
            </svg>
            카카오로 계속하기
          </button>

          <button className="login-btn naver-btn" onClick={handleNaverLogin}>
            <svg className="login-btn-icon" viewBox="0 0 24 24">
              <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z" fill="#fff"/>
            </svg>
            네이버로 계속하기
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
