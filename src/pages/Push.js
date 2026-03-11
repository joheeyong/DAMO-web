import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Push.css';

function Push() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState('all');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const res = await fetch('/api/fcm/tokens');
      const data = await res.json();
      setTokens(data);
    } catch (e) {
      console.error('Failed to fetch tokens:', e);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !body) return;

    setLoading(true);
    setResult('');

    try {
      const payload = { title, body };
      if (selectedToken !== 'all') {
        payload.token = selectedToken;
      }

      const res = await fetch('/api/fcm/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.status === 'OK') {
        setResult(`전송 성공: ${data.result}`);
        setTitle('');
        setBody('');
      } else {
        setResult(`전송 실패: ${data.message}`);
      }
    } catch (e) {
      setResult(`에러: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="push-page">
      <div className="push-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          &larr; Back
        </button>
        <h1>Push Notification</h1>
        <button className="refresh-btn" onClick={fetchTokens}>
          Refresh
        </button>
      </div>

      <div className="push-content">
        <div className="push-info">
          <h3>등록된 디바이스: {tokens.length}개</h3>
          {tokens.map((t) => (
            <div key={t.id} className="token-item">
              <span className="token-platform">{t.platform}</span>
              <span className="token-value">{t.token.substring(0, 30)}...</span>
            </div>
          ))}
          {tokens.length === 0 && (
            <p className="no-tokens">등록된 디바이스가 없습니다. 앱을 실행해주세요.</p>
          )}
        </div>

        <form className="push-form" onSubmit={handleSend}>
          <div className="form-group">
            <label>대상</label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
            >
              <option value="all">전체 발송</option>
              {tokens.map((t) => (
                <option key={t.id} value={t.token}>
                  {t.platform} - {t.token.substring(0, 20)}...
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>제목</label>
            <input
              type="text"
              placeholder="알림 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>내용</label>
            <textarea
              placeholder="알림 내용"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              required
            />
          </div>

          <button type="submit" className="send-btn" disabled={loading}>
            {loading ? '전송중...' : '푸시 알림 전송'}
          </button>

          {result && (
            <p className={`result ${result.includes('성공') ? 'success' : 'error'}`}>
              {result}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Push;
