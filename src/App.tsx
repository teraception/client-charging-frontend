import theme from "JS/React/Style/Theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { Root } from "JS/React/Scenes/root";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { CognitoContextProvider } from "JS/Cognito/CognitoContextProvider";
import { configureAmplify } from "JS/Cognito/AuthConfig";
import { LoggedInUserContextProvider } from "JS/Routing/Context/LoggedInUseContextProvider";
import { ActiveContextProvider } from "JS/Routing/Context/ActiveContextProvider";
import { ServiceContextProvider } from "JS/Routing/Context/ServiceContextProvider";
import { initSentry } from "JS/telemetry/sentry/sentry";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: 1 * 60 * 1000, // 1min
    },
  },
});

initSentry();
configureAmplify();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={4}>
          <BrowserRouter>
            <CognitoContextProvider>
              <ServiceContextProvider>
                <LoggedInUserContextProvider>
                  <ActiveContextProvider>
                    <Root />
                  </ActiveContextProvider>
                </LoggedInUserContextProvider>
              </ServiceContextProvider>
            </CognitoContextProvider>
          </BrowserRouter>
          <ReactQueryDevtools initialIsOpen={false} />
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
