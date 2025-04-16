import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppServiceContext } from "JS/Routing/Context/ServiceContextProvider";
import { useQueryKeys } from "../UseQueryKeys";
// import { Role, UserDTO } from "@teraception/client-payment-integration-lib";
import { useAuth } from "JS/Cognito/CognitoContextProvider";
import { Role, UserDTO } from "JS/typingForNow/types";

export const useGetMe = () => {
  const { userService } = useAppServiceContext();
  const { user } = useQueryKeys();

  const { isAuthenticated } = useAuth();
  const { data, isFetched, isLoading } = useQuery({
    enabled: isAuthenticated === true,
    queryKey: user.sessionUser(),
    queryFn: async () => {
      const response = await userService.getMe();
      return response;
    },
    refetchOnWindowFocus: true,
    retryOnMount: true,
  });

  return {
    isFetched,
    isLoading,
    userData: data?.data,
    getMeResponse: data,
  };
};
export const useGetAllUsers = () => {
  const { userService } = useAppServiceContext();
  const { user } = useQueryKeys();
  const { data, isLoading } = useQuery({
    queryKey: user.list(),
    queryFn: async () => {
      const response = await userService.getAllUsers();
      return response;
    },
  });
  return {
    usersData: data?.data,
    getAllUsersLoader: isLoading,
    getAllUsersResponse: data,
  };
};
export const useGetUserDetails = (userId: string) => {
  const { userService } = useAppServiceContext();
  const { user } = useQueryKeys();
  const { data, isLoading } = useQuery({
    queryKey: user.details(userId),
    queryFn: async () => {
      const response = await userService.getUserDetails(userId);
      return response;
    },
  });
  return {
    userData: data?.data,
    userDetailsResponse: data,
    userDetailLoader: isLoading,
  };
};
export const useCreateUser = () => {
  const { userService } = useAppServiceContext();
  const queryClient = useQueryClient();
  const { user } = useQueryKeys();
  const { data, mutateAsync, isPending } = useMutation({
    mutationFn: async (data: UserDTO) => {
      const response = await userService.createUser(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: user.list(),
      });
    },
  });
  return {
    createUser: mutateAsync,
    createUserResponse: data,
    createUserLoader: isPending,
  };
};
export const useDeleteUser = () => {
  const { userService } = useAppServiceContext();
  const queryClient = useQueryClient();
  const { user } = useQueryKeys();
  const { data, mutateAsync, isPending } = useMutation({
    mutationFn: async (userId: string) => {
      const response = await userService.deleteUser(userId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: user.list(),
      });
    },
  });
  return {
    deleteUser: mutateAsync,
    deleteUserResponse: data,
    deleteUserLoader: isPending,
  };
};
export const useUpdateUserBlockedStatus = () => {
  const { userService } = useAppServiceContext();
  const queryClient = useQueryClient();
  const { user } = useQueryKeys();
  const { data, mutateAsync, isPending } = useMutation({
    mutationFn: async (data: { userId: string; blockedStatus: boolean }) => {
      const response = await userService.updateUserBlockedStatus(data);
      return response;
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({
      //   queryKey: user.sessionUser(loggedInUser?.user.id),
      // });
      queryClient.invalidateQueries({
        queryKey: user.list(),
      });
      // queryClient.invalidateQueries({
      //   queryKey: user.details(loggedInUser?.user.id),
      // });
    },
  });
  return {
    updateUserBlockedStatus: mutateAsync,
    updateUserBlockedStatusResponse: data,
    updateUserBlockedStatusLoader: isPending,
  };
};
export const useUpdateUserRoles = () => {
  const { userService } = useAppServiceContext();
  const queryClient = useQueryClient();
  const { user } = useQueryKeys();
  const { data, mutateAsync, isPending } = useMutation({
    mutationFn: async (data: { userId: string; role: Role[] }) => {
      const response = await userService.updateUserRoles(
        data.userId,
        data.role
      );
      return response;
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({
      //   queryKey: user.sessionUser(loggedInUser?.user.id),
      // });
      queryClient.invalidateQueries({
        queryKey: user.list(),
      });
      // queryClient.invalidateQueries({
      //   queryKey: user.details(loggedInUser?.user.id),
      // });
    },
  });
  return {
    updateUserRoles: mutateAsync,
    updateUserRolesResponse: data,
    updateUserRolesLoader: isPending,
  };
};
