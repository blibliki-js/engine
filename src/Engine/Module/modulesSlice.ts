import {
  createSlice,
  createSelector,
  createEntityAdapter,
  EntityState,
  PayloadAction,
} from "@reduxjs/toolkit";

import { RootState } from "store";
import Engine from "Engine";

import { ModuleInterface } from "./Base";

const modulesAdapter = createEntityAdapter<ModuleInterface>({
  selectId: (m) => m.code,
});

export const modulesSlice = createSlice({
  name: "modules",
  initialState: modulesAdapter.getInitialState(),
  reducers: {
    addModule: (
      state: EntityState<any>,
      action: PayloadAction<ModuleInterface>
    ) => {
      const { name, code, type, props } = action.payload;
      const payload = Engine.registerModule(
        name,
        code,
        type,
        props
      ).serialize();

      return modulesAdapter.addOne(state, payload);
    },
    updateModule: (state: EntityState<any>, update: PayloadAction<any>) => {
      const {
        id: code,
        changes: { props: changedProps },
      } = update.payload;
      const { props } = Engine.updatePropsModule(
        code,
        changedProps
      ).serialize();

      return modulesAdapter.updateOne(state, {
        id: code,
        changes: { props },
      });
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

export const selectModulesByCodes = createSelector(
  (state: RootState) => modulesSelector.selectAll(state),
  (_: RootState, codes: string[]) => codes,
  (modules: ModuleInterface[], codes: string[]) =>
    modules.filter((m) => codes.includes(m.code))
);

export const { addModule, updateModule } = modulesSlice.actions;

export default modulesSlice.reducer;
