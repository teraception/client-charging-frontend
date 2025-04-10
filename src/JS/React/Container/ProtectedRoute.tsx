import { useAuth } from "JS/Cognito/CognitoContextProvider";
import { useRouting } from "JS/React/Hooks/Routes";
import { JSX } from "react";
import { Navigate } from "react-router-dom";

export interface ProtectedRouteProps {
  children: JSX.Element;
}
function ProtectedRoute(props: ProtectedRouteProps): JSX.Element {
  const { children } = props;
  const { isAuthenticated } = useAuth();
  const { routeBuilder } = useRouting();
  const routeProvider = routeBuilder();

  if (isAuthenticated === null) {
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to={routeProvider.react.login()} replace />;
  }
  return children;
}
export default ProtectedRoute;
