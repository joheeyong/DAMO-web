import { apiClient } from '../../../core/api/apiClient';

export const authApi = {
  loginWithGoogle: (code, redirectUri) =>
    apiClient.post('/api/auth/google', { code, redirectUri }),

  loginWithNaver: (code, state, redirectUri) =>
    apiClient.post('/api/auth/naver', { code, state, redirectUri }),

  getMe: () => apiClient.get('/api/auth/me'),
};
