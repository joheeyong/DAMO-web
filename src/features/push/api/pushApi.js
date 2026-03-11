import { apiClient } from '../../../core/api/apiClient';

export const pushApi = {
  fetchTokens: () => apiClient.get('/api/fcm/tokens'),
  sendNotification: (payload) => apiClient.post('/api/fcm/send', payload),
};
