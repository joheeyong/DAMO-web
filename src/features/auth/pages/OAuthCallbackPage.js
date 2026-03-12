import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleLogin } from '../slice/authSlice';

function OAuthCallbackPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      const redirectUri = window.location.origin + '/auth/google/callback';
      dispatch(googleLogin({ code, redirectUri }))
        .unwrap()
        .then((data) => {
          const interests = data.user?.interests;
          if (!interests) {
            navigate('/onboarding/interests');
          } else {
            navigate('/search');
          }
        })
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
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 12px',
        }} />
        <p>로그인 중...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default OAuthCallbackPage;
