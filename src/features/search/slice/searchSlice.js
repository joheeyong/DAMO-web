import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchApi } from '../api/searchApi';
import { activityApi } from '../api/activityApi';
import { stripHtml } from '../../../shared/utils/helpers';

function upgradeKakaoThumbnail(url) {
  if (!url) return '';
  // Kakao CDN: /argon/130x130_85_c/ID → /argon/600x0_65_wr/ID (max supported)
  return url.replace(/\/argon\/\d+x\d+_\d+_[a-z]+\//, '/argon/600x0_65_wr/');
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
          image: upgradeKakaoThumbnail(doc.thumbnail_url || doc.thumbnail || ''),
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
    } else if (category === 'damo-blog') {
      const blogItems = data.items || [];
      blogItems.forEach((post) => {
        items.push({
          id: `damo-blog-${post.id}`,
          platform: 'damo-blog',
          title: post.title || '',
          description: post.summary || '',
          link: `/blog/${post.id}`,
          image: post.coverImage || '',
          author: post.authorName || '',
          date: post.publishedAt?.substring(0, 10) || '',
          extra: {
            likeCount: post.likeCount || 0,
            commentCount: post.commentCount || 0,
            blogPostId: post.id,
          },
        });
      });
    } else if (category === 'damo-feed') {
      const feedItems = data.items || [];
      feedItems.forEach((post) => {
        let firstImage = '';
        try {
          const media = typeof post.images === 'string' ? JSON.parse(post.images) : post.images;
          if (Array.isArray(media) && media.length > 0) {
            firstImage = media[0].url || media[0] || '';
          }
        } catch {}
        items.push({
          id: `damo-feed-${post.id}`,
          platform: 'damo-feed',
          title: (post.content || '').substring(0, 80),
          description: (post.content || '').substring(0, 200),
          link: `/social/${post.id}`,
          image: firstImage,
          author: post.authorName || '',
          date: post.createdAt?.substring(0, 10) || '',
          extra: {
            likeCount: post.likeCount || 0,
            commentCount: post.commentCount || 0,
            socialPostId: post.id,
            mediaCount: (() => { try { const m = typeof post.images === 'string' ? JSON.parse(post.images) : post.images; return Array.isArray(m) ? m.length : 0; } catch { return 0; } })(),
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

    // Interest-based: use YouTube category API when possible, fall back to keyword search
    const shortsPool = userInterests.length > 0 ? userInterests : VIRAL_KEYWORDS;
    const shuffled = [...shortsPool].sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, Math.min(2, shuffled.length));
    const interestPromises = picks.map((kw) => {
      const categoryId = INTEREST_TO_YT_CATEGORY[kw];
      if (categoryId) {
        // Category-based: YouTube trending by category + Naver/Kakao keyword search in parallel
        return Promise.all([
          searchApi.trendingByCategory(5, categoryId).catch(() => ({})),
          searchApi.searchAll(kw, 5).catch(() => ({})),
        ]).then(([catResults, kwResults]) => {
          // Merge: YouTube from category, rest from keyword search
          const merged = { ...kwResults };
          if (catResults.youtube) merged.youtube = catResults.youtube;
          if (catResults.shorts) merged.shorts = catResults.shorts;
          return merged;
        });
      }
      return searchApi.searchAll(kw, 5).catch(() => ({}));
    });

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

// YouTube video category IDs (KR region)
// https://developers.google.com/youtube/v3/docs/videoCategories/list
const INTEREST_TO_YT_CATEGORY = {
  '음악': '10',       // Music
  '게임': '20',       // Gaming
  '축구': '17',       // Sports
  '운동': '17',       // Sports
  '영화': '1',        // Film & Animation
  '드라마': '24',     // Entertainment
  '요리': '26',       // Howto & Style
  '먹방': '26',       // Howto & Style
  '맛집': '26',       // Howto & Style
  '뷰티': '26',       // Howto & Style
  '패션': '26',       // Howto & Style
  '여행': '19',       // Travel & Events
  '캠핑': '19',       // Travel & Events
  '자동차': '2',      // Autos & Vehicles
  '펫': '15',         // Pets & Animals
  'IT': '28',         // Science & Technology
  '공부': '27',       // Education
  '재테크': '25',     // News & Politics
  '인테리어': '26',   // Howto & Style
};

export const fetchMoreTrending = createAsyncThunk(
  'search/fetchMoreTrending',
  async (_, { getState, dispatch }) => {
    const { search, auth } = getState();
    // Prevent duplicate calls while already loading
    if (search.loadingMore) return { items: [], keyword: '' };
    const usedKeywords = search.usedKeywords;
    const userInterests = auth.user?.interests
      ? auth.user.interests.split(',').filter(Boolean)
      : [];

    // Merge: user interests first, then viral keywords
    const pool = userInterests.length > 0
      ? [...userInterests, ...VIRAL_KEYWORDS]
      : VIRAL_KEYWORDS;

    let currentUsed = usedKeywords;
    if (currentUsed.length >= pool.length) {
      dispatch(searchSlice.actions.resetUsedKeywords());
      currentUsed = [];
    }
    const available = pool.filter((k) => !currentUsed.includes(k));

    // 70% chance to pick from user interests if available
    let keyword;
    const interestsAvailable = available.filter((k) => userInterests.includes(k));
    if (interestsAvailable.length > 0 && Math.random() < 0.7) {
      keyword = interestsAvailable[Math.floor(Math.random() * interestsAvailable.length)];
    } else {
      keyword = available[Math.floor(Math.random() * available.length)];
    }

    // Use category-based YouTube when possible, merge with keyword search
    const categoryId = INTEREST_TO_YT_CATEGORY[keyword];
    let raw;
    if (categoryId) {
      const [catResults, kwResults] = await Promise.all([
        searchApi.trendingByCategory(5, categoryId).catch(() => ({})),
        searchApi.searchAll(keyword, 5).catch(() => ({})),
      ]);
      raw = { ...kwResults };
      if (catResults.youtube) raw.youtube = catResults.youtube;
      if (catResults.shorts) raw.shorts = catResults.shorts;
    } else {
      raw = await searchApi.searchAll(keyword, 5);
    }
    let items = normalizeItems(raw);
    items = await applyRanking(items);
    return { items, keyword };
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
    usedKeywords: [],
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
      state.usedKeywords = [];
    },
    resetUsedKeywords: (state) => {
      state.usedKeywords = [];
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
        if (action.payload.keyword) {
          state.usedKeywords = [...state.usedKeywords, action.payload.keyword];
        }
      })
      .addCase(fetchMoreTrending.rejected, (state) => {
        state.loadingMore = false;
      });
  },
});

export const { setActiveFilter, setSort, setPeriod, clearSearch, resetUsedKeywords } = searchSlice.actions;
export default searchSlice.reducer;
