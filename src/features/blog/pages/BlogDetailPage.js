import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DOMPurify from 'dompurify';
import { blogApi } from '../api/blogApi';
import { analytics, logEvent } from '../../../core/firebase';
import './BlogDetailPage.css';

function CommentSection({ postId, token }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const userId = useSelector((state) => state.auth.user?.id);

  const loadComments = useCallback(() => {
    blogApi.getComments(postId).then(setComments).catch(() => {});
  }, [postId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      await blogApi.addComment(postId, newComment.trim());
      setNewComment('');
      loadComments();
    } catch {
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await blogApi.deleteComment(commentId);
      loadComments();
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="blog-comments">
      <h3 className="blog-comments-title">댓글 {comments.length}개</h3>
      <div className="blog-comments-list">
        {comments.map((c) => (
          <div key={c.id} className="blog-comment">
            <div className="blog-comment-header">
              {c.authorImage && <img src={c.authorImage} alt="" className="blog-comment-avatar" />}
              <span className="blog-comment-name">{c.authorName || '익명'}</span>
              <span className="blog-comment-date">
                {c.createdAt ? new Date(c.createdAt).toLocaleDateString('ko-KR') : ''}
              </span>
              {userId && c.userId === userId && (
                <button className="blog-comment-delete" onClick={() => handleDelete(c.id)}>삭제</button>
              )}
            </div>
            <p className="blog-comment-body">{c.content}</p>
          </div>
        ))}
      </div>
      {token ? (
        <form className="blog-comment-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="댓글을 입력하세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            maxLength={500}
          />
          <button type="submit" disabled={submitting || !newComment.trim()}>
            {submitting ? '...' : '등록'}
          </button>
        </form>
      ) : (
        <p className="blog-comment-login">댓글을 작성하려면 로그인이 필요합니다.</p>
      )}
    </div>
  );
}

function LikeButton({ postId, token }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (token) {
      blogApi.checkLike(postId).then((res) => {
        setLiked(res.liked);
        setCount(res.likeCount);
      }).catch(() => {});
    }
  }, [postId, token]);

  const handleToggle = async () => {
    if (!token) return;
    try {
      const res = await blogApi.toggleLike(postId);
      setLiked(res.liked);
      setCount(res.likeCount);
    } catch {}
  };

  return (
    <button className={`blog-like-btn ${liked ? 'liked' : ''}`} onClick={handleToggle}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill={liked ? '#ef4444' : 'none'} stroke={liked ? '#ef4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span>{count}</span>
    </button>
  );
}

function BlogDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token, user } = useSelector((state) => state.auth);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logEvent(analytics, 'page_view', { page_title: 'BlogDetail', page_path: `/blog/${id}` });
    blogApi.getPost(id)
      .then(setPost)
      .catch(() => navigate('/search', { replace: true }))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/search');
  };

  if (loading) {
    return (
      <div className="blog-detail-loading">
        <div className="blog-detail-spinner" />
      </div>
    );
  }

  if (!post) return null;

  const isOwner = user && post.userId === user.id;

  return (
    <div className="blog-detail-page">
      <header className="blog-detail-header">
        <button className="blog-detail-back" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="blog-detail-header-badge">DAMO</div>
        <div className="blog-detail-header-spacer">
          {isOwner && (
            <button className="blog-detail-edit-btn" onClick={() => navigate(`/blog/edit/${post.id}`)}>
              수정
            </button>
          )}
        </div>
      </header>

      {post.coverImage && (
        <div className="blog-detail-cover">
          <img src={post.coverImage} alt="" />
        </div>
      )}

      <article className="blog-detail-body">
        <h1 className="blog-detail-title">{post.title}</h1>
        <div className="blog-detail-meta">
          <div className="blog-detail-author">
            {post.authorImage && <img src={post.authorImage} alt="" className="blog-detail-avatar" />}
            <span>{post.authorName || '익명'}</span>
          </div>
          <span className="blog-detail-date">
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('ko-KR') : ''}
          </span>
          <span className="blog-detail-views">조회 {post.viewCount || 0}</span>
        </div>

        {post.tags && (
          <div className="blog-detail-tags">
            {post.tags.split(',').filter(Boolean).map((tag) => (
              <span key={tag.trim()} className="blog-detail-tag">#{tag.trim()}</span>
            ))}
          </div>
        )}

        <div
          className="blog-detail-content"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />

        <div className="blog-detail-actions">
          <LikeButton postId={post.id} token={token} />
        </div>
      </article>

      <CommentSection postId={post.id} token={token} />
    </div>
  );
}

export default BlogDetailPage;
