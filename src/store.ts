import { configureStore } from "@reduxjs/toolkit";
import globalReducer from "globalSlice";
import midiDevicesReducer from "components/MidiDeviceSelector/midiDevicesSlice";
import modulesReducer from "Engine/Module/modulesSlice";

export const store = configureStore({
  reducer: {
    global: globalReducer,
    midiDevices: midiDevicesReducer,
    modules: modulesReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
