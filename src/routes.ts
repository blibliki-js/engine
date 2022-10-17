import { v4 as uuidv4 } from "uuid";

import Engine from "./";

export interface RouteProps {
  sourceId: string;
  sourceOutput: string;
  destinationId: string;
  destinationInput: string;
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
    const { sourceId, sourceOutput, destinationId, destinationInput } = route;

    const source = Engine.findById(sourceId);
    const destination = Engine.findById(destinationId);

    if (!source || !destination) {
      console.log(
        `missing ${sourceId}:${sourceOutput} => ${destinationId}:${destinationInput}`
      );
      return false;
    }

    source.plug(destination, sourceOutput, destinationInput);

    return true;
  });

  if (succesedConnections.every((v) => v)) {
    console.log("######## Routes succesfully applied");
  } else {
    console.log("######## Routes partialy applied");
  }
}
