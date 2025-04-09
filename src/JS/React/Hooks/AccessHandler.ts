import { Role } from "@teraception/employee-management-lib";
import { useLoggedInUser } from "JS/Routing/Context/LoggedInUseContextProvider";

export function useAccessHandler() {
  const { loggedInUser } = useLoggedInUser();

  let isSuperAdmin: boolean = false;
  let isClient: boolean = false;

  if (loggedInUser?.user) {
    isSuperAdmin = loggedInUser?.user.role.includes(Role.SUPER_ADMIN);
    isClient = loggedInUser?.user.role.includes(Role.CLIENT);
  }

  return {
    isClient,
    isSuperAdmin,
  };
}
