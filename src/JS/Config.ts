const variables = import.meta.env;
export const config = {
  versions: {
    appVersion: variables.VITE_VERSION,
  },
  accessToken: "",
  baseApiUrl: variables.VITE_BASE_API_URL,
  cognitoAuth: {
    region: variables.VITE_COGNITO_REGION,
    userPoolWebClientId: variables.VITE_COGNITO_CLIENT_ID,
    userPoolId: variables.VITE_COGNITO_USER_POOL_ID,
    mandatorySignIn: true,
  },
  sentry: {
    dsn: variables.VITE_SENTRY_DSN,
    environment: variables.VITE_SENTRY_ENV,
  },
};
