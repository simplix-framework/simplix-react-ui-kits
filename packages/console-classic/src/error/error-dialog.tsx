import { AlertCircle, AlertTriangle, Lock, ServerOff, WifiOff } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";

import { PACKAGE_NAMESPACE } from "./locales";
import { useOptionalTranslation } from "../i18n";
import {
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Flex,
  Stack,
  Text,
} from "@simplix-react/ui";
import type { ErrorCategory } from "@simplix-react/api";
import {
  useErrorStore,
  dismissError,
  dismissAllErrors,
} from "./error-store";
import { BoundedDialogContent } from "../layout";

const categoryConfig: Record<
  ErrorCategory,
  {
    icon: React.ReactNode;
    iconClassName: string;
    titleKey: string;
  }
> = {
  server: {
    icon: <AlertTriangle size={20} className="text-red-500" />,
    iconClassName: "bg-red-50 dark:bg-red-950/30",
    titleKey: "error.serverErrorShort",
  },
  client: {
    icon: <AlertTriangle size={20} className="text-amber-500" />,
    iconClassName: "bg-amber-50 dark:bg-amber-950/30",
    titleKey: "error.clientErrorShort",
  },
  network: {
    icon: <WifiOff size={20} className="text-slate-500" />,
    iconClassName: "bg-slate-100 dark:bg-slate-800/30",
    titleKey: "error.networkErrorShort",
  },
  auth: {
    icon: <Lock size={20} className="text-slate-500" />,
    iconClassName: "bg-slate-100 dark:bg-slate-800/30",
    titleKey: "error.accessDeniedShort",
  },
  validation: {
    icon: <AlertCircle size={20} className="text-yellow-500" />,
    iconClassName: "bg-yellow-50 dark:bg-yellow-950/30",
    titleKey: "error.validationErrorShort",
  },
  unknown: {
    icon: <AlertTriangle size={20} className="text-gray-500" />,
    iconClassName: "bg-gray-100 dark:bg-gray-800/30",
    titleKey: "error.unknownErrorShort",
  },
};

/**
 * Gateway/unavailable responses (dev-proxy 502 while the backend restarts, LB
 * 503/504) reach a mutation as a bare HTTP shell — no envelope, so the raw
 * message is just "HTTP 502". They are transient infrastructure hiccups, not a
 * rejected request, so the dialog names them calmly and tells the user to retry.
 */
const GATEWAY_STATUSES = new Set([502, 503, 504]);
const gatewayConfig = {
  icon: <ServerOff size={20} className="text-amber-500" />,
  iconClassName: "bg-amber-50 dark:bg-amber-950/30",
  titleKey: "error.serviceUnavailableShort",
};

export function ErrorDialog() {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const { tOr } = useOptionalTranslation("common");
  const errors = useErrorStore();
  const current = errors[0];

  if (!current) return null;

  const isGateway = current.status !== undefined && GATEWAY_STATUSES.has(current.status);
  const config = isGateway ? gatewayConfig : categoryConfig[current.category];
  // The server message names the actual rule that rejected the request ("not enough leave
  // balance"); the per-code text only describes the code class ("conflicts with existing
  // data — check for duplicates"), which contradicts the real reason as often as it explains
  // it. So the generic line is a fallback for a message-less error, never a companion to one.
  const codeKey = current.errorCode ? `error.codes.${current.errorCode}` : null;
  const generic = codeKey ? tOr(codeKey, "") : "";
  // A gateway error's raw message is just "HTTP 502" — replace it with an actionable
  // "temporarily unavailable, retry" line rather than surfacing the status shell.
  // A rejected request answers "which field, and by which rule" one level below the envelope's
  // own message, which says no more than that validation failed. Those lines are the only thing
  // that tells somebody what to change, so they lead when they are there.
  const fieldReasons = isGateway ? undefined : current.validationErrors;
  const reason = isGateway ? t("error.serviceUnavailable") : current.message || generic;

  return (
    <Dialog open onOpenChange={() => dismissError()}>
      <BoundedDialogContent>
        <DialogHeader>
          <Flex align="center" gap="sm">
            {/* The circle and its tint have no token — the design system names four tones and
                these are five kinds of failure — but centring is `Flex`'s job, not a class list's. */}
            <Flex
              align="center"
              justify="center"
              className={`size-8 rounded-full ${config.iconClassName}`}
            >
              {config.icon}
            </Flex>
            <DialogTitle>{t(config.titleKey)}</DialogTitle>
          </Flex>
          <DialogDescription>{reason}</DialogDescription>
        </DialogHeader>

        {fieldReasons && fieldReasons.length > 0 && (
          <Stack gap="xs">
            {fieldReasons.map((fieldReason) => (
              <Text key={`${fieldReason.field}:${fieldReason.message}`} size="sm">
                {fieldReason.message}
              </Text>
            ))}
          </Stack>
        )}

        <DialogFooter>
          <Flex gap="sm" justify="end">
            {errors.length > 1 && (
              <Button variant="outline" onClick={dismissAllErrors}>
                {t("error.dismissAll")} ({errors.length})
              </Button>
            )}
            <Button onClick={dismissError}>{t("error.close")}</Button>
          </Flex>
        </DialogFooter>
      </BoundedDialogContent>
    </Dialog>
  );
}
