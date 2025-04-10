import { routesForContext } from "JS/Routing";
import { useMemo } from "react";

export function useRouting() {
  const linkProvider = useMemo(() => {
    return routesForContext()({});
  }, []);
  const routeBuilder = useMemo(() => {
    return routesForContext();
  }, []);

  return {
    linkProvider,
    routeBuilder,
  };
}
