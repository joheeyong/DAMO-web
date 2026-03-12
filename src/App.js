import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './features/landing/pages/LandingPage';
import MapsPage from './features/maps/pages/MapsPage';
import PushPage from './features/push/pages/PushPage';
import SearchPage from './features/search/pages/SearchPage';
import TermsPage from './features/legal/pages/TermsPage';
import PrivacyPage from './features/legal/pages/PrivacyPage';
import LoginPage from './features/auth/pages/LoginPage';
import OAuthCallbackPage from './features/auth/pages/OAuthCallbackPage';
import NaverCallbackPage from './features/auth/pages/NaverCallbackPage';
import KakaoCallbackPage from './features/auth/pages/KakaoCallbackPage';
import ProfilePage from './features/auth/pages/ProfilePage';
import OnboardingInterestsPage from './features/auth/pages/OnboardingInterestsPage';
import BottomNav from './components/BottomNav';
import { fetchMe } from './features/auth/slice/authSlice';

const SHOW_NAV_PATHS = ['/search', '/maps', '/profile', '/login'];

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchMe());
    }
  }, [dispatch, token, user]);

  const showNav = SHOW_NAV_PATHS.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/maps" element={<MapsPage />} />
        <Route path="/push" element={<PushPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/onboarding/interests" element={<OnboardingInterestsPage />} />
        <Route path="/auth/google/callback" element={<OAuthCallbackPage />} />
        <Route path="/auth/naver/callback" element={<NaverCallbackPage />} />
        <Route path="/auth/kakao/callback" element={<KakaoCallbackPage />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  );
}

export default App;
