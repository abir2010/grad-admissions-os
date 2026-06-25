import { createSlice } from '@reduxjs/toolkit';

const documentsSlice = createSlice({
  name: 'documents',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    setDocuments(state, action) {
      state.items = action.payload;
    },
  },
});

export const { setDocuments } = documentsSlice.actions;
export default documentsSlice.reducer;
