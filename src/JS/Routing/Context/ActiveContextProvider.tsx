import { createContext, useContext, useEffect, useState } from "react";
import { useMatch } from "react-router";
import { UserService } from "JS/Services/Users/Service";
import { FeedbackPolicyService } from "JS/Services/Polices/FeedbackService";
import { IncrementalPolicyService } from "JS/Services/Polices/IncrementalService";
import { LeavePolicyService } from "JS/Services/Polices/LeaveService";
import { LocationService } from "JS/Services/Locations/Service";
import { EmployeeService } from "JS/Services/Employees/Service";
import { OrganizationService } from "JS/Services/Organizations/Service";
import { IntegrationService } from "JS/Services/Integrations/Service";
import { useRouting } from "JS/React/Hooks/Routes";
import { useLoggedInUser } from "JS/Routing/Context/LoggedInUseContextProvider";
import { GroupService } from "JS/Services/Groups/Service";
import { LeaveRequestService } from "JS/Services/LeaveRequest/Service";
import { UserProvisioningService } from "JS/Services/Employees";
import {
  ServiceContextProvider,
  useAppServiceContext,
} from "JS/Routing/Context/ServiceContextProvider";
import { useQuery } from "@tanstack/react-query";
import { useLocationQueryKeysFactory } from "JS/React/Hooks/UseQueryKeys";
import { EmployeeSalaryService } from "JS/Services/EmployeeSalary/Service";

interface OrgLocContextProps {
  children: React.ReactNode;
}
interface ServiceContextType {
  userService: UserService;
  leavePolicyService: LeavePolicyService;
  feedbackPolicyService: FeedbackPolicyService;
  incrementalPolicyService: IncrementalPolicyService;
  locationService: LocationService;
  employeeService: EmployeeService;
  employeeSalaryService: EmployeeSalaryService;
  userProvisioningService: UserProvisioningService;
  organizationService: OrganizationService;
  integrationService: IntegrationService;
  groupService: GroupService;
  leaveRequestService: LeaveRequestService;
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

  const { data: employeeMeResp, isLoading: employeeMeLoading } = useQuery({
    queryKey: keys.employee.me(),
    queryFn: () => {
      const service = new EmployeeService();
      service.setOrganization(organizationId);
      service.setLocation(locationId);
      return service.getMe();
    },
  });

  const orgMatch = useMatch(`${routeProvider.react.rootOrganization()}/*`);
  const locMatch = useMatch(`${routeProvider.react.rootLocation()}/*`);
  const matchToUse = locMatch || orgMatch;
  let { organizationId: paramsOrganizationId, locationId: paramsLocationId } =
    matchToUse?.params || ({} as any);
  const [isServicesLoaded, setIsServicesLoaded] = useState<boolean>(
    !(!!paramsOrganizationId || !!paramsLocationId)
  );

  useEffect(() => {
    if (!employeeMeLoading && employeeMeResp) {
      updateLoggedInUser({
        ...loggedInUser,
        ...employeeMeResp.data,
      });
    }
  }, [employeeMeResp, employeeMeLoading]);

  useEffect(() => {
    if (paramsOrganizationId) {
      setOrganizationId(paramsOrganizationId);
    } else {
      if (!organizationId && loggedInUser?.organization?.id) {
        setOrganizationId(loggedInUser?.organization?.id);
      }
    }
    if (paramsLocationId) {
      setLocationId(paramsLocationId);
    } else {
      if (!locationId && loggedInUser?.location?.id) {
        setLocationId(loggedInUser?.location?.id);
      }
    }
  }, [
    paramsOrganizationId,
    paramsLocationId,
    loggedInUser,
    organizationId,
    locationId,
  ]);
  useEffect(() => {
    if (organizationId || locationId) {
      if (organizationId) {
        Object.values(mappedServices).map((x) => {
          x.setOrganization(organizationId);
          return null;
        });
      }
      if (locationId) {
        Object.values(mappedServices).map((x) => {
          x.setLocation(locationId);
          return null;
        });
      }
      // For re-render of on update of new service
      setMappedService((x) => ({ ...x }));
      setIsServicesLoaded(true);
    }
  }, [locationId, organizationId]);

  const updateOrganizationId = (id: string) => {
    setOrganizationId(id);
  };
  const updateLocationId = (id: string) => {
    setLocationId(id);
  };

  return (
    <ServiceContextProvider services={mappedServices}>
      {isServicesLoaded && children}
    </ServiceContextProvider>
  );
};
