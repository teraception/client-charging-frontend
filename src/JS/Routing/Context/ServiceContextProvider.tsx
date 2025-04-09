import { EmployeeSalaryService } from "JS/Services/EmployeeSalary/Service";
import { UserProvisioningService } from "JS/Services/Employees";
import { EmployeeService } from "JS/Services/Employees/Service";
import { GroupService } from "JS/Services/Groups/Service";
import { IntegrationService } from "JS/Services/Integrations/Service";
import { LeaveRequestService } from "JS/Services/LeaveRequest/Service";
import { LocationService } from "JS/Services/Locations/Service";
import { OrganizationService } from "JS/Services/Organizations/Service";
import { FeedbackPolicyService } from "JS/Services/Polices/FeedbackService";
import { IncrementalPolicyService } from "JS/Services/Polices/IncrementalService";
import { LeavePolicyService } from "JS/Services/Polices/LeaveService";
import { UserService } from "JS/Services/Users/Service";
import React, { createContext, useContext, useMemo } from "react";

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

export const buildDefaultServices = () => ({
  userService: new UserService(),
  leavePolicyService: new LeavePolicyService(),
  feedbackPolicyService: new FeedbackPolicyService(),
  incrementalPolicyService: new IncrementalPolicyService(),
  locationService: new LocationService(),
  organizationService: new OrganizationService(),
  employeeService: new EmployeeService(),
  employeeSalaryService: new EmployeeSalaryService(),
  userProvisioningService: new UserProvisioningService(),
  integrationService: new IntegrationService(),
  groupService: new GroupService(),
  leaveRequestService: new LeaveRequestService(),
});
export const ServiceContext = createContext<ServiceContextType>(
  buildDefaultServices()
);

export const useAppServiceContext = () => useContext(ServiceContext);

export const ServiceContextProvider = (props: {
  children: React.ReactNode;
  services?: ServiceContextType;
}) => {
  const { children, services } = props;
  const mappedServices = useMemo(() => services || buildDefaultServices(), []);

  return (
    <ServiceContext.Provider value={mappedServices}>
      {children}
    </ServiceContext.Provider>
  );
};
