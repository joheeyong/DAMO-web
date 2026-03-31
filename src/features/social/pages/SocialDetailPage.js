import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { socialFeedApi } from '../api/socialFeedApi';
import './SocialDetailPage.css';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  return d.toLocaleDateString('ko-KR');
}

function MediaGallery({ media }) {
  const [current, setCurrent] = useState(0);
  if (!media || media.length === 0) return null;

  return (
    <div className="social-gallery">
      <div className="social-gallery-main">
        {media[current].type === 'video' ? (
          <video
            src={media[current].url}
            controls
            playsInline
            className="social-gallery-media"
          />
        ) : (
          <img src={media[current].url} alt="" className="social-gallery-media" />
        )}
      </div>
      {media.length > 1 && (
        <div className="social-gallery-dots">
          {media.map((_, idx) => (
            <button
              key={idx}
              className={`social-gallery-dot ${idx === current ? 'active' : ''}`}
              onClick={() => setCurrent(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentSection({ postId }) {
  const { token, user } = useSelector((state) => state.auth);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    socialFeedApi.getComments(postId).then(setComments).catch(() => {});
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const newComment = await socialFeedApi.addComment(postId, text.trim());
      setComments((prev) => [...prev, newComment]);
      setText('');
    } catch {
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await socialFeedApi.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="social-comments">
      <h3 className="social-comments-title">댓글 {comments.length}</h3>
      <div className="social-comments-list">
        {comments.map((c) => (
          <div key={c.id} className="social-comment-item">
            <div className="social-comment-avatar">
              {c.authorImage ? (
                <img src={c.authorImage} alt="" />
              ) : (
                <div className="social-comment-avatar-placeholder" />
              )}
            </div>
            <div className="social-comment-body">
              <div className="social-comment-header">
                <span className="social-comment-author">{c.authorName || '익명'}</span>
                <span className="social-comment-time">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="social-comment-text">{c.content}</p>
            </div>
            {user && user.id === c.userId && (
              <button className="social-comment-delete" onClick={() => handleDelete(c.id)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
      {token && (
        <form className="social-comment-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="댓글을 입력하세요..."
            maxLength={500}
          />
          <button type="submit" disabled={!text.trim() || sending}>
            {sending ? '...' : '등록'}
          </button>
        </form>
      )}
    </div>
  );
}

function LikeButton({ postId }) {
  const { token } = useSelector((state) => state.auth);
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (token) {
      socialFeedApi.checkLike(postId).then((r) => {
        setLiked(r.liked);
        setCount(r.likeCount);
      }).catch(() => {});
    }
  }, [postId, token]);

  const handleLike = useCallback(async () => {
    if (!token) return;
    setLiked((prev) => !prev);
    setCount((prev) => (liked ? prev - 1 : prev + 1));
    try {
      const r = await socialFeedApi.toggleLike(postId);
      setLiked(r.liked);
      setCount(r.likeCount);
    } catch {}
  }, [postId, token, liked]);

  return (
    <button className={`social-like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill={liked ? '#ef4444' : 'none'} stroke={liked ? '#ef4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      <span>{count > 0 ? count : ''}</span>
    </button>
  );
}

function SocialDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socialFeedApi.getPost(id)
      .then(setPost)
      .catch(() => navigate('/feed'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="social-detail-loading">
        <div className="social-detail-spinner" />
      </div>
    );
  }

  if (!post) return null;

  let media = [];
  try {
    const parsed = typeof post.images === 'string' ? JSON.parse(post.images) : post.images;
    media = Array.isArray(parsed) ? parsed : [];
  } catch {}

  const handleDelete = async () => {
    if (!window.confirm('게시물을 삭제하시겠습니까?')) return;
    try {
      await socialFeedApi.deletePost(post.id);
      navigate('/feed');
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="social-detail-page">
      <header className="social-detail-header">
        <button className="social-detail-back" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="social-detail-header-title">게시물</span>
        <div style={{ width: 32 }} />
      </header>

      <div className="social-detail-body">
        <div className="social-detail-author">
          <div className="social-detail-avatar">
            {post.authorImage ? (
              <img src={post.authorImage} alt="" />
            ) : (
              <div className="social-detail-avatar-placeholder" />
            )}
          </div>
          <div className="social-detail-author-info">
            <span className="social-detail-author-name">{post.authorName || '익명'}</span>
            <span className="social-detail-time">{timeAgo(post.createdAt)}</span>
          </div>
          {user && user.id === post.userId && (
            <button className="social-detail-delete" onClick={handleDelete}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14H7L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
              </svg>
            </button>
          )}
        </div>

        <div className="social-detail-content">
          <p>{post.content}</p>
        </div>

        {media.length > 0 && <MediaGallery media={media} />}

        <div className="social-detail-actions">
          <LikeButton postId={post.id} />
        </div>

        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}

export default SocialDetailPage;
