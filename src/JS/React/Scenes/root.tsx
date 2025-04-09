import { Fragment } from "react";
import { Routes, Route } from "react-router-dom";
import { Login } from "./Pages/Login";
import { useRouting } from "JS/React/Hooks/Routes";
import { Layout } from "./Layout/Layout";
import ProtectedRoute from "JS/React/Container/ProtectedRoute";
import { useAuth } from "JS/Cognito/CognitoContextProvider";
import { PasswordChallengeComponent } from "./Pages/PasswordChallenge";
import { Navigate } from "react-router-dom";
import { ConfirmResettingPasswordDetails } from "./Pages/ConfirmResettingPasswordDetails";

export const Root = () => {
  const { routeBuilder } = useRouting();
  const routeProvider = routeBuilder();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <Fragment>
      <Routes>
        <Route
          path={`${routeProvider.react.rootAuthorized()}/*`}
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        />
        {!isAuthenticated && (
          <Route path={routeProvider.react.login()} element={<Login />} />
        )}
        <Route
          path={routeProvider.react.resetPassword()}
          element={<PasswordChallengeComponent />}
        />
        <Route
          path={routeProvider.react.confirmResetPassword()}
          element={<ConfirmResettingPasswordDetails />}
        />
        //todo not secure
        <Route
          path={"*"}
          element={<Navigate to={routeProvider.react.rootAuthorized()} />}
        />
      </Routes>
    </Fragment>
  );
};
