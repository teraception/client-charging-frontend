import { fetchAuthSession } from "aws-amplify/auth";
import axios, { AxiosInstance, AxiosPromise, AxiosRequestConfig } from "axios";
import { routesForContext } from "JS/Routing";
import * as Sentry from "@sentry/react";
import {
  AppResponse,
  WithValidityState,
  extractResponseErrors,
} from "JS/types/Response";
import { Response, StatusCode } from "JS/typingForNow/types";
import { enqueueSnackbar } from "notistack";
// import {
//   StatusCode,
//   type Response,
// } from "@teraception/client-payment-integration-lib";

// Common HTTP error messages
const HTTP_ERROR_MESSAGES = {
  400: "Bad Request: The server could not process the request",
  401: "Unauthorized: Authentication is required",
  403: "Forbidden: You do not have permission to access this resource",
  404: "Not Found: The requested resource was not found",
  500: "Server Error: Something went wrong on our end",
  503: "Service Unavailable: The server is temporarily unavailable",
};

export class BaseService {
  private manager: AxiosInstance;
  private activeOrganization: string;
  private activeLocation: string;
  constructor() {
    this.manager = axios.create({
      headers: {
        //Instead of X-CSRF-TOKEN, rely on X-XSRF-TOKEN, laravel supposedly sent it with every response.
        //It contains CSRF token in encrypted form. With every response its lifetime/value should reflect most recent one in case previous session expires and new one exists as a results of rememberMe
        //'X-CSRF-TOKEN': csrftoken,
        Accept: "application/json",
      },
      baseURL: this.activeRoute().server.root(),
    });

    this.manager.interceptors.request.use(async (config) => {
      try {
        const session = await fetchAuthSession();
        if (session.tokens.accessToken!) {
          config.headers.Authorization = `Bearer ${session.tokens.accessToken.toString()}`;
        }
      } catch (err) {
        Sentry.captureException(err, {
          level: "error",
        });
        console.log(`🚀 ~ Cognito error`, err);
      }

      return config;
    });
  }

  protected doXHR<T>(config: AxiosRequestConfig) {
    return this.manager.request<T>(config);
  }

  protected activeRoute() {
    return routesForContext()({
      locationId: this.getLocation(),
      organizationId: this.getOrganization(),
    });
  }
  protected doServerXHR<T>(config: AxiosRequestConfig) {
    return this.handleResponse<T>(this.manager.request<Response<T>>(config));
  }

  public setOrganization(organizationId: string) {
    this.activeOrganization = organizationId;
  }
  public setLocation(locationId: string) {
    this.activeLocation = locationId;
  }
  public getOrganization() {
    return this.activeOrganization;
  }
  public getLocation() {
    return this.activeLocation;
  }

  public static responseWithValidityState<T>(d: Response<T>) {
    const ret: WithValidityState<AppResponse<T>> = {} as any;
    ret.data = d.data;
    ret.validityState = extractResponseErrors(d);
    ret.meta = d.meta;
    ret.statusCode = d.statusCode as StatusCode;
    const response = ret;
    return response;
  }

  protected handleResponse<T>(promise: AxiosPromise<Response<T>>) {
    return promise
      .then((a) => {
        return a.data;
      })
      .catch((error) => {
        console.log("error", error);
        if (error.response) {
          console.log("error.response", error.response);
          const response = error.response;

          // Display appropriate error message using notistack
          const statusCode = response.status;

          let errorMessage = "";

          if (response?.data?.data?.code === 11000) {
            errorMessage = `${
              Object.values(response.data?.data?.keyValue)[0]
            } already exists`;
          } else {
            errorMessage =
              response.data?.message ||
              response.data?.data?.message ||
              response.data?.data?.raw?.message ||
              HTTP_ERROR_MESSAGES[statusCode] ||
              "An unexpected error occurred";
          }

          // Capture in Sentry for monitoring
          Sentry.captureException(error, {
            level: "error",
            contexts: {
              response: {
                status: statusCode,
                data: response.data,
              },
            },
          });

          // Show error notification
          enqueueSnackbar(errorMessage, {
            variant: "error",
            autoHideDuration: 3000,
          });

          return response.data;
        } else {
          // Network errors, timeouts, etc.
          const errorMessage =
            error.message || "Network error: Unable to connect to the server";

          Sentry.captureException(error, {
            level: "error",
          });

          enqueueSnackbar(errorMessage, {
            variant: "error",
            autoHideDuration: 3000,
          });

          throw error;
        }
      })
      .then((a) => {
        return BaseService.responseWithValidityState<T>(a);
      });
  }
}
