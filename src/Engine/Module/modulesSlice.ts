import {
  createSlice,
  createSelector,
  createEntityAdapter,
  EntityState,
  PayloadAction,
} from "@reduxjs/toolkit";

import { RootState } from "store";
import Engine from "Engine";
import { ModuleType, PolyModuleType } from "Engine/Module";

interface ModuleInterface extends AddModuleInterface {
  id: string;
}

interface AddModuleInterface {
  name: string;
  code: string;
  type: ModuleType | PolyModuleType;
  props?: any;
}

const modulesAdapter = createEntityAdapter<ModuleInterface>({});

export const modulesSlice = createSlice({
  name: "modules",
  initialState: modulesAdapter.getInitialState(),
  reducers: {
    addModule: (
      state: EntityState<any>,
      action: PayloadAction<AddModuleInterface>
    ) => {
      const { name, code, type, props } = action.payload;
      const payload = Engine.registerModule(name, code, type, props);

      return modulesAdapter.addOne(state, payload);
    },
    updateModule: (state: EntityState<any>, update: PayloadAction<any>) => {
      const {
        id,
        changes: { props: changedProps },
      } = update.payload;
      const { props } = Engine.updatePropsModule(id, changedProps);

      return modulesAdapter.updateOne(state, {
        id,
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
