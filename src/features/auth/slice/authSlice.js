import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';

function notifyFlutterAuth(token) {
  try {
    window.DamoAuth?.postMessage(token);
  } catch (e) { /* not in Flutter WebView */ }
}

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async ({ code, redirectUri }) => {
    const data = await authApi.loginWithGoogle(code, redirectUri);
    localStorage.setItem('auth_token', data.token);
    notifyFlutterAuth(data.token);
    return data;
  }
);

export const naverLogin = createAsyncThunk(
  'auth/naverLogin',
  async ({ code, state, redirectUri }) => {
    const data = await authApi.loginWithNaver(code, state, redirectUri);
    localStorage.setItem('auth_token', data.token);
    notifyFlutterAuth(data.token);
    return data;
  }
);

export const kakaoLogin = createAsyncThunk(
  'auth/kakaoLogin',
  async ({ code, redirectUri }) => {
    const data = await authApi.loginWithKakao(code, redirectUri);
    localStorage.setItem('auth_token', data.token);
    notifyFlutterAuth(data.token);
    return data;
  }
);

export const updateInterests = createAsyncThunk(
  'auth/updateInterests',
  async (interests) => {
    await authApi.updateInterests(interests);
    return interests;
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
      .addCase(naverLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(naverLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(naverLogin.rejected, (state) => {
        state.loading = false;
      })
      .addCase(kakaoLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(kakaoLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(kakaoLogin.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateInterests.fulfilled, (state, action) => {
        if (state.user) {
          state.user.interests = action.payload.join(',');
        }
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        const token = localStorage.getItem('auth_token');
        if (token) notifyFlutterAuth(token);
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
