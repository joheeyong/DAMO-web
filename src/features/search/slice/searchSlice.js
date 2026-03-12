import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchApi } from '../api/searchApi';

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'shorts', label: 'Shorts' },
  { key: 'youtube', label: '유튜브' },
  { key: 'blog', label: '블로그' },
  { key: 'news', label: '뉴스' },
  { key: 'cafe', label: '카페' },
  { key: 'shop', label: '쇼핑' },
  { key: 'image', label: '이미지' },
  { key: 'kin', label: '지식iN' },
  { key: 'book', label: '도서' },
  { key: 'webkr', label: '웹문서' },
  { key: 'reddit', label: 'Reddit' },
];

export { FILTERS };

function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, '') || '';
}

function normalizeItems(rawResults) {
  const items = [];

  for (const [category, raw] of Object.entries(rawResults)) {
    if (category === 'keyword') continue;
    let data;
    try {
      data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      continue;
    }

    if (category === 'youtube' || category === 'shorts') {
      const ytItems = data.items || [];
      ytItems.forEach((item) => {
        const snippet = item.snippet || {};
        const videoId = item.id?.videoId || item.id;
        items.push({
          id: `${category}-${videoId}`,
          platform: category,
          title: snippet.title || '',
          description: snippet.description || '',
          link: category === 'shorts'
            ? `https://www.youtube.com/shorts/${videoId}`
            : `https://www.youtube.com/watch?v=${videoId}`,
          image: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || '',
          author: snippet.channelTitle || '',
          date: snippet.publishedAt?.substring(0, 10) || '',
          extra: item.statistics || null,
        });
      });
    } else if (category === 'reddit') {
      const children = data.data?.children || [];
      children.forEach((child) => {
        const post = child.data || {};
        if (post.stickied) return;
        const thumbnail =
          post.thumbnail && post.thumbnail !== 'self' && post.thumbnail !== 'default' && post.thumbnail !== 'nsfw'
            ? post.thumbnail
            : '';
        items.push({
          id: `reddit-${post.id}`,
          platform: 'reddit',
          title: post.title || '',
          description: post.selftext?.substring(0, 200) || '',
          link: `https://www.reddit.com${post.permalink}`,
          image: thumbnail,
          author: post.author || '',
          date: post.created_utc ? new Date(post.created_utc * 1000).toISOString().substring(0, 10) : '',
          extra: {
            subreddit: post.subreddit_name_prefixed || '',
            score: post.score || 0,
            numComments: post.num_comments || 0,
          },
        });
      });
    } else {
      const naverItems = data.items || [];
      naverItems.forEach((item, idx) => {
        items.push({
          id: `${category}-${idx}-${item.link}`,
          platform: category,
          title: stripHtml(item.title),
          description: stripHtml(item.description),
          link: item.link || '',
          image: item.image || item.thumbnail || '',
          author: item.bloggername || item.cafename || item.mallName || item.author || item.publisher || '',
          date: item.postdate || item.pubDate?.substring(0, 16) || '',
          extra: {
            price: item.lprice,
            discount: item.discount,
            category1: item.category1,
          },
        });
      });
    }
  }

  // Shuffle for mixed feed
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items;
}

export const searchAll = createAsyncThunk(
  'search/searchAll',
  async ({ query, display = 5 }) => {
    const raw = await searchApi.searchAll(query, display);
    return { query, items: normalizeItems(raw) };
  }
);

export const fetchTrending = createAsyncThunk(
  'search/fetchTrending',
  async (_, { getState }) => {
    const { auth } = getState();
    const userInterests = auth.user?.interests
      ? auth.user.interests.split(',').filter(Boolean)
      : [];

    // Always fetch trending
    const trendingPromise = searchApi.trending(10);

    // If user has interests, also search 2 random interest keywords
    let interestPromises = [];
    if (userInterests.length > 0) {
      const shuffled = [...userInterests].sort(() => Math.random() - 0.5);
      const picks = shuffled.slice(0, Math.min(2, shuffled.length));
      interestPromises = picks.map((kw) => searchApi.searchAll(kw, 5));
    }

    // Shorts: always fetch Korean shorts (interest keywords + viral for robustness)
    const shortsPool = userInterests.length > 0
      ? [...userInterests, ...VIRAL_KEYWORDS]
      : VIRAL_KEYWORDS;
    const shortsShuffled = [...shortsPool].sort(() => Math.random() - 0.5);
    const shortsPicks = shortsShuffled.slice(0, Math.min(5, shortsShuffled.length));
    const shortsPromises = shortsPicks.map((kw) =>
      searchApi.searchByCategory('shorts', kw, 5).catch(() => null)
    );

    const [trendingRaw, ...rest] = await Promise.all([
      trendingPromise,
      ...interestPromises,
      ...shortsPromises,
    ]);

    const interestResults = rest.slice(0, interestPromises.length);
    const shortsResults = rest.slice(interestPromises.length);

    const trendingItems = normalizeItems(trendingRaw);
    const interestItems = interestResults.flatMap((raw) => normalizeItems(raw));

    // Collect keyword shorts from all attempts
    const keywordShorts = shortsResults.flatMap((raw) => {
      if (!raw) return [];
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return normalizeItems({ shorts: typeof parsed === 'string' ? parsed : JSON.stringify(parsed) });
      } catch {
        return [];
      }
    });
    const seenShorts = new Set();
    const uniqueKeywordShorts = keywordShorts.filter((s) => {
      if (seenShorts.has(s.id)) return false;
      seenShorts.add(s.id);
      return true;
    });

    // Merge: keyword shorts + trending shorts as fallback, always keep some
    const trendingShorts = trendingItems.filter((i) => i.platform === 'shorts');
    const allShorts = uniqueKeywordShorts.length > 0 ? uniqueKeywordShorts : trendingShorts;
    // If keyword shorts exist but few, supplement with trending shorts
    let finalShorts = [...allShorts];
    if (uniqueKeywordShorts.length > 0 && uniqueKeywordShorts.length < 4) {
      const extraIds = new Set(finalShorts.map((s) => s.id));
      trendingShorts.forEach((s) => {
        if (!extraIds.has(s.id)) finalShorts.push(s);
      });
    }
    const finalItems = [...trendingItems.filter((i) => i.platform !== 'shorts'), ...finalShorts];

    // Merge interest items (non-shorts)
    const seenIds = new Set(finalItems.map((i) => i.id));
    const uniqueInterestItems = interestItems.filter((i) => {
      if (seenIds.has(i.id)) return false;
      seenIds.add(i.id);
      return true;
    });

    // Interleave: insert interest items every 3rd position among non-shorts
    const shorts = finalItems.filter((i) => i.platform === 'shorts');
    const nonShorts = finalItems.filter((i) => i.platform !== 'shorts');
    let insertIdx = 2;
    for (const item of uniqueInterestItems) {
      nonShorts.splice(insertIdx, 0, item);
      insertIdx += 3;
    }

    return { items: [...nonShorts, ...shorts], keyword: trendingRaw.keyword || '' };
  }
);

