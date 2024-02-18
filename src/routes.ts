import { v4 as uuidv4 } from "uuid";

import Engine from "./";
import { plugCompatibleIO } from "./core/IO/Node";
import { Optional } from "./types";

export interface RouteProps {
  sourceId: string;
  sourceIOId: string;
  destinationId: string;
  destinationIOId: string;
}

export interface RouteInterface extends RouteProps {
  id: string;
}

export function createRoute(props: Optional<RouteInterface, "id">) {
  const id = props.id || uuidv4();

  return { ...props, id };
}

export function applyRoutes(routes: RouteInterface[]) {
  Object.values(Engine.modules).forEach((m) => {
    m.unPlugAll();
  });

  const succesedConnections = routes.map((route) => {
    const { sourceId, sourceIOId, destinationId, destinationIOId } = route;

    const source = Engine.findById(sourceId);
    const destination = Engine.findById(destinationId);

    const output = source.outputs.find(sourceIOId);
    const input = destination.inputs.find(destinationIOId);
    if (!input || !output) throw Error("IO not found");

    plugCompatibleIO(input, output);

    return true;
  });

  if (succesedConnections.every((v) => v)) {
    console.log("######## Routes succesfully applied");
  } else {
    console.log("######## Routes partialy applied");
  }
}
