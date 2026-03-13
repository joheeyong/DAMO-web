import { apiClient } from '../../../core/api/apiClient';

// Request Reddit data via Flutter proxy (bypasses AWS IP block)
function fetchRedditViaFlutter(url) {
  return new Promise((resolve) => {
    if (!window.DamoReddit) return resolve(null);
    const callbackId = `reddit_${Date.now()}`;
    window[callbackId] = (json) => {
      delete window[callbackId];
      try { resolve(JSON.parse(json)); } catch { resolve(null); }
    };
    window.DamoReddit.postMessage(JSON.stringify({ url, callback: callbackId }));
    // Timeout after 5s
    setTimeout(() => { if (window[callbackId]) { delete window[callbackId]; resolve(null); } }, 5000);
  });
}

const inApp = typeof window !== 'undefined' && !!window.DamoReady;

async function searchAllWithReddit(query, display = 5, sort = 'sim', period = 'all') {
  const serverPromise = apiClient.get(
    `/api/search/all?query=${encodeURIComponent(query)}&display=${display}&sort=${sort}&period=${period}`
  );

  // In Flutter app: fetch Reddit via Flutter proxy in parallel
  let redditPromise = null;
  if (inApp) {
    const redditSort = sort === 'date' ? 'new' : 'relevance';
    const timeMap = { '1d': 'day', '1w': 'week', '1m': 'month' };
    const t = timeMap[period] || 'all';
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=${display}&sort=${redditSort}&t=${t}`;
    redditPromise = fetchRedditViaFlutter(url);
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

async function trendingWithReddit(display = 10) {
  const serverPromise = apiClient.get(`/api/search/trending?display=${display}`);

  let redditPromise = null;
  if (inApp) {
    const url = `https://www.reddit.com/r/popular.json?limit=${display}&t=day`;
    redditPromise = fetchRedditViaFlutter(url);
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

  trending: trendingWithReddit,

  suggest: (q) =>
    apiClient.get(`/api/search/suggest?q=${encodeURIComponent(q)}`),
};
