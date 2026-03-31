import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { socialFeedApi } from '../api/socialFeedApi';
import './SocialComposePage.css';

function SocialComposePage() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]); // [{url, type}]
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const removeMedia = useCallback((idx) => {
    setMedia((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleMediaUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const isVideo = file.type.startsWith('video/');
        if (isVideo && file.size > 50 * 1024 * 1024) {
          alert('동영상은 50MB 이하만 업로드 가능합니다.');
          continue;
        }
        if (!isVideo && file.size > 5 * 1024 * 1024) {
          alert('이미지는 5MB 이하만 업로드 가능합니다.');
          continue;
        }
        const result = await socialFeedApi.uploadMedia(file);
        setMedia((prev) => [...prev, { url: result.url, type: result.type }]);
      }
    } catch {
      alert('업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  }, []);

  if (!token) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async () => {
    if (!content.trim() && media.length === 0) {
      alert('내용 또는 미디어를 추가해주세요.');
      return;
    }
    setSaving(true);
    try {
      await socialFeedApi.createPost({
        content: content.trim(),
        images: JSON.stringify(media),
      });
      navigate('/feed');
    } catch {
      alert('게시에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="social-compose-page">
      <header className="social-compose-header">
        <button className="social-compose-back" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="social-compose-title">새 게시물</span>
        <button
          className="social-compose-submit"
          onClick={handleSubmit}
          disabled={saving || (!content.trim() && media.length === 0)}
        >
          {saving ? '게시중...' : '게시'}
        </button>
      </header>

      <div className="social-compose-body">
        <textarea
          className="social-compose-input"
          placeholder="무슨 생각을 하고 계신가요?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          autoFocus
        />

        {media.length > 0 && (
          <div className="social-compose-media-grid">
            {media.map((m, idx) => (
              <div key={idx} className="social-compose-media-item">
                {m.type === 'video' ? (
                  <video src={m.url} className="social-compose-media-thumb" />
                ) : (
                  <img src={m.url} alt="" className="social-compose-media-thumb" />
                )}
                <button className="social-compose-media-remove" onClick={() => removeMedia(idx)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                {m.type === 'video' && (
                  <div className="social-compose-video-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="social-compose-toolbar">
        <label className="social-compose-attach">
          <input
            type="file"
            accept="image/*,video/mp4,video/webm,video/quicktime"
            multiple
            onChange={handleMediaUpload}
            hidden
          />
          {uploading ? (
            <span className="social-compose-uploading">업로드중...</span>
          ) : (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>사진/동영상</span>
            </>
          )}
        </label>
        <span className="social-compose-count">{content.length}/2000</span>
      </div>
    </div>
  );
}

export default SocialComposePage;
