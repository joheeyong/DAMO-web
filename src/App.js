import { Routes, Route } from 'react-router-dom';
import LandingPage from './features/landing/pages/LandingPage';
import MapsPage from './features/maps/pages/MapsPage';
import PushPage from './features/push/pages/PushPage';
import SearchPage from './features/search/pages/SearchPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/maps" element={<MapsPage />} />
      <Route path="/push" element={<PushPage />} />
    </Routes>
  );
}

export default App;
