import { routesForContext } from "JS/Routing";
import { useOrgLocContext } from "JS/Routing/Context/ActiveContextProvider";
import { useMemo } from "react";

export function useRouting() {
  const { locationId, organizationId } = useOrgLocContext();
  const linkProvider = useMemo(() => {
    return routesForContext()({
      organizationId: organizationId || null,
      locationId: locationId || null,
    });
  }, [organizationId, locationId]);
  const routeBuilder = useMemo(() => {
    return routesForContext();
  }, []);

  return {
    linkProvider,
    routeBuilder,
  };
}
