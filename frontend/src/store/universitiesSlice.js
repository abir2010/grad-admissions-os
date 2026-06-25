import { createSlice } from '@reduxjs/toolkit';

const universitiesSlice = createSlice({
  name: 'universities',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    setUniversities(state, action) {
      state.items = action.payload;
    },
  },
});

export const { setUniversities } = universitiesSlice.actions;
export default universitiesSlice.reducer;
