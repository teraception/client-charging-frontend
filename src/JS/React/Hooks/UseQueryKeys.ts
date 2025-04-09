import { useAuth } from "JS/Cognito/CognitoContextProvider";

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
  const queryKeys = useLocationQueryKeysFactory();
  return queryKeys;
};
