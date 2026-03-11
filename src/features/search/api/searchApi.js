import { apiClient } from '../../../core/api/apiClient';

export const searchApi = {
  searchByCategory: (category, query, display = 10, start = 1, sort = 'sim') =>
    apiClient.get(
      `/api/search/${category}?query=${encodeURIComponent(query)}&display=${display}&start=${start}&sort=${sort}`
    ),

  searchAll: (query, display = 5) =>
    apiClient.get(
      `/api/search/all?query=${encodeURIComponent(query)}&display=${display}`
    ),
};
