import {
  createSlice,
  createSelector,
  createEntityAdapter,
  EntityState,
  PayloadAction,
} from "@reduxjs/toolkit";

import { RootState } from "store";

import { ModuleInterface } from "./Base";

const modulesAdapter = createEntityAdapter<ModuleInterface>({});

export const modulesSlice = createSlice({
  name: "modules",
  initialState: modulesAdapter.getInitialState(),
  reducers: {
    addModule: (
      state: EntityState<any>,
      action: PayloadAction<ModuleInterface>
    ) => {
      return modulesAdapter.addOne(state, action);
    },
    updateModule: (state: EntityState<any>, update: PayloadAction<any>) => {
      return modulesAdapter.updateOne(state, update);
    },
  },
});

export const modulesSelector = modulesAdapter.getSelectors(
  (state: RootState) => state.modules
);

export const selectModulesByType = createSelector(
  (state: RootState) => modulesSelector.selectAll(state),
  (_: RootState, type: string) => type,
  (modules: ModuleInterface[], type: string) =>
    modules.filter((m) => m.type === type)
);

export const { addModule, updateModule } = modulesSlice.actions;

export default modulesSlice.reducer;
