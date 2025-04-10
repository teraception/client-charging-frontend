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
      details: (clientId: string) =>
        [...client.all, `client-${clientId}`] as const,
    }),
    []
  );

  return {
    user,
    client,
  };
};
