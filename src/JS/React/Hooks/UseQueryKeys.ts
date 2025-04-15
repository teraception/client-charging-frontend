import { useAuth } from "JS/Cognito/CognitoContextProvider";
import { useMemo } from "react";

export const useLocationQueryKeysFactory = () => {
  const { isAuthenticated } = useAuth();
  const AuthorizedScope = [isAuthenticated];

  const userKeys = {
    all: ["user"] as const,
    list: () => [...userKeys.all, "list"] as const,
    details: (userId: string) => [...userKeys.all, `user-${userId}`] as const,
    sessionUser: () => [...userKeys.all, "me"] as const,
  };

  return {
    user: userKeys,
  };
};

export const useQueryKeys = () => {
  const user = useMemo(
    () => ({
      all: ["user"] as const,
      list: () => [...user.all, "list"] as const,
      details: (userId: string) => [...user.all, `user-${userId}`] as const,
      sessionUser: () => [...user.all, "me"] as const,
    }),
    []
  );

  const client = useMemo(
    () => ({
      all: ["client"] as const,
      list: () => [...client.all, "list"] as const,
      userClients: (userId: string) =>
        [...client.all, `user-${userId}`] as const,
      details: (clientId: string) =>
        [...client.all, `client-${clientId}`] as const,
      usersList: (clientId: string) =>
        [...client.all, `client-${clientId}`, "users-list"] as const,
    }),
    []
  );

  const paymentMethod = useMemo(
    () => ({
      all: ["paymentMethod"] as const,
      list: () => [...paymentMethod.all, "list"] as const,
      clientPaymentMethods: (clientId: string) =>
        [...paymentMethod.all, `client-${clientId}`] as const,
      stripePaymentMethods: (clientId: string) =>
        [...paymentMethod.all, `client-${clientId}`, "stripe"] as const,
    }),
    []
  );

  const project = useMemo(
    () => ({
      all: ["project"] as const,
      listByClient: (clientId: string) =>
        [...project.all, `client-${clientId}`] as const,
      details: (projectId: string) =>
        [...project.all, `project-${projectId}`] as const,
    }),
    []
  );

  const invoice = useMemo(
    () => ({
      all: ["invoice"] as const,
      listByClient: (clientId: string) =>
        [...invoice.all, `client-${clientId}`] as const,
      details: (invoiceId: string) =>
        [...invoice.all, `invoice-${invoiceId}`] as const,
    }),
    []
  );
  return {
    user,
    client,
    paymentMethod,
    project,
    invoice,
  };
};
