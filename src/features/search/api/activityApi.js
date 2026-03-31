import { apiClient } from '../../../core/api/apiClient';

export const activityApi = {
  recordSearch: (query) =>
    apiClient.post('/api/activity/search', { query }),

  recordClick: (contentId, platform, sourceKeyword) =>
    apiClient.post('/api/activity/click', { contentId, platform, sourceKeyword: sourceKeyword || '' }),

  rankItems: (items) =>
    apiClient.post('/api/activity/rank', {
      items: items.map((i) => ({
        id: i.id,
        platform: i.platform,
        title: i.title,
        sourceKeyword: i.sourceKeyword || '',
      })),
    }),

  getRecommendations: () => apiClient.get('/api/activity/recommendations'),
};
