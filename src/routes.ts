import { v4 as uuidv4 } from "uuid";

import Engine from "./";

export interface RouteProps {
  sourceId: string;
  outputName: string;
  destinationId: string;
  inputName: string;
}

export interface RouteInterface extends RouteProps {
  id: string;
}

export function createRoute(props: RouteProps) {
  const id = uuidv4();

  return { ...props, id };
}

export function applyRoutes(routes: RouteInterface[]) {
  Object.values(Engine.modules).forEach((m) => m.unPlugAll());

  const succesedConnections = routes
    .sort((r1, r2) => {
      if (r1.outputName === "number of voices") return -1;
      if (r2.outputName === "number of voices") return 1;

      return 0;
    })
    .map((route) => {
      const { sourceId, outputName, destinationId, inputName } = route;

      const source = Engine.findById(sourceId);
      const destination = Engine.findById(destinationId);

      source.plug(destination, outputName, inputName);

      return true;
    });

  if (succesedConnections.every((v) => v)) {
    console.log("######## Routes succesfully applied");
  } else {
    console.log("######## Routes partialy applied");
  }
}
