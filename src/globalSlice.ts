import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GlobalProps {
  isInitialized: boolean;
  activeNotes: string[];
  voices: number;
}

const initialState: GlobalProps = {
  isInitialized: false,
  activeNotes: [],
  voices: 1,
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setAttributes: (state, action) => {
      return { ...state, ...action.payload };
    },
    addActiveNote: (state, action: PayloadAction<string>) => {
      state.activeNotes.push(action.payload);
    },
    removeActiveNote: (state, action: PayloadAction<string>) => {
      state.activeNotes = state.activeNotes.filter(
        (note) => note !== action.payload
      );
    },
  },
});

export const { setAttributes, addActiveNote, removeActiveNote } =
  globalSlice.actions;

export default globalSlice.reducer;

export const initialize = () => {
  return setAttributes({ isInitialized: true });
};
