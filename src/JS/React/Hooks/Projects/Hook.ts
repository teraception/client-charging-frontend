import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppServiceContext } from "JS/Routing/Context/ServiceContextProvider";
import { useQueryKeys } from "../UseQueryKeys";
import { CreateProjectDto, Project } from "JS/typingForNow/types";

/**
 * Hook to get projects for a client
 */
export const useGetProjectsByClient = (clientId: string | null) => {
  const { projectService } = useAppServiceContext();
  const { project } = useQueryKeys();

  const { data, isLoading, refetch } = useQuery({
    queryKey: project.listByClient(clientId || ""),
    enabled: !!clientId,
    queryFn: async () => {
      const response = await projectService.getProjectsByClientId(clientId!);
      return response;
    },
  });

  return {
    projectsData: data?.data || [],
    projectsIsLoading: isLoading,
    projectsResponse: data,
    refetchProjects: refetch,
  };
};

/**
 * Hook to get a specific project details
 */
export const useGetProjectDetails = (projectId: string | null) => {
  const { projectService } = useAppServiceContext();
  const { project } = useQueryKeys();

  const { data, isLoading } = useQuery({
    queryKey: project.details(projectId || ""),
    enabled: !!projectId,
    queryFn: async () => {
      const response = await projectService.getProjectDetails(projectId!);
      return response;
    },
  });

  return {
    projectData: data?.data,
    projectIsLoading: isLoading,
    projectResponse: data,
  };
};

/**
 * Hook to create a new project
 */
export const useCreateProject = () => {
  const { projectService } = useAppServiceContext();
  const queryClient = useQueryClient();
  const { project } = useQueryKeys();

  const {
    mutateAsync,
    isPending: isLoading,
    data,
  } = useMutation({
    mutationFn: async (data: CreateProjectDto) => {
      const response = await projectService.createProject(data);
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate projects list for this client
      queryClient.invalidateQueries({
        queryKey: project.listByClient(variables.clientId),
      });
    },
  });

  return {
    createProject: mutateAsync,
    createProjectIsLoading: isLoading,
    createProjectResponse: data,
  };
};

/**
 * Hook to update a project
 */
export const useUpdateProject = () => {
  const { projectService } = useAppServiceContext();
  const queryClient = useQueryClient();
  const { project } = useQueryKeys();

  const {
    mutateAsync,
    isPending: isLoading,
    data,
  } = useMutation({
    mutationFn: async ({
      projectId,
      data,
    }: {
      projectId: string;
      data: { name: string };
    }) => {
      const response = await projectService.updateProject(projectId, data);
      return response;
    },
    onSuccess: (response) => {
      // Invalidate project details and list
      if (response?.data?.clientId) {
        queryClient.invalidateQueries({
          queryKey: project.listByClient(response.data.clientId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: project.details(response.data.id),
      });
    },
  });

  return {
    updateProject: mutateAsync,
    updateProjectIsLoading: isLoading,
    updateProjectResponse: data,
  };
};

/**
 * Hook to delete a project
 */
export const useDeleteProject = () => {
  const { projectService } = useAppServiceContext();
  const queryClient = useQueryClient();
  const { project } = useQueryKeys();

  const {
    mutateAsync,
    isPending: isLoading,
    data,
  } = useMutation({
    mutationFn: async ({
      projectId,
      clientId,
    }: {
      projectId: string;
      clientId: string;
    }) => {
      const response = await projectService.deleteProject(projectId);
      return { response, clientId };
    },
    onSuccess: (data) => {
      // Invalidate projects list for this client
      queryClient.invalidateQueries({
        queryKey: project.listByClient(data.clientId),
      });
    },
  });

  return {
    deleteProject: mutateAsync,
    deleteProjectIsLoading: isLoading,
    deleteProjectResponse: data,
  };
};

/**
 * Hook to add a payment method to a project
 */
export const useAddPaymentMethodToProject = () => {
  const { projectService } = useAppServiceContext();
  const queryClient = useQueryClient();
  const { project } = useQueryKeys();

  const {
    mutateAsync,
    isPending: isLoading,
    data,
  } = useMutation({
    mutationFn: async ({
      projectId,
      paymentMethodId,
    }: {
      projectId: string;
      paymentMethodId: string;
    }) => {
      const response = await projectService.addPaymentMethodToProject(
        projectId,
        paymentMethodId
      );
      return response;
    },
    onSuccess: (response) => {
      // Invalidate project details
      queryClient.invalidateQueries({
        queryKey: project.details(response?.data?.id),
      });
    },
  });

  return {
    addPaymentMethodToProject: mutateAsync,
    addPaymentMethodIsLoading: isLoading,
    addPaymentMethodResponse: data,
  };
};
