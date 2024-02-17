import { v4 as uuidv4 } from "uuid";

import Engine from "./";
import { fromPairs } from "lodash";
import { plugCompatibleIO } from "./core/IO/Node";

export interface RouteProps {
  sourceId: string;
  destinationId: string;
}

export interface RouteInterface extends RouteProps {
  id: string;
}

export function createRoute(props: RouteProps) {
  const id = uuidv4();

  return { ...props, id };
}

export function applyRoutes(routes: RouteInterface[]) {
  const audioModules = Object.values(Engine.modules);
  audioModules.forEach((m) => m.unPlugAll());
  const inputs = fromPairs(
    audioModules
      .map((am) => am.inputs.collection)
      .flat()
      .map((io) => [io.id, io])
  );
  const outputs = fromPairs(
    audioModules
      .map((am) => am.outputs.collection)
      .flat()
      .map((io) => [io.id, io])
  );

  const succesedConnections = routes.map((route) => {
    const { sourceId, destinationId } = route;

    const source = outputs[sourceId];
    const destination = inputs[destinationId];

    plugCompatibleIO(destination, source);

    return true;
  });

  if (succesedConnections.every((v) => v)) {
    console.log("######## Routes succesfully applied");
  } else {
    console.log("######## Routes partialy applied");
  }
}
