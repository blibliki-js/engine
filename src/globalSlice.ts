import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Note from "Engine/Note";

interface GlobalProps {
  isInitialized: boolean;
  activeNotes: Note[];
}

const initialState: GlobalProps = {
  isInitialized: false,
  activeNotes: [],
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setAttributes: (state, action) => {
      return { ...state, ...action.payload };
    },
    addActiveNote: (state, action: PayloadAction<Note>) => {
      state.activeNotes.push(action.payload);
    },
    removeActiveNote: (state, action) => {
      state.activeNotes = state.activeNotes.filter(
        (note) => note.fullName !== action.payload.fullName
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
