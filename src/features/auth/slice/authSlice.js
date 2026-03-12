import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async ({ code, redirectUri }) => {
    const data = await authApi.loginWithGoogle(code, redirectUri);
    localStorage.setItem('auth_token', data.token);
    return data;
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authApi.getMe();
      if (data.error || data.status === 403) {
        localStorage.removeItem('auth_token');
        return rejectWithValue('Invalid token');
      }
      return data;
    } catch {
      localStorage.removeItem('auth_token');
      return rejectWithValue('Failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('auth_token') || null,
    loading: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('auth_token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(googleLogin.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
