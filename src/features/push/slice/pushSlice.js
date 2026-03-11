import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pushApi } from '../api/pushApi';

export const fetchTokens = createAsyncThunk('push/fetchTokens', async () => {
  return await pushApi.fetchTokens();
});

export const sendNotification = createAsyncThunk(
  'push/sendNotification',
  async ({ title, body, token }) => {
    const payload = { title, body };
    if (token && token !== 'all') {
      payload.token = token;
    }
    return await pushApi.sendNotification(payload);
  }
);

const pushSlice = createSlice({
  name: 'push',
  initialState: {
    tokens: [],
    tokensLoading: false,
    sendLoading: false,
    sendResult: null,
  },
  reducers: {
    clearSendResult: (state) => {
      state.sendResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTokens.pending, (state) => {
        state.tokensLoading = true;
      })
      .addCase(fetchTokens.fulfilled, (state, action) => {
        state.tokensLoading = false;
        state.tokens = action.payload;
      })
      .addCase(fetchTokens.rejected, (state) => {
        state.tokensLoading = false;
      })
      .addCase(sendNotification.pending, (state) => {
        state.sendLoading = true;
        state.sendResult = null;
      })
      .addCase(sendNotification.fulfilled, (state, action) => {
        state.sendLoading = false;
        state.sendResult = action.payload;
      })
      .addCase(sendNotification.rejected, (state, action) => {
        state.sendLoading = false;
        state.sendResult = { status: 'ERROR', message: action.error.message };
      });
  },
});

export const { clearSendResult } = pushSlice.actions;
export default pushSlice.reducer;
