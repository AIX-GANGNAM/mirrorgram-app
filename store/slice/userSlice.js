import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    isAuthenticated: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.profile = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.profile = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;