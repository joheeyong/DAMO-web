import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTokens, sendNotification, clearSendResult } from '../slice/pushSlice';
import './PushPage.css';

function PushPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tokens, sendLoading, sendResult } = useSelector((state) => state.push);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedToken, setSelectedToken] = useState('all');

  useEffect(() => {
    dispatch(fetchTokens());
  }, [dispatch]);

  useEffect(() => {
    if (sendResult?.status === 'OK') {
      setTitle('');
      setBody('');
    }
  }, [sendResult]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!title || !body) return;
    dispatch(clearSendResult());
    dispatch(sendNotification({ title, body, token: selectedToken }));
  };

  const resultText = sendResult
    ? sendResult.status === 'OK'
      ? `전송 성공: ${sendResult.result}`
      : `전송 실패: ${sendResult.message}`
    : '';

  return (
    <div className="push-page">
      <div className="push-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          &larr; Back
        </button>
        <h1>Push Notification</h1>
        <button className="refresh-btn" onClick={() => dispatch(fetchTokens())}>
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

          <button type="submit" className="send-btn" disabled={sendLoading}>
            {sendLoading ? '전송중...' : '푸시 알림 전송'}
          </button>

          {resultText && (
            <p className={`result ${resultText.includes('성공') ? 'success' : 'error'}`}>
              {resultText}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default PushPage;
