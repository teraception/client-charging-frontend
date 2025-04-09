import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signIn,
  signOut,
  SignInInput,
  fetchAuthSession,
  resetPassword,
  ResetPasswordInput,
  updatePassword,
  UpdatePasswordInput,
  confirmSignIn,
  ConfirmSignInOutput,
  ConfirmSignInInput,
  ResetPasswordOutput,
  confirmResetPassword,
  ConfirmResetPasswordInput,
} from "aws-amplify/auth";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useRouting } from "JS/React/Hooks/Routes";
import { useAccessToken } from "JS/React/Hooks/UseAccessToken";
import { AuthTokens } from "aws-amplify/auth";

interface CognitoContextType {
  logIn: (credentials: SignInInput) => Promise<void>;
  logOut: () => Promise<void>;
  resetPass: (info: ResetPasswordInput) => Promise<ResetPasswordOutput>;
  updatePass: (info: UpdatePasswordInput) => Promise<boolean>;
  confirmLogin: (input: ConfirmSignInInput) => Promise<ConfirmSignInOutput>;
  confirmPasswordReset: (input: ConfirmResetPasswordInput) => Promise<boolean>;
  isAuthenticated: boolean;
  loading: boolean;
  isChangingPassword: boolean;
}

export interface CognitoContextProps {
  children: React.ReactNode;
}

export const CognitoContext = createContext<CognitoContextType | undefined>(
  undefined
);

export type AuthSession = {
  tokens?: AuthTokens;
  // credentials?: AWSCredentials;
  identityId?: string;
  userSub?: string;
};

export const useAuth = () => useContext(CognitoContext);

export const CognitoContextProvider = (props: CognitoContextProps) => {
  const { children } = props;
  const { routeBuilder } = useRouting();
  const routeProvider = routeBuilder();
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<AuthSession>(null);
  const { expired, setExpired } = useAccessToken(true, session);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  useEffect(() => {
    if (expired) {
      loadSession();
    }
  }, [expired]);

  useEffect(() => {
    loadSession();
  }, []);
  useEffect(() => {
    loadSession();
  }, [isAuthenticated]);

  const loadSession = async () => {
    try {
      const currentSession = await fetchAuthSession();

      if (currentSession.tokens?.accessToken) {
        setIsAuthenticated(true);
        setExpired(false);
        setSession(currentSession);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.warn(error);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  const logIn = async (credentials: SignInInput): Promise<void> => {
    setLoading(true);
    try {
      const { username, password, options } = credentials;
      const response = await signIn({
        username: username,
        password: password,
        options: options,
      });
      const challengeType = response.nextStep.signInStep;

      if (challengeType === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        navigate(`${routeProvider.react.resetPassword()}`, {
          replace: false,
        });
      }
      if (challengeType === "DONE" && response.isSignedIn) {
        setIsAuthenticated(true);
        navigate(routeProvider.react.dashboard(), { replace: true });
        enqueueSnackbar("login successfully", {
          variant: "success",
          autoHideDuration: 3000,
        });
        navigate(routeProvider.react.dashboard(), { replace: true });
      }
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmLogin = async (
    input: ConfirmSignInInput
  ): Promise<ConfirmSignInOutput> => {
    const response = await confirmSignIn(input);
    return response;
  };

  const confirmPasswordReset = async (
    input: ConfirmResetPasswordInput
  ): Promise<boolean> => {
    await confirmResetPassword(input);
    return true;
  };

  const logOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await signOut();
      window.location.reload();
      setIsAuthenticated(false);
      navigate(routeProvider.react.root(), { replace: true });
      enqueueSnackbar("logged out successfully", {
        variant: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPass = async (
    info: ResetPasswordInput
  ): Promise<ResetPasswordOutput> => {
    setLoading(true);
    setIsChangingPassword(true);
    const response = await resetPassword(info);
    return response;
  };

  const updatePass = async (info: UpdatePasswordInput): Promise<boolean> => {
    try {
      setLoading(true);
      setIsChangingPassword(true);
      await updatePassword(info);
      enqueueSnackbar("password updated successfully", {
        variant: "success",
        autoHideDuration: 3000,
      });
      return true;
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setLoading(false);
      setIsChangingPassword(false);
    }
  };

  return (
    <CognitoContext.Provider
      value={{
        logIn,
        logOut,
        resetPass,
        updatePass,
        confirmLogin,
        confirmPasswordReset,
        isAuthenticated,
        loading,
        isChangingPassword,
      }}
    >
      {children}
    </CognitoContext.Provider>
  );
};
