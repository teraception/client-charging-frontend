export interface RoutingContext {
  getContextIdentifier(): string;
  buildUrl(url: string, params?: { [index: string]: string }): string;
  getBaseUrl(): string;
  getBaseApiUrl(): string;
}
