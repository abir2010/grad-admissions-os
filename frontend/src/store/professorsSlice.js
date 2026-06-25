import { createSlice } from '@reduxjs/toolkit';

const professorsSlice = createSlice({
  name: 'professors',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    setProfessors(state, action) {
      state.items = action.payload;
    },
  },
});

export const { setProfessors } = professorsSlice.actions;
export default professorsSlice.reducer;
