import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchApi } from '../api/searchApi';
import { activityApi } from '../api/activityApi';

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'shorts', label: 'Shorts' },
  { key: 'youtube', label: '유튜브' },
  { key: 'blog', label: 'N 블로그' },
  { key: 'news', label: 'N 뉴스' },
  { key: 'cafe', label: 'N 카페' },
  { key: 'shop', label: 'N 쇼핑' },
  { key: 'image', label: 'N 이미지' },
  { key: 'kin', label: '지식iN' },
  { key: 'book', label: 'N 도서' },
  { key: 'webkr', label: 'N 웹' },
  { key: 'kakao-blog', label: 'D 블로그' },
  { key: 'kakao-cafe', label: 'D 카페' },
  { key: 'kakao-web', label: 'D 웹' },
  { key: 'kakao-video', label: 'D 영상' },
  { key: 'kakao-image', label: 'D 이미지' },
  { key: 'reddit', label: 'Reddit' },
  { key: 'instagram', label: 'Instagram' },
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
    } else if (category === 'instagram') {
      const igItems = data.data || [];
      igItems.forEach((item) => {
        const caption = item.caption || '';
        items.push({
          id: `instagram-${item.id}`,
          platform: 'instagram',
          title: caption.substring(0, 80) || 'Instagram',
          description: caption.substring(0, 200),
          link: item.permalink || '',
          image: item.media_type === 'VIDEO' ? (item.thumbnail_url || '') : (item.media_url || ''),
          author: '',
          date: item.timestamp ? item.timestamp.substring(0, 10) : '',
          extra: {
            mediaType: item.media_type,
            likeCount: item.like_count || 0,
            commentsCount: item.comments_count || 0,
          },
        });
      });
    } else if (category.startsWith('kakao-')) {
      const docs = data.documents || [];
      docs.forEach((doc, idx) => {
        items.push({
          id: `${category}-${idx}-${doc.url}`,
          platform: category,
          title: doc.title?.replace(/<[^>]*>/g, '') || '',
          description: (doc.contents || doc.title || '').replace(/<[^>]*>/g, '').substring(0, 200),
          link: doc.url || '',
          image: doc.thumbnail_url || doc.thumbnail || '',
          author: doc.blogname || doc.cafename || '',
          date: doc.datetime ? doc.datetime.substring(0, 10) : '',
          extra: null,
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

async function applyRanking(items) {
  const token = localStorage.getItem('auth_token');
  if (!token || items.length === 0) return items;
  try {
    const result = await activityApi.rankItems(items);
    if (result.rankedIds && result.rankedIds.length > 0) {
      const idOrder = new Map(result.rankedIds.map((id, idx) => [id, idx]));
      return [...items].sort((a, b) => (idOrder.get(a.id) ?? 999) - (idOrder.get(b.id) ?? 999));
    }
  } catch (e) {
    // Ranking failed — use original order
  }
  return items;
}

function periodCutoff(period) {
  if (!period || period === 'all') return null;
  const now = Date.now();
  switch (period) {
    case '1d': return new Date(now - 1 * 24 * 60 * 60 * 1000);
    case '1w': return new Date(now - 7 * 24 * 60 * 60 * 1000);
    case '1m': return new Date(now - 30 * 24 * 60 * 60 * 1000);
    default: return null;
  }
}

function filterByPeriod(items, period) {
  const cutoff = periodCutoff(period);
  if (!cutoff) return items;
  return items.filter((item) => {
    if (!item.date) return true; // keep items without dates
    const d = new Date(item.date);
    return !isNaN(d.getTime()) && d >= cutoff;
  });
}

export const searchAll = createAsyncThunk(
  'search/searchAll',
  async ({ query, display = 5, sort = 'sim', period = 'all' }) => {
    const raw = await searchApi.searchAll(query, display, sort, period);
    let items = normalizeItems(raw);
    // YouTube/Reddit are filtered server-side; Naver/Kakao need client-side filtering
    items = filterByPeriod(items, period);

    // Record search & apply ranking for logged-in users
    const token = localStorage.getItem('auth_token');
    if (token) {
      activityApi.recordSearch(query);
      items = await applyRanking(items);
    }

    return { query, items, sort, period };
  }
);

export const fetchTrending = createAsyncThunk(
  'search/fetchTrending',
  async (_, { getState }) => {
    const { auth } = getState();
    const userInterests = auth.user?.interests
      ? auth.user.interests.split(',').filter(Boolean)
      : [];

    // Trending already includes shorts from YouTube API
    const trendingPromise = searchApi.trending(10);

    // Interest-based search (searchAll already includes shorts per keyword)
    const shortsPool = userInterests.length > 0 ? userInterests : VIRAL_KEYWORDS;
    const shuffled = [...shortsPool].sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, Math.min(2, shuffled.length));
    const interestPromises = picks.map((kw) => searchApi.searchAll(kw, 5).catch(() => ({})));

    const [trendingRaw, ...interestResults] = await Promise.all([
      trendingPromise,
      ...interestPromises,
    ]);

    const trendingItems = normalizeItems(trendingRaw);

    // Tag interest items with their source keyword
    const interestGroups = picks.map((kw, idx) => {
      const items = normalizeItems(interestResults[idx] || {});
      return { keyword: kw, items: items.map((item) => ({ ...item, sourceKeyword: kw })) };
    });

    const allInterestItems = interestGroups.flatMap((g) => g.items);
    const interestShorts = allInterestItems.filter((i) => i.platform === 'shorts');
    const trendingShorts = trendingItems.filter((i) => i.platform === 'shorts');

    // Combine shorts
    const seenShortIds = new Set();
    const allShorts = [...interestShorts, ...trendingShorts].filter((s) => {
      if (seenShortIds.has(s.id)) return false;
      seenShortIds.add(s.id);
      return true;
    });

    // Build non-shorts: trending items, then insert interest groups as blocks
    const trendingNonShorts = trendingItems.filter((i) => i.platform !== 'shorts');
    const seenIds = new Set(trendingNonShorts.map((i) => i.id));

    const nonShorts = [...trendingNonShorts];
    let insertIdx = 5;
    for (const group of interestGroups) {
      const uniqueGroupItems = group.items
        .filter((i) => i.platform !== 'shorts')
        .filter((i) => {
          if (seenIds.has(i.id)) return false;
          seenIds.add(i.id);
          return true;
        });
      if (uniqueGroupItems.length > 0) {
        nonShorts.splice(insertIdx, 0, ...uniqueGroupItems);
        insertIdx += uniqueGroupItems.length + 5;
      }
    }

    const allItems = [...nonShorts, ...allShorts];
    const rankedItems = await applyRanking(allItems);
    return { items: rankedItems, keyword: trendingRaw.keyword || '' };
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

    // searchAll already includes shorts — no extra API calls needed
    const raw = await searchApi.searchAll(keyword, 5);
    let items = normalizeItems(raw);
    items = await applyRanking(items);
    return { items };
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    activeFilter: 'all',
    sort: 'sim',
    period: 'all',
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
    setSort: (state, action) => {
      state.sort = action.payload;
    },
    setPeriod: (state, action) => {
      state.period = action.payload;
    },
    clearSearch: (state) => {
      state.query = '';
      state.activeFilter = 'all';
      state.sort = 'sim';
      state.period = 'all';
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
        state.sort = action.payload.sort || 'sim';
        state.period = action.payload.period || 'all';
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

export const { setActiveFilter, setSort, setPeriod, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
