import { defaults } from "lodash-es";
import { config } from "JS/Config";
import { BaseRoutingContext } from "./Context/BaseRoutingContext";
import { AuthorizedRoutingContext } from "./Context/AuthorizedRoutingContext";

export interface RouteParams {}

export const routesForContext = () => (params?: RouteParams) => {
  params = defaults({}, params, {});

  const authorizedContext = new AuthorizedRoutingContext();
  const unauthorizedContext = new BaseRoutingContext();

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
        client: {
          getAll: () => `${base}/client/list`,
          create: () => `${base}/client`,
          details: (clientId: string) => `${base}/client/${clientId}`,
          update: (clientId: string) => `${base}/client/${clientId}`,
          delete: (clientId: string) => `${base}/client/${clientId}`,
          invite: () => `${base}/client/invite`,
          getClientsWithUserId: (userId: string) =>
            `${base}/client/user-clients/${userId}`,
          updateUserClientIds: (clientId: string) =>
            `${base}/client/update-user-client-ids/${clientId}`,
          getUsersListByClientId: (clientId: string) =>
            `${base}/client/users-list/${clientId}`,
        },
        paymentMethod: {
          createPaymentMethod: () => `${base}/payment-method`,
          getPaymentMethods: () => `${base}/payment-method`,
          getClientPaymentMethods: (clientId: string) =>
            `${base}/payment-method/client/${clientId}`,
          getStripePaymentMethodsByClientId: (clientId: string) =>
            `${base}/payment-method/client/${clientId}/stripe-list`,
        },
        project: {
          create: () => `${base}/project`,
          update: (projectId: string) => `${base}/project/${projectId}`,
          getByClientId: (clientId: string) =>
            `${base}/project/client/${clientId}`,
          delete: (projectId: string) => `${base}/project/${projectId}`,
          details: (projectId: string) => `${base}/project/${projectId}`,
          updatePaymentMethod: (projectId: string) =>
            `${base}/project/${projectId}/payment-methods`,
        },
        invoice: {
          create: () => `${base}/invoice`,
          getInvoices: () => `${base}/invoice`,
          getInvoice: (invoiceId: string) => `${base}/invoice/${invoiceId}`,
          getInvoiceByClientId: (clientId: string) =>
            `${base}/invoice/client/${clientId}`,
          delete: (invoiceId: string) => `${base}/invoice/${invoiceId}`,
          payNow: (invoiceId: string) => `${base}/invoice/${invoiceId}/pay-now`,
          sendInvoiceEmailToClient: (invoiceId: string) =>
            `${base}/invoice/${invoiceId}/send-invoice-to-client`,
          sendInvoiceEmailToClientTesting: (invoiceId: string) =>
            `${base}/invoice/${invoiceId}/send-invoice-to-client-testing`,
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
      clients: () => authorizedContext.buildUrl(`/clients`),
      invoicesList: (clientId?: string) =>
        authorizedContext.buildUrl(
          clientId ? `/clients/${clientId}/invoices` : "/clients/invoices"
        ),
      clientsList: () => authorizedContext.buildUrl(`/clients/list`),
      paymentMethods: (clientId?: string) =>
        authorizedContext.buildUrl(
          clientId
            ? `/clients/${clientId}/payment-methods`
            : "/clients/payment-methods"
        ),
      addPaymentMethod: (clientId: string) =>
        authorizedContext.buildUrl(`/clients/${clientId}/payment-methods/add`),
      projects: (clientId?: string) =>
        authorizedContext.buildUrl(
          clientId ? `/clients/${clientId}/projects` : "/clients/projects"
        ),
      projectDetails: (projectId: string) =>
        authorizedContext.buildUrl(`/clients/projects/${projectId}`),

      rootAuthorized: () => authorizedContext.buildUrl(`/`),
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
      return bestMatch;
    } else {
      return routesForContext()(params).react.dashboard();
    }
  };
};

export type Routes = ReturnType<typeof routesForContext>;
