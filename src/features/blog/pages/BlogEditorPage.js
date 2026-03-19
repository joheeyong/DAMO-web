import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { blogApi } from '../api/blogApi';
import './BlogEditorPage.css';

function BlogToolbar({ editor }) {
  const addImage = useCallback(() => {
    if (!editor) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지는 5MB 이하만 업로드 가능합니다.');
        return;
      }
      try {
        const { url } = await blogApi.uploadImage(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch {
        alert('이미지 업로드에 실패했습니다.');
      }
    };
    input.click();
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('링크 URL을 입력하세요:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="blog-toolbar">
      <button
        type="button"
        className={editor.isActive('bold') ? 'active' : ''}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="굵게"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        className={editor.isActive('italic') ? 'active' : ''}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="기울임"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="제목"
      >
        H2
      </button>
      <button
        type="button"
        className={editor.isActive('heading', { level: 3 }) ? 'active' : ''}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="소제목"
      >
        H3
      </button>
      <button
        type="button"
        className={editor.isActive('blockquote') ? 'active' : ''}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="인용"
      >
        "
      </button>
      <button
        type="button"
        className={editor.isActive('codeBlock') ? 'active' : ''}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        title="코드"
      >
        {'</>'}
      </button>
      <button type="button" onClick={addImage} title="이미지">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      </button>
      <button type="button" onClick={addLink} title="링크" className={editor.isActive('link') ? 'active' : ''}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      </button>
      <button
        type="button"
        className={editor.isActive('bulletList') ? 'active' : ''}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="목록"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
      </button>
    </div>
  );
}

function BlogEditorPage() {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: '내용을 입력하세요...' }),
    ],
    content: '',
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (editId) {
      blogApi.getPost(editId).then((post) => {
        setTitle(post.title || '');
        setTags(post.tags || '');
        setCoverImage(post.coverImage || '');
        if (editor) editor.commands.setContent(post.content || '');
      }).catch(() => navigate('/search'));
    }
  }, [token, editId, editor, navigate]);

  const handleCoverUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지는 5MB 이하만 업로드 가능합니다.');
      return;
    }
    setCoverUploading(true);
    try {
      const { url } = await blogApi.uploadImage(file);
      setCoverImage(url);
    } catch {
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setCoverUploading(false);
    }
  }, []);

  const handleSave = useCallback(async (status) => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    const content = editor?.getHTML() || '';
    if (status === 'PUBLISHED' && content === '<p></p>') {
      alert('내용을 입력해주세요.');
      return;
    }
    setSaving(true);
    try {
      const data = { title: title.trim(), content, tags: tags.trim(), coverImage, status };
      if (editId) {
        await blogApi.updatePost(editId, data);
      } else {
        await blogApi.createPost(data);
      }
      navigate(status === 'PUBLISHED' ? '/search' : '/profile');
    } catch {
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }, [title, tags, coverImage, editor, editId, navigate]);

  return (
    <div className="blog-editor-page">
      <header className="blog-editor-header">
        <button className="blog-editor-back" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="blog-editor-actions">
          <button
            className="blog-editor-draft-btn"
            onClick={() => handleSave('DRAFT')}
            disabled={saving}
          >
            임시저장
          </button>
          <button
            className="blog-editor-publish-btn"
            onClick={() => handleSave('PUBLISHED')}
            disabled={saving}
          >
            {saving ? '저장중...' : '발행'}
          </button>
        </div>
      </header>

      <div className="blog-editor-body">
        <input
          className="blog-editor-title"
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={300}
        />

        <div className="blog-editor-cover">
          {coverImage ? (
            <div className="blog-editor-cover-preview">
              <img src={coverImage} alt="커버" />
              <button onClick={() => setCoverImage('')} className="blog-editor-cover-remove">X</button>
            </div>
          ) : (
            <label className="blog-editor-cover-upload">
              <input type="file" accept="image/*" onChange={handleCoverUpload} hidden />
              {coverUploading ? '업로드중...' : '+ 커버 이미지'}
            </label>
          )}
        </div>

        <BlogToolbar editor={editor} />
        <EditorContent editor={editor} className="blog-editor-content" />

        <input
          className="blog-editor-tags"
          type="text"
          placeholder="태그 (쉼표로 구분: 여행, 맛집, 일상)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>
    </div>
  );
}

export default BlogEditorPage;