const VIRAL_KEYWORDS = [
  '맛집', '여행', 'IT', '영화', '음악', '패션', '게임', '요리',
  '운동', '뷰티', '일상', 'vlog', '리뷰', '먹방', '캠핑',
  '인테리어', '자동차', '펫', '공부', '재테크', '드라마', '축구',
];

let usedKeywords = [];

export const fetchMoreTrending = createAsyncThunk(
  'search/fetchMoreTrending',
  async (_, { getState }) => {
    const { auth } = getState();
    const userInterests = auth.user?.interests
      ? auth.user.interests.split(',').filter(Boolean)
      : [];

    // Merge: user interests first, then viral keywords
    const pool = userInterests.length > 0
      ? [...userInterests, ...VIRAL_KEYWORDS]
      : VIRAL_KEYWORDS;

    if (usedKeywords.length >= pool.length) {
      usedKeywords = [];
    }
    const available = pool.filter((k) => !usedKeywords.includes(k));

    // 70% chance to pick from user interests if available
    let keyword;
    const interestsAvailable = available.filter((k) => userInterests.includes(k));
    if (interestsAvailable.length > 0 && Math.random() < 0.7) {
      keyword = interestsAvailable[Math.floor(Math.random() * interestsAvailable.length)];
    } else {
      keyword = available[Math.floor(Math.random() * available.length)];
    }
    usedKeywords.push(keyword);

    // Fetch main content + multiple shorts keywords for robustness
    const shortsPool = userInterests.length > 0
      ? [...userInterests, ...VIRAL_KEYWORDS]
      : VIRAL_KEYWORDS;
    const shortsShuffled = [...shortsPool].sort(() => Math.random() - 0.5);
    const shortsPicks = shortsShuffled.slice(0, 3);

    const [raw, ...shortsResults] = await Promise.all([
      searchApi.searchAll(keyword, 5),
      ...shortsPicks.map((kw) => searchApi.searchByCategory('shorts', kw, 3).catch(() => null)),
    ]);
    let items = normalizeItems(raw);

    // Collect shorts from all keyword attempts
    const kwShorts = shortsResults.flatMap((sr) => {
      if (!sr) return [];
      try {
        const parsed = typeof sr === 'string' ? JSON.parse(sr) : sr;
        return normalizeItems({ shorts: typeof parsed === 'string' ? parsed : JSON.stringify(parsed) });
      } catch {
        return [];
      }
    });
    if (kwShorts.length > 0) {
      const originalShorts = items.filter((i) => i.platform === 'shorts');
      const seenIds = new Set(kwShorts.map((s) => s.id));
      const extra = originalShorts.filter((s) => !seenIds.has(s.id));
      items = [...items.filter((i) => i.platform !== 'shorts'), ...kwShorts, ...extra];
    }

    return { items };
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    activeFilter: 'all',
    items: [],
    loading: false,
    loadingMore: false,
    trendingLoaded: false,
    trendingKeyword: '',
  },
  reducers: {
    setActiveFilter: (state, action) => {
      state.activeFilter = action.payload;
    },
    clearSearch: (state) => {
      state.query = '';
      state.activeFilter = 'all';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchAll.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchAll.fulfilled, (state, action) => {
        state.loading = false;
        state.query = action.payload.query;
        state.items = action.payload.items;
        state.activeFilter = 'all';
      })
      .addCase(searchAll.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchTrending.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTrending.fulfilled, (state, action) => {
        state.loading = false;
        state.trendingLoaded = true;
        state.trendingKeyword = action.payload.keyword;
        state.items = action.payload.items;
      })
      .addCase(fetchTrending.rejected, (state) => {
        state.loading = false;
        state.trendingLoaded = true;
      })
      .addCase(fetchMoreTrending.pending, (state) => {
        state.loadingMore = true;
      })
      .addCase(fetchMoreTrending.fulfilled, (state, action) => {
        state.loadingMore = false;
        const existingIds = new Set(state.items.map((i) => i.id));
        const newItems = action.payload.items.filter((i) => !existingIds.has(i.id));
        state.items = [...state.items, ...newItems];
      })
      .addCase(fetchMoreTrending.rejected, (state) => {
        state.loadingMore = false;
      });
  },
});

export const { setActiveFilter, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
