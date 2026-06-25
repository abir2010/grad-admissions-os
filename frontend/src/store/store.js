import { configureStore } from '@reduxjs/toolkit';
import professorsReducer from './professorsSlice.js';
import documentsReducer from './documentsSlice.js';
import universitiesReducer from './universitiesSlice.js';

export const store = configureStore({
  reducer: {
    professors: professorsReducer,
    documents: documentsReducer,
    universities: universitiesReducer,
  },
});
