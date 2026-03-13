import { apiClient } from '../../../core/api/apiClient';

// Request Reddit data via Flutter proxy (bypasses AWS IP block)
let redditCallCounter = 0;
function fetchRedditViaFlutter(url) {
  return new Promise((resolve) => {
    if (!window.DamoReddit) return resolve(null);
    const callbackId = `reddit_${Date.now()}_${redditCallCounter++}`;
    window[callbackId] = (json) => {
      delete window[callbackId];
      try { resolve(JSON.parse(json)); } catch { resolve(null); }
    };
    window.DamoReddit.postMessage(JSON.stringify({ url, callback: callbackId }));
    setTimeout(() => { if (window[callbackId]) { delete window[callbackId]; resolve(null); } }, 4000);
  });
}

function isInApp() {
  return typeof window !== 'undefined' && !!window.DamoReddit;
}

async function searchAllWithReddit(query, display = 5, sort = 'sim', period = 'all') {
  const serverPromise = apiClient.get(
    `/api/search/all?query=${encodeURIComponent(query)}&display=${display}&sort=${sort}&period=${period}`
  );

  // In Flutter app: fetch Reddit via Flutter proxy in parallel (non-blocking)
  let redditPromise = null;
  if (isInApp()) {
    const redditSort = sort === 'date' ? 'new' : 'relevance';
    const timeMap = { '1d': 'day', '1w': 'week', '1m': 'month' };
    const t = timeMap[period] || 'all';
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=${display}&sort=${redditSort}&t=${t}`;
    // Race: return server results after max 2s wait for Reddit
    redditPromise = Promise.race([
      fetchRedditViaFlutter(url),
      new Promise((r) => setTimeout(() => r(null), 2000)),
    ]);
  }

  const [serverResults, redditData] = await Promise.all([
    serverPromise,
    redditPromise || Promise.resolve(null),
  ]);

  if (redditData) {
    serverResults.reddit = redditData;
  }

  return serverResults;
}

export const searchApi = {
  searchByCategory: (category, query, display = 10, start = 1, sort = 'sim') =>
    apiClient.get(
      `/api/search/${category}?query=${encodeURIComponent(query)}&display=${display}&start=${start}&sort=${sort}`
    ),

  searchAll: searchAllWithReddit,

  // Trending: no Reddit (keep initial load fast)
  trending: (display = 10) =>
    apiClient.get(`/api/search/trending?display=${display}`),

  suggest: (q) =>
    apiClient.get(`/api/search/suggest?q=${encodeURIComponent(q)}`),
};
