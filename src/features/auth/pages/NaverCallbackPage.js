import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { naverLogin } from '../slice/authSlice';

function NaverCallbackPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    if (code && state) {
      const redirectUri = window.location.origin + '/auth/naver/callback';
      dispatch(naverLogin({ code, state, redirectUri }))
        .unwrap()
        .then(() => navigate('/search'))
        .catch(() => navigate('/login'));
    } else {
      navigate('/login');
    }
  }, [dispatch, navigate, searchParams]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center', color: '#86868b' }}>
        <div className="spinner" style={{
          width: 32, height: 32,
          border: '3px solid #e5e5e7',
          borderTopColor: '#03c75a',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 12px',
        }} />
        <p>네이버 로그인 중...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default NaverCallbackPage;
