// Side-effect: register the failure screens' own translations
import "./locales";

export { ErrorDialog } from "./error-dialog";
export {
  AccessDeniedPage,
  AuthRequiredPage,
  FailurePage,
  NotFoundPage,
  ServerErrorPage,
  ServiceUnavailablePage,
} from "./error-pages";
export type { AccessDeniedPageProps, FailurePageProps } from "./error-pages";
export { dismissAllErrors, dismissError, dispatchError, useErrorStore } from "@simplix-react/ui";
