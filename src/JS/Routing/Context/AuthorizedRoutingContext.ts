import { BaseRoutingContext } from "./BaseRoutingContext";

export class AuthorizedRoutingContext extends BaseRoutingContext {
  getContextIdentifier() {
    return "AuthorizedRoutingContext";
  }
  getBaseUrl() {
    return `${super.getBaseUrl()}/dashboard`;
  }
  getBaseApiUrl() {
    return `${super.getBaseApiUrl()}`;
  }
}
