import { useEffect } from "react";
import Engine from "Engine";
import { useAppSelector } from "hooks";
import { selectModulesByCodes } from "Engine/Module/modulesSlice";

interface UseModuleProps {
  name: string;
  code: string;
  type: string;
  props?: any;
}

export function useModules(propsArr: UseModuleProps[]) {
  const modules = useAppSelector((state) =>
    selectModulesByCodes(
      state,
      propsArr.map((p) => p.code)
    )
  );

  useEffect(() => {
    propsArr.forEach((moduleProps) => {
      const { name, code, type, props } = moduleProps;

      Engine.registerModule(name, code, type, props);
    });
  }, []);

  return modules;
}
