import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// Define a simple wrapper to provide router props to components
export function withRouter(Component) {
  return function WithRouterWrapper(props) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    return <Component {...props} router={{ location, navigate, params }} />;
  };
}
