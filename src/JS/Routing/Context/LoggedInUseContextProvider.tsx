import { useGetMe } from "JS/React/Hooks/Users";
import { LoggedInUserDTO } from "JS/Shared";
import { processValidityState } from "JS/types/helper";
import { createContext, useContext, useEffect, useState } from "react";

interface LoggedInUserContextType {
  loggedInUser: LoggedInUserDTO;
  updateLoggedInUser: (user: LoggedInUserDTO) => void;
}

interface LoggedInUserProviderProps {
  children: React.ReactNode;
}

export const LoggedInUserContext = createContext<LoggedInUserContextType>({
  loggedInUser: null,
  updateLoggedInUser: () => null,
});

export const useLoggedInUser = () => useContext(LoggedInUserContext);

export const LoggedInUserContextProvider = (
  props: LoggedInUserProviderProps
) => {
  const { children } = props;

  const [loggedInUser, setLoggedInUser] = useState<LoggedInUserDTO>(null);
  const { userData, getMeResponse, isFetched, isLoading } = useGetMe();

  const updateLoggedInUser = (user: LoggedInUserDTO) => {
    setLoggedInUser(user);
  };

  useEffect(() => {
    if (userData) {
      updateLoggedInUser({
        ...userData,
      });
    }
  }, [userData, isLoading]);

  useEffect(() => {
    if (getMeResponse) {
      processValidityState(getMeResponse?.validityState);
    }
  }, [getMeResponse]);

  return (
    <LoggedInUserContext.Provider value={{ updateLoggedInUser, loggedInUser }}>
      {children}
    </LoggedInUserContext.Provider>
  );
};
