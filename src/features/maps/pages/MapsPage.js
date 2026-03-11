import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNaverMap } from '../hooks/useNaverMap';
import './MapsPage.css';

function MapsPage() {
  const mapRef = useRef(null);
  const navigate = useNavigate();

  useNaverMap(mapRef);

  return (
    <div className="maps-page">
      <div className="maps-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          &larr; Back
        </button>
        <h1>DAMO Maps</h1>
      </div>
      <div ref={mapRef} className="map-container" />
    </div>
  );
}

export default MapsPage;
