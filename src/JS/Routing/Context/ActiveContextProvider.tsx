import { useEffect, useState } from "react";
import { UserService } from "JS/Services/Users/Service";
import { useRouting } from "JS/React/Hooks/Routes";
import { useLoggedInUser } from "JS/Routing/Context/LoggedInUseContextProvider";
import {
  ServiceContextProvider,
  useAppServiceContext,
} from "JS/Routing/Context/ServiceContextProvider";
import { useQuery } from "@tanstack/react-query";
import { useLocationQueryKeysFactory } from "JS/React/Hooks/UseQueryKeys";
import { useGetMe } from "JS/React/Hooks/Users";

interface OrgLocContextProps {
  children: React.ReactNode;
}
interface ServiceContextType {
  userService: UserService;
}

export const ActiveContextProvider = (props: OrgLocContextProps) => {
  const { children } = props;
  const prevServices = useAppServiceContext();

  const [mappedServices, setMappedService] =
    useState<ServiceContextType>(prevServices);
  const { routeBuilder } = useRouting();
  const routeProvider = routeBuilder();
  const { loggedInUser, updateLoggedInUser } = useLoggedInUser();
  const keys = useLocationQueryKeysFactory();

  const { userData, getMeResponse, isLoading } = useGetMe();

  const [isServicesLoaded, setIsServicesLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading && getMeResponse) {
      updateLoggedInUser({
        ...loggedInUser,
        ...userData,
      });
    }
  }, [userData, isLoading]);

  useEffect(() => {
    // For re-render of on update of new service
    setMappedService((x) => ({ ...x }));
    setIsServicesLoaded(true);
  }, []);

  return (
    <ServiceContextProvider services={mappedServices}>
      {isServicesLoaded && children}
    </ServiceContextProvider>
  );
};
