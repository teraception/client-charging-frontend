import { AppResponse } from "JS/types/Response";
import { WithValidityState } from "JS/types";
import { BaseService } from "../BaseService";
import { CreateProjectDto, Project } from "JS/typingForNow/types";

export class ProjectService extends BaseService {
  /**
   * Get all projects for a client
   */
  getProjectsByClientId(
    clientId: string
  ): Promise<WithValidityState<AppResponse<Project[]>>> {
    return this.doServerXHR<Project[]>({
      url: this.activeRoute().server.api.project.getByClientId(clientId),
      method: "GET",
    });
  }

  /**
   * Get project details
   */
  getProjectDetails(
    projectId: string
  ): Promise<WithValidityState<AppResponse<Project>>> {
    return this.doServerXHR<Project>({
      url: this.activeRoute().server.api.project.details(projectId),
      method: "GET",
    });
  }

  /**
   * Create a new project for a client
   */
  createProject(
    data: CreateProjectDto
  ): Promise<WithValidityState<AppResponse<Project>>> {
    return this.doServerXHR<Project>({
      url: this.activeRoute().server.api.project.create(),
      method: "POST",
      data,
    });
  }

  /**
   * Update a project
   */
  updateProject(
    projectId: string,
    data: { name?: string }
  ): Promise<WithValidityState<AppResponse<Project>>> {
    return this.doServerXHR<Project>({
      url: this.activeRoute().server.api.project.update(projectId),
      method: "PUT",
      data,
    });
  }

  /**
   * Delete a project
   */
  deleteProject(
    projectId: string
  ): Promise<WithValidityState<AppResponse<boolean>>> {
    return this.doServerXHR<boolean>({
      url: this.activeRoute().server.api.project.delete(projectId),
      method: "DELETE",
    });
  }

  /**
   * Add a payment method to a project
   */
  addPaymentMethodToProject(
    projectId: string,
    paymentMethodId: string
  ): Promise<WithValidityState<AppResponse<Project>>> {
    return this.doServerXHR<Project>({
      url: this.activeRoute().server.api.project.addPaymentMethod(
        projectId,
        paymentMethodId
      ),
      method: "POST",
    });
  }
}
