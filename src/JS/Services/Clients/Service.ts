import { AppResponse } from "JS/types/Response";
import { WithValidityState } from "JS/types";
import { BaseService } from "../BaseService";
import {
  Client,
  CreateClientDTO,
  UpdateClientDTO,
} from "JS/typingForNow/types";

export class ClientService extends BaseService {
  getAllClients(): Promise<WithValidityState<AppResponse<Client[]>>> {
    return this.doServerXHR<Client[]>({
      url: this.activeRoute().server.api.client.getAll(),
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

  inviteClient(
    email: string
  ): Promise<WithValidityState<AppResponse<boolean>>> {
    return this.doServerXHR<boolean>({
      url: this.activeRoute().server.api.client.invite(),
      method: "POST",
      data: { email },
    });
  }
}
