import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchApi } from '../api/searchApi';

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'youtube', label: '유튜브' },
  { key: 'blog', label: '블로그' },
  { key: 'news', label: '뉴스' },
  { key: 'cafe', label: '카페' },
  { key: 'shop', label: '쇼핑' },
  { key: 'image', label: '이미지' },
  { key: 'kin', label: '지식iN' },
  { key: 'book', label: '도서' },
  { key: 'webkr', label: '웹문서' },
];

export { FILTERS };

function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, '') || '';
}

function normalizeItems(rawResults) {
  const items = [];

  for (const [category, raw] of Object.entries(rawResults)) {
    if (category === 'keyword') continue;
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;

    if (category === 'youtube') {
      const ytItems = data.items || [];
      ytItems.forEach((item) => {
        const snippet = item.snippet || {};
        items.push({
          id: `yt-${item.id?.videoId || item.id}`,
          platform: 'youtube',
          title: snippet.title || '',
          description: snippet.description || '',
          link: `https://www.youtube.com/watch?v=${item.id?.videoId || item.id}`,
          image: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || '',
          author: snippet.channelTitle || '',
          date: snippet.publishedAt?.substring(0, 10) || '',
          extra: item.statistics || null,
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
  async () => {
    const raw = await searchApi.trending(10);
    return { items: normalizeItems(raw), keyword: raw.keyword || '' };
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    activeFilter: 'all',
    items: [],
    loading: false,
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
      });
  },
});

export const { setActiveFilter, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
