import { apiClient } from '../../../core/api/apiClient';

export const searchApi = {
  searchByCategory: (category, query, display = 10, start = 1, sort = 'sim') =>
    apiClient.get(
      `/api/search/${category}?query=${encodeURIComponent(query)}&display=${display}&start=${start}&sort=${sort}`
    ),

  searchAll: (query, display = 5, sort = 'sim', period = 'all') =>
    apiClient.get(
      `/api/search/all?query=${encodeURIComponent(query)}&display=${display}&sort=${sort}&period=${period}`
    ),

  trending: (display = 10) =>
    apiClient.get(`/api/search/trending?display=${display}`),

  suggest: (q) =>
    apiClient.get(`/api/search/suggest?q=${encodeURIComponent(q)}`),
};
