import type { TimeValue } from "@simplix-react/ui";

/** 「HH:mm」 to the picker's value. */
export function parseTime(text: string | null | undefined): TimeValue | null {
  const match = /^(\d{2}):(\d{2})$/.exec(text ?? "");
  return match ? { hours: Number(match[1]), minutes: Number(match[2]) } : null;
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** A calendar date string, decoded from its own components rather than through a time zone. */
export function parseLocalDate(text: string | undefined): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text ?? "");
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : undefined;
}

export function formatLocalDate(date: Date | undefined): string | undefined {
  return date ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` : undefined;
}

/** A zone-tagged Date from the date-time picker, encoded the way it will be sent. */
export function encodeInstant(date: Date | null): string {
  return date ? (JSON.parse(JSON.stringify(date)) as string) : "";
}

/** The prompt an empty select shows when the field names none: what to do, and the first choices as examples. */
export function choicePrompt(t: (key: string, options?: Record<string, string>) => string, options: readonly { readonly label: string }[]): string {
  const examples = options.slice(0, 2).map((option) => option.label).join(", ");
  return examples ? t("recordForm.choosePromptWithExamples", { examples }) : t("recordForm.choosePrompt");
}
