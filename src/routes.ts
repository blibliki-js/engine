import Engine from "./";

interface RouteInterface {
  sourceId: string;
  sourceOutput: string;
  destinationId: string;
  destinationInput: string;
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
