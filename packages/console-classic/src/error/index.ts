// Side-effect: register the failure screens' own translations
import "./locales";

export { ErrorDialog } from "./error-dialog";
export {
  AccessDeniedPage,
  AuthRequiredPage,
  NotFoundPage,
  ServerErrorPage,
  ServiceUnavailablePage,
} from "./error-pages";
export type { AccessDeniedPageProps } from "./error-pages";
export { dismissAllErrors, dismissError, dispatchError, useErrorStore } from "./error-store";
