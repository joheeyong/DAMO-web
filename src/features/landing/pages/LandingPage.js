import { useState, useEffect } from 'react';
import './LandingPage.css';

function LandingPage() {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const launchDate = new Date('2026-06-01T00:00:00');

    const timer = setInterval(() => {
      const now = new Date();
      const diff = launchDate - now;

      if (diff <= 0) {
        clearInterval(timer);
        return;
      }

      setDays(Math.floor(diff / (1000 * 60 * 60 * 24)));
      setHours(Math.floor((diff / (1000 * 60 * 60)) % 24));
      setMinutes(Math.floor((diff / (1000 * 60)) % 60));
      setSeconds(Math.floor((diff / 1000) % 60));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail('');
  };

  return (
    <div className="App">
      <div className="bg-gradient" />
      <div className="bg-noise" />

      <div className="content">
        <div className="logo-area">
          <img src="/favicon.svg" alt="DAMO" className="logo" />
        </div>

        <h1 className="title">
          <span className="title-kr">다모</span>
          <span className="title-en">DAMO</span>
        </h1>

        <p className="subtitle">
          새로운 경험을 준비하고 있습니다
        </p>

        <div className="countdown">
          <div className="countdown-item">
            <span className="countdown-number">{String(days).padStart(2, '0')}</span>
            <span className="countdown-label">DAYS</span>
          </div>
          <span className="countdown-separator">:</span>
          <div className="countdown-item">
            <span className="countdown-number">{String(hours).padStart(2, '0')}</span>
            <span className="countdown-label">HOURS</span>
          </div>
          <span className="countdown-separator">:</span>
          <div className="countdown-item">
            <span className="countdown-number">{String(minutes).padStart(2, '0')}</span>
            <span className="countdown-label">MIN</span>
          </div>
          <span className="countdown-separator">:</span>
          <div className="countdown-item">
            <span className="countdown-number">{String(seconds).padStart(2, '0')}</span>
            <span className="countdown-label">SEC</span>
          </div>
        </div>

        <div className="notify-section">
          {submitted ? (
            <p className="notify-success">
              Thank you! We'll notify you when we launch.
            </p>
          ) : (
            <form className="notify-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Notify Me</button>
            </form>
          )}
        </div>

        <div className="features">
          <div className="feature-item">
            <div className="feature-icon">&#9889;</div>
            <h3>Fast</h3>
            <p>빠르고 안정적인 서비스</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">&#128274;</div>
            <h3>Secure</h3>
            <p>안전한 데이터 보호</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">&#127760;</div>
            <h3>Global</h3>
            <p>어디서나 접근 가능</p>
          </div>
        </div>

        <footer className="footer">
          <p>&copy; 2026 DAMO. All rights reserved. | Made with passion</p>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;
