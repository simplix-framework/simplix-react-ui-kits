import { useState } from "react";
import { ChevronDownIcon, DownloadIcon } from "lucide-react";
import {
  addToast,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  saveBlob,
} from "@simplix-react/ui";
import { useTranslation } from "@simplix-react/i18n/react";

import { serverMessage } from "../api";
import { PACKAGE_NAMESPACE } from "../entity/locales";

/** The file kinds a list export offers; each is also the saved file's extension. */
export type ExportFileFormat = "csv" | "xlsx";

/** Every file kind, in the order the menu offers them. */
export const EXPORT_FILE_FORMATS: readonly ExportFileFormat[] = ["xlsx", "csv"];

/** Props for {@link ExportAction}. */
export interface ExportActionProps {
  /**
   * Fetches the file in one format: a generated request function whose response SimpliX Meta
   * declares binary, with the format passed as the endpoint names it.
   */
  readonly fetch: (format: ExportFileFormat) => Promise<Blob>;
  /** The saved file's name without extension, asked at the moment it is saved. */
  readonly fileName: string | (() => string);
  /** The formats offered; one format draws a plain button, several a menu. Defaults to all. */
  readonly formats?: readonly ExportFileFormat[];
  /** Defaults to the kit's 「Export」. */
  readonly label?: string;
  readonly disabled?: boolean;
}

/** What one export does with the bytes and with a refusal, apart from the control that starts it. */
export async function runExport(
  props: Pick<ExportActionProps, "fetch" | "fileName">,
  format: ExportFileFormat,
  save: (blob: Blob, fileName: string) => void,
  failed: (caught: unknown) => void,
): Promise<void> {
  let blob: Blob;
  try {
    blob = await props.fetch(format);
  } catch (caught) {
    failed(caught);
    return;
  }
  const base = typeof props.fileName === "function" ? props.fileName() : props.fileName;
  save(blob, `${base}.${format}`);
}

/**
 * A list page's header action that downloads what the list shows as a file, in Excel or CSV. The
 * caller hands the request with the list's current filters already bound, so the file holds the
 * rows the reader narrowed to. The control says it is working while the file is fetched, and a
 * refusal is told by a toast naming the server's reason.
 */
export function ExportAction({ fetch, fileName, formats = EXPORT_FILE_FORMATS, label, disabled }: ExportActionProps) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/features`);
  const [running, setRunning] = useState(false);

  const start = async (format: ExportFileFormat) => {
    setRunning(true);
    try {
      await runExport({ fetch, fileName }, format, saveBlob, (caught) =>
        addToast({ type: "error", message: serverMessage(caught) ?? t("exportAction.failed") }),
      );
    } finally {
      setRunning(false);
    }
  };

  const caption = running ? t("exportAction.running") : (label ?? t("exportAction.label"));
  const [only] = formats;
  if (formats.length === 1 && only) {
    return (
      <Button size="sm" variant="outline" onClick={() => void start(only)} disabled={disabled || running}>
        <DownloadIcon />
        {caption}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled || running}>
          <DownloadIcon />
          {caption}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.map((format) => (
          <DropdownMenuItem key={format} onSelect={() => void start(format)}>
            {t(`exportAction.format.${format}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
