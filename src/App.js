import { Routes, Route } from 'react-router-dom';
import LandingPage from './features/landing/pages/LandingPage';
import MapsPage from './features/maps/pages/MapsPage';
import PushPage from './features/push/pages/PushPage';
import SearchPage from './features/search/pages/SearchPage';
import TermsPage from './features/legal/pages/TermsPage';
import PrivacyPage from './features/legal/pages/PrivacyPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/maps" element={<MapsPage />} />
      <Route path="/push" element={<PushPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
    </Routes>
  );
}

export default App;
