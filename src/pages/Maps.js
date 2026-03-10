import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Maps.css';

const NAVER_CLIENT_ID = process.env.REACT_APP_NAVER_MAP_CLIENT_ID;

function Maps() {
  const mapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!NAVER_CLIENT_ID) {
      console.error('Naver Map Client ID is not set');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_CLIENT_ID}`;
    script.async = true;
    script.onload = () => {
      const { naver } = window;
      if (!naver || !mapRef.current) return;

      const defaultCenter = new naver.maps.LatLng(37.5665, 126.978);

      const map = new naver.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 14,
        mapTypeControl: true,
        zoomControl: true,
        zoomControlOptions: {
          position: naver.maps.Position.TOP_RIGHT,
        },
      });

      const marker = new naver.maps.Marker({
        position: defaultCenter,
        map: map,
        icon: {
          url: '/favicon.svg',
          size: new naver.maps.Size(40, 40),
          scaledSize: new naver.maps.Size(40, 40),
          anchor: new naver.maps.Point(20, 20),
        },
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLatLng = new naver.maps.LatLng(
              position.coords.latitude,
              position.coords.longitude
            );
            map.setCenter(userLatLng);
            marker.setPosition(userLatLng);
          },
          (error) => {
            console.warn('Geolocation failed:', error.message);
          }
        );
      }
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

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

export default Maps;
