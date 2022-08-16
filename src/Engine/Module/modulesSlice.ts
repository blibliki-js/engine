import {
  createSlice,
  createEntityAdapter,
  EntityState,
  PayloadAction,
} from "@reduxjs/toolkit";

import { RootState } from "store";

import Module, { Connectable } from "./Base";

const modulesAdapter = createEntityAdapter<Module<Connectable>>({});

export const modulesSlice = createSlice({
  name: "modules",
  initialState: modulesAdapter.getInitialState(),
  reducers: {
    addModule: (
      state: EntityState<any>,
      action: PayloadAction<Module<Connectable>>
    ) => {
      return modulesAdapter.addOne(state, action);
    },
  },
});

export const modulesSelector = modulesAdapter.getSelectors(
  (state: RootState) => state.modules
);

export const { addModule } = modulesSlice.actions;

export default modulesSlice.reducer;
