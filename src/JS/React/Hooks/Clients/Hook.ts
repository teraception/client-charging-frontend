import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppServiceContext } from "JS/Routing/Context/ServiceContextProvider";
import { useQueryKeys } from "../UseQueryKeys";
import {
  Client,
  CreateClientDTO,
  UpdateClientDTO,
  UpdateUserClientIdsDTO,
} from "JS/typingForNow/types";

export const useGetAllClients = () => {
  const { clientService } = useAppServiceContext();
  const { client } = useQueryKeys();
  const { data, isLoading } = useQuery({
    queryKey: client.list(),
    queryFn: async () => {
      const response = await clientService.getAllClients();
      return response;
    },
  });
  return {
    clientsData: data?.data,
    getAllClientsLoader: isLoading,
    getAllClientsResponse: data,
  };
};

export const useGetClientDetails = (clientId: string) => {
  const { clientService } = useAppServiceContext();
  const { client } = useQueryKeys();
  const { data, isLoading } = useQuery({
    queryKey: client.details(clientId),
    queryFn: async () => {
      const response = await clientService.getClientDetails(clientId);
      return response;
    },
  });
  return {
    clientData: data?.data,
    clientDetailsResponse: data,
    clientDetailLoader: isLoading,
  };
};

export const useCreateClient = () => {
  const { clientService } = useAppServiceContext();
  const queryClient = useQueryClient();
  const { client } = useQueryKeys();
  const { data, mutateAsync, isPending } = useMutation({
    mutationFn: async (data: CreateClientDTO) => {
      const response = await clientService.createClient(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: client.list(),
      });
    },
  });
  return {
    createClient: mutateAsync,
    createClientResponse: data,
    createClientLoader: isPending,
  };
};

export const useUpdateClient = () => {
  const { clientService } = useAppServiceContext();
  const queryClient = useQueryClient();
  const { client } = useQueryKeys();
  const { data, mutateAsync, isPending } = useMutation({
    mutationFn: async ({
      clientId,
      data,
    }: {
      clientId: string;
      data: UpdateClientDTO;
    }) => {
      const response = await clientService.updateClient(clientId, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: client.list(),
      });
    },
  });
  return {
    updateClient: mutateAsync,
    updateClientResponse: data,
    updateClientLoader: isPending,
  };
};

export const useDeleteClient = () => {
  const { clientService } = useAppServiceContext();
  const queryClient = useQueryClient();
  const { client } = useQueryKeys();
  const { data, mutateAsync, isPending } = useMutation({
    mutationFn: async (clientId: string) => {
      const response = await clientService.deleteClient(clientId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: client.list(),
      });
    },
  });
  return {
    deleteClient: mutateAsync,
    deleteClientResponse: data,
    deleteClientLoader: isPending,
  };
};

export const useInviteClient = () => {
  const { clientService } = useAppServiceContext();
  const queryClient = useQueryClient();
  const { client } = useQueryKeys();
  const { data, mutateAsync, isPending } = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const response = await clientService.inviteClient(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: client.list(),
      });
    },
  });
  return {
    inviteClient: mutateAsync,
    inviteClientResponse: data,
    inviteClientLoader: isPending,
  };
};

export const useGetClientsWithUserId = (userId: string) => {
  const { clientService } = useAppServiceContext();
  const { client } = useQueryKeys();
  const { data, isLoading } = useQuery({
    queryKey: client.userClients(userId),
    enabled: !!userId,
    queryFn: async () => {
      const response = await clientService.getClientsWithUserId(userId);
      return response;
    },
  });
  return {
    clientsData: data?.data,
    getClientsWithUserIdLoader: isLoading,
    getClientsWithUserIdResponse: data,
  };
};

export const useUpdateUserClientIds = () => {
  const { clientService } = useAppServiceContext();
  const queryClient = useQueryClient();
  const { client } = useQueryKeys();
  const { data, mutateAsync, isPending } = useMutation({
    mutationFn: async (data: UpdateUserClientIdsDTO) => {
      const response = await clientService.updateUserClientIds(data);
      return response;
    },
    onSuccess: (_, varia) => {
      queryClient.invalidateQueries({
        queryKey: client.usersList(varia.clientId),
      });
    },
  });
  return {
    updateUserClientIds: mutateAsync,
    updateUserClientIdsResponse: data,
    updateUserClientIdsLoader: isPending,
  };
};

export const useGetUsersListByClientId = (clientId: string) => {
  const { clientService } = useAppServiceContext();
  const { client } = useQueryKeys();
  const { data, isLoading } = useQuery({
    queryKey: client.usersList(clientId),
    enabled: !!clientId,
    queryFn: async () => {
      const response = await clientService.getUsersListByClientId(clientId);
      return response;
    },
  });
  return {
    usersData: data?.data,
    getUsersListByClientIdLoader: isLoading,
    getUsersListByClientIdResponse: data,
  };
};
