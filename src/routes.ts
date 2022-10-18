import { v4 as uuidv4 } from "uuid";

import Engine from "./";

export interface RouteProps {
  sourceId: string;
  outputId: string;
  destinationId: string;
  inputId: string;
}

export interface RouteInterface extends RouteProps {
  id: string;
}

export function createRoute(props: RouteProps) {
  const id = uuidv4();

  return { id, ...props };
}

export function applyRoutes(routes: RouteInterface[]) {
  Object.values(Engine.modules).forEach((m) => m.unplugAll());

  const succesedConnections = routes.map((route) => {
    const { sourceId, outputId, destinationId, inputId } = route;

    const source = Engine.findById(sourceId);
    const destination = Engine.findById(destinationId);

    source.plug(destination, outputId, inputId);

    return true;
  });

  if (succesedConnections.every((v) => v)) {
    console.log("######## Routes succesfully applied");
  } else {
    console.log("######## Routes partialy applied");
  }
}
