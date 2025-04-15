import { AppResponse } from "JS/types/Response";
import { WithValidityState } from "JS/types";
import { BaseService } from "../BaseService";
import {
  Client,
  CreateClientDTO,
  UpdateClientDTO,
  UpdateUserClientIdsDTO,
  User,
} from "JS/typingForNow/types";

export class ClientService extends BaseService {
  getAllClients(): Promise<WithValidityState<AppResponse<Client[]>>> {
    return this.doServerXHR<Client[]>({
      url: this.activeRoute().server.api.client.getAll(),
      method: "GET",
    });
  }

  getClientsWithUserId(
    userId: string
  ): Promise<WithValidityState<AppResponse<Client[]>>> {
    return this.doServerXHR<Client[]>({
      url: this.activeRoute().server.api.client.getClientsWithUserId(userId),
      method: "GET",
    });
  }

  updateUserClientIds(
    data: UpdateUserClientIdsDTO
  ): Promise<WithValidityState<AppResponse<Client>>> {
    return this.doServerXHR<Client>({
      url: this.activeRoute().server.api.client.updateUserClientIds(
        data.clientId
      ),
      method: "PUT",
      data,
    });
  }

  getUsersListByClientId(
    clientId: string
  ): Promise<WithValidityState<AppResponse<User[]>>> {
    return this.doServerXHR<User[]>({
      url: this.activeRoute().server.api.client.getUsersListByClientId(
        clientId
      ),
      method: "GET",
    });
  }

  getClientDetails(
    clientId: string
  ): Promise<WithValidityState<AppResponse<Client>>> {
    return this.doServerXHR<Client>({
      url: this.activeRoute().server.api.client.details(clientId),
      method: "GET",
    });
  }

  createClient(
    client: CreateClientDTO
  ): Promise<WithValidityState<AppResponse<Client>>> {
    return this.doServerXHR<Client>({
      url: this.activeRoute().server.api.client.create(),
      method: "POST",
      data: client,
    });
  }

  updateClient(
    clientId: string,
    client: UpdateClientDTO
  ): Promise<WithValidityState<AppResponse<Client>>> {
    return this.doServerXHR<Client>({
      url: this.activeRoute().server.api.client.update(clientId),
      method: "PUT",
      data: client,
    });
  }

  deleteClient(
    clientId: string
  ): Promise<WithValidityState<AppResponse<boolean>>> {
    return this.doServerXHR<boolean>({
      url: this.activeRoute().server.api.client.delete(clientId),
      method: "DELETE",
    });
  }

  inviteClient(data: {
    name: string;
    email: string;
  }): Promise<WithValidityState<AppResponse<boolean>>> {
    return this.doServerXHR<boolean>({
      url: this.activeRoute().server.api.client.invite(),
      method: "POST",
      data,
    });
  }
}
