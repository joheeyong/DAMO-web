import { apiClient } from '../../../core/api/apiClient';

export const socialFeedApi = {
  createPost: (data) => apiClient.post('/api/social/posts', data),
  deletePost: (id) => apiClient.del(`/api/social/posts/${id}`),
  getPost: (id) => apiClient.get(`/api/social/posts/${id}`),
  getFeed: (page = 0, size = 20) => apiClient.get(`/api/social/feed?page=${page}&size=${size}`),
  getMyPosts: () => apiClient.get('/api/social/posts/me'),
  uploadMedia: (file) => {
    const form = new FormData();
    form.append('file', file);
    const token = localStorage.getItem('auth_token');
    return fetch('/api/social/media/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then((r) => {
      if (!r.ok) throw new Error('Upload failed');
      return r.json();
    });
  },
  getComments: (postId) => apiClient.get(`/api/social/posts/${postId}/comments`),
  addComment: (postId, content) => apiClient.post(`/api/social/posts/${postId}/comments`, { content }),
  deleteComment: (commentId) => apiClient.del(`/api/social/comments/${commentId}`),
  toggleLike: (postId) => apiClient.post(`/api/social/posts/${postId}/like`),
  checkLike: (postId) => apiClient.get(`/api/social/posts/${postId}/like`),
};
