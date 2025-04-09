import { defaults } from "lodash-es";
import { config } from "JS/Config";
import { BaseRoutingContext } from "./Context/BaseRoutingContext";
import { OrganizationLocationRoutingContext } from "./Context/OrganizationLocationRoutingContext";
import { OrganizationRoutingContext } from "./Context/OrganizationRoutingContext";
import { LocationRoutingContext } from "./Context/LocationRoutingContext";
import { AuthorizedRoutingContext } from "./Context/AuthorizedRoutingContext";

export interface RouteParams {
  organizationId?: string;
  locationId?: string;
}

export const routesForContext = () => (params?: RouteParams) => {
  params = defaults({}, params, {
    organizationId: ":organizationId",
    locationId: ":locationId",
  });

  const authorizedContext = new AuthorizedRoutingContext();
  const unauthorizedContext = new BaseRoutingContext();

  const organizationRoutingContext = new OrganizationRoutingContext(
    params.organizationId
  );
  const locationRoutingContext = new LocationRoutingContext(params.locationId);
  const organizationLocationRoutingContext =
    new OrganizationLocationRoutingContext(
      params.organizationId,
      params.locationId
    );

  return {
    server: {
      root: () => config.baseApiUrl,
      api: ((base: string) => ({
        user: {
          me: () => `${base}/me`,
          updateUserBlockedStatus: () => `${base}/user/update-status`,
          getAll: () => `${base}/user/list`,
          create: () => `${base}/user`,
          details: (userId: string) => `${base}/user/${userId}`,
          delete: (userId: string) => `${base}/user/${userId}`,
          updateRoles: () => `${base}/user/role`,
        },
      }))(`${config.baseApiUrl}`),
    },

    react: {
      root: () => unauthorizedContext.buildUrl(`/`),

      login: () => unauthorizedContext.buildUrl(`/login`),
      resetPassword: () => unauthorizedContext.buildUrl(`/resetpassword`),
      confirmResetPassword: () =>
        unauthorizedContext.buildUrl(`/confirm-reset-password`),
      rootUnauthorized: () => unauthorizedContext.buildUrl(`/`),
      dashboard: () => authorizedContext.buildUrl(`/`),

      users: () => authorizedContext.buildUrl(`/users`),

      rootAuthorized: () => authorizedContext.buildUrl(`/`),
      accountSetting: () =>
        organizationLocationRoutingContext.buildUrl(`/account-setting`),
    },
  };
};

const getBestMatch = (route: string, routes: any) => {
  if (typeof routes === "function") {
    const r = routes();

    if (!route.includes(r.toString())) {
      return null;
    } else {
      return r as string;
    }
  } else {
    let matched: string = null;
    Object.keys(routes).map((key) => {
      const best = getBestMatch(route, routes[key]);

      if (best && (!matched || best.length >= matched.length)) {
        matched = best;
      }
      return null;
    });
    return matched;
  }
};

export const getMatchingRoute = (route: string, fullUrl: string) => {
  //this supports only ClientsRoutingContext, ClientsStoresRoutingContext,  and BaseRoutingContext
  const routeSplitted = route.split("/");
  const fullUrlSplitted = fullUrl.split("/");
  const finalRoute = [
    ...routeSplitted,
    ...fullUrlSplitted.slice(routeSplitted.length),
  ].join("/");

  const routeProvider = routesForContext()();

  const bestMatch = getBestMatch(finalRoute, routeProvider.react);
  return (params: RouteParams) => {
    if (bestMatch) {
      return bestMatch
        .replace(`:organizationId`, params.organizationId)
        .replace(`:locationId`, params.locationId);
    } else {
      if (params.organizationId) {
        return routesForContext()(params).react.dashboard();
      } else if (params.locationId) {
        return routesForContext()(params).react.dashboard();
      } else {
        return routesForContext()(params).react.dashboard();
      }
    }
  };
};

export type Routes = ReturnType<typeof routesForContext>;
