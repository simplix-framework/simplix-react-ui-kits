import { useState } from "react";
import { DownloadIcon } from "lucide-react";
import { addToast, Button, saveBlob } from "@simplix-react/ui";
import { useTranslation } from "@simplix-react/i18n/react";

import { serverMessage } from "../api";
import { PACKAGE_NAMESPACE } from "../entity/locales";

/** Props for {@link ExportAction}. */
export interface ExportActionProps {
  /** Fetches the file: a generated request function whose response SimpliX Meta declares binary. */
  readonly fetch: () => Promise<Blob>;
  /** The name the file is saved under, asked at the moment it is saved. */
  readonly fileName: string | (() => string);
  /** Defaults to the kit's 「Export」. */
  readonly label?: string;
  readonly disabled?: boolean;
}

/** What one export does with the bytes and with a refusal, apart from the button that starts it. */
export async function runExport(
  props: Pick<ExportActionProps, "fetch" | "fileName">,
  save: (blob: Blob, fileName: string) => void,
  failed: (caught: unknown) => void,
): Promise<void> {
  let blob: Blob;
  try {
    blob = await props.fetch();
  } catch (caught) {
    failed(caught);
    return;
  }
  save(blob, typeof props.fileName === "function" ? props.fileName() : props.fileName);
}

/**
 * A list page's header action that downloads what the list shows as a file. The caller hands the
 * request with the list's current filters already bound, so the file holds the rows the reader
 * narrowed to. The button says it is working while the file is fetched, and a refusal is told by
 * a toast naming the server's reason.
 */
export function ExportAction({ fetch, fileName, label, disabled }: ExportActionProps) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/features`);
  const [running, setRunning] = useState(false);

  const start = async () => {
    setRunning(true);
    try {
      await runExport({ fetch, fileName }, saveBlob, (caught) =>
        addToast({ type: "error", message: serverMessage(caught) ?? t("exportAction.failed") }),
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={() => void start()} disabled={disabled || running}>
      <DownloadIcon />
      {running ? t("exportAction.running") : (label ?? t("exportAction.label"))}
    </Button>
  );
}
