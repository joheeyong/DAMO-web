import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchApi } from '../api/searchApi';

const CATEGORIES = [
  { key: 'blog', label: '블로그' },
  { key: 'news', label: '뉴스' },
  { key: 'cafe', label: '카페' },
  { key: 'shop', label: '쇼핑' },
  { key: 'image', label: '이미지' },
  { key: 'kin', label: '지식iN' },
  { key: 'book', label: '도서' },
  { key: 'webkr', label: '웹문서' },
];

export { CATEGORIES };

export const searchAll = createAsyncThunk(
  'search/searchAll',
  async ({ query, display = 5 }) => {
    const raw = await searchApi.searchAll(query, display);
    const results = {};
    for (const [key, value] of Object.entries(raw)) {
      try {
        results[key] = typeof value === 'string' ? JSON.parse(value) : value;
      } catch {
        results[key] = { items: [] };
      }
    }
    return { query, results };
  }
);

export const searchMore = createAsyncThunk(
  'search/searchMore',
  async ({ category, query, start }) => {
    const raw = await searchApi.searchByCategory(category, query, 10, start);
    const result = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return { category, result };
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    activeTab: 'blog',
    results: {},
    loading: false,
    moreLoading: false,
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchAll.pending, (state) => {
        state.loading = true;
        state.results = {};
      })
      .addCase(searchAll.fulfilled, (state, action) => {
        state.loading = false;
        state.query = action.payload.query;
        state.results = action.payload.results;
      })
      .addCase(searchAll.rejected, (state) => {
        state.loading = false;
      })
      .addCase(searchMore.pending, (state) => {
        state.moreLoading = true;
      })
      .addCase(searchMore.fulfilled, (state, action) => {
        state.moreLoading = false;
        const { category, result } = action.payload;
        if (state.results[category]?.items && result.items) {
          state.results[category].items.push(...result.items);
        }
      })
      .addCase(searchMore.rejected, (state) => {
        state.moreLoading = false;
      });
  },
});

export const { setActiveTab } = searchSlice.actions;
export default searchSlice.reducer;
