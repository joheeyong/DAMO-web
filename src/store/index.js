import { configureStore } from '@reduxjs/toolkit';
import pushReducer from '../features/push/slice/pushSlice';

export const store = configureStore({
  reducer: {
    push: pushReducer,
  },
});
