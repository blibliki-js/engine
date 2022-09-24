import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "hooks";
import { addModule, selectModulesByCodes } from "Engine/Module/modulesSlice";
import { ModuleType, PolyModuleType } from "Engine/Module";

interface UseModuleProps {
  name: string;
  code: string;
  type: ModuleType | PolyModuleType;
  props?: any;
}

export function useModules(propsArr: UseModuleProps[]) {
  const dispatch = useAppDispatch();

  const modules = useAppSelector((state) =>
    selectModulesByCodes(
      state,
      propsArr.map((p) => p.code)
    )
  );

  useEffect(() => {
    propsArr.forEach((moduleProps) => {
      dispatch(addModule(moduleProps));
    });
  }, []);

  return modules;
}
