import { createSlice } from "@reduxjs/toolkit";

export const globalSlice = createSlice({
  name: "global",
  initialState: {
    isInitialized: false,
  },
  reducers: {
    setAttributes: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setAttributes } = globalSlice.actions;

export default globalSlice.reducer;

export const initialize = () => {
  return setAttributes({ isInitialized: true });
};
