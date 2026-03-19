import { apiClient } from '../../../core/api/apiClient';

export const blogApi = {
  createPost: (data) => apiClient.post('/api/blog/posts', data),
  updatePost: (id, data) => apiClient.put(`/api/blog/posts/${id}`, data),
  deletePost: (id) => apiClient.del(`/api/blog/posts/${id}`),
  getPost: (id) => apiClient.get(`/api/blog/posts/${id}`),
  getMyPosts: () => apiClient.get('/api/blog/posts/me'),
  getFeed: (page = 0, size = 10) => apiClient.get(`/api/blog/feed?page=${page}&size=${size}`),
  searchPosts: (q, page = 0) => apiClient.get(`/api/blog/search?q=${encodeURIComponent(q)}&page=${page}`),
  uploadImage: (file) => {
    const form = new FormData();
    form.append('file', file);
    const token = localStorage.getItem('auth_token');
    return fetch('/api/blog/images/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then((r) => {
      if (!r.ok) throw new Error('Upload failed');
      return r.json();
    });
  },
  getComments: (postId) => apiClient.get(`/api/blog/posts/${postId}/comments`),
  addComment: (postId, content) => apiClient.post(`/api/blog/posts/${postId}/comments`, { content }),
  deleteComment: (commentId) => apiClient.del(`/api/blog/comments/${commentId}`),
  toggleLike: (postId) => apiClient.post(`/api/blog/posts/${postId}/like`),
  checkLike: (postId) => apiClient.get(`/api/blog/posts/${postId}/like`),
};
