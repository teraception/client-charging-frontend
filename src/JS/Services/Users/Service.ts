import { Role, User, UserDTO } from "@teraception/employee-management-lib";
import { AppResponse } from "JS/types/Response";
import { WithValidityState } from "JS/types";
import { BaseService } from "../BaseService";
import { LoggedInUserDTO } from "JS/Shared";

export class UserService extends BaseService {
  getMe(): Promise<
    WithValidityState<AppResponse<Pick<LoggedInUserDTO, "user">>>
  > {
    return this.doServerXHR<Pick<LoggedInUserDTO, "user">>({
      url: this.activeRoute().server.api.user.me(),
      method: "GET",
    });
  }
  getAllUsers(): Promise<WithValidityState<AppResponse<User[]>>> {
    return this.doServerXHR<User[]>({
      url: this.activeRoute().server.api.user.getAll(),
      method: "GET",
    });
  }
  getUserDetails(
    userId: string
  ): Promise<WithValidityState<AppResponse<User>>> {
    return this.doServerXHR<User>({
      url: this.activeRoute().server.api.user.details(userId),
      method: "GET",
    });
  }
  createUser(user: UserDTO): Promise<WithValidityState<AppResponse<boolean>>> {
    return this.doServerXHR<boolean>({
      url: this.activeRoute().server.api.user.create(),
      method: "POST",
      data: user,
    });
  }
  updateUserBlockedStatus(data: {
    userId: string;
    blockedStatus: boolean;
  }): Promise<WithValidityState<AppResponse<boolean>>> {
    return this.doServerXHR<boolean>({
      url: this.activeRoute().server.api.user.updateUserBlockedStatus(),
      method: "PUT",
      data: {
        id: data.userId,
        isBlocked: data.blockedStatus,
      },
    });
  }
  deleteUser(userId: string): Promise<WithValidityState<AppResponse<boolean>>> {
    return this.doServerXHR<boolean>({
      url: this.activeRoute().server.api.user.delete(userId),
      method: "DELETE",
    });
  }
  updateUserRoles(
    userId: string,
    roles: Role[]
  ): Promise<WithValidityState<AppResponse<boolean>>> {
    return this.doServerXHR<boolean>({
      url: this.activeRoute().server.api.user.updateRoles(),
      method: "PUT",
      data: {
        id: userId,
        role: roles,
      },
    });
  }
}
