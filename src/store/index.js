import { configureStore } from '@reduxjs/toolkit';
import pushReducer from '../features/push/slice/pushSlice';
import searchReducer from '../features/search/slice/searchSlice';
import authReducer from '../features/auth/slice/authSlice';

export const store = configureStore({
  reducer: {
    push: pushReducer,
    search: searchReducer,
    auth: authReducer,
  },
});
