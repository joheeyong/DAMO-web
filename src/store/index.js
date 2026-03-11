import { configureStore } from '@reduxjs/toolkit';
import pushReducer from '../features/push/slice/pushSlice';
import searchReducer from '../features/search/slice/searchSlice';

export const store = configureStore({
  reducer: {
    push: pushReducer,
    search: searchReducer,
  },
});
