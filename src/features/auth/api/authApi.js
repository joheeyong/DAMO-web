import { apiClient } from '../../../core/api/apiClient';

export const authApi = {
  loginWithGoogle: (code, redirectUri) =>
    apiClient.post('/api/auth/google', { code, redirectUri }),

  getMe: () => apiClient.get('/api/auth/me'),
};
