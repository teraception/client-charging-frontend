import { RoutingContext } from "./Interfaces";
import urljoin from "url-join";
import normalizePath from "normalize-path";

export class BaseRoutingContext implements RoutingContext {
  getContextIdentifier() {
    return "BaseRoutingContext";
  }
  getBaseUrl() {
    return "/";
  }
  getBaseApiUrl() {
    return "";
  }
  buildUrl(url: string, params: { [index: string]: string } = {}) {
    return normalizePath(
      Object.keys(params).reduce((url: string, param: string) => {
        return url.replace(param, params[param]);
      }, urljoin(this.getBaseUrl(), url))
    );
  }
}
