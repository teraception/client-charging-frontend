import * as Sentry from "@sentry/react";
import { config } from "JS/Config";

export const initSentry = () => {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.sentry.environment,
  });
};
