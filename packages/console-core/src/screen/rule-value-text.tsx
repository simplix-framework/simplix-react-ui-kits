import { useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { Button, Flex, Text } from "@simplix-react/ui";

import { NumericText } from "../layout/numeric-text";
import { PACKAGE_NAMESPACE } from "./locales";
import { readRuleValue, type RuleData } from "./rule-value";
import { SourceBadge, type ValueSource } from "./source-badge";
import { StatuteBasisDialog, type StatuteBasis } from "./statute-basis";

/** Props for {@link RuleValueText}. */
export interface RuleValueTextProps {
  /** The rule key, which names the rule in the basis dialog when no `subject` is given. */
  readonly ruleKey: string;
  readonly rule: RuleData;
  /** Which layer set the value, drawn on the badge. */
  readonly source: ValueSource;
  /** The basis of each clause id the rule cites, as the server sent it. */
  readonly clauses: Readonly<Record<string, StatuteBasis>>;
  /** The rule's own name, for the dialog's title. */
  readonly subject?: string;
}

function citation(basis: StatuteBasis | undefined): string {
  return [basis?.law, basis?.article].filter(Boolean).join(" ");
}

/**
 * One rule's value, unit and comparison, such as 「≥ 2 m」, with its source badge beside it.
 *
 * <p>Pressing the badge opens the basis-clause dialog for the clauses the rule cites. A rule
 * awaiting interpretation draws 「해석 보류」 in place of its value, and a rule without a value draws
 * 「미확정」, never 0. A rule citing no clause the server resolved draws the badge without a press.
 */
export function RuleValueText({ ruleKey, rule, source, clauses, subject }: RuleValueTextProps) {
  const { t, locale } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const [open, setOpen] = useState(false);
  const reading = readRuleValue(rule, locale);
  const cited = rule.sourceClauseIds.map((id) => clauses[id]).filter((basis): basis is StatuteBasis => Boolean(citation(basis)));
  const [first, ...rest] = cited;
  const badge = <SourceBadge source={source} basis={cited.map(citation).join(" · ") || undefined} />;
  return (
    <Flex gap="xs" align="center" wrap>
      {reading.kind === "value" ? (
        <NumericText size="sm" weight="medium">{reading.text}</NumericText>
      ) : (
        <Text as="span" size="sm" tone="muted">
          {t(`ruleValue.${reading.kind}`)}
        </Text>
      )}
      {first ? (
        <>
          <Button type="button" size="sm" variant="ghost" aria-label={t("ruleValue.openBasis")} onClick={() => setOpen(true)}>
            {badge}
          </Button>
          <StatuteBasisDialog basis={first} subject={subject ?? ruleKey} open={open} onOpenChange={setOpen}>
            {rest.map((basis) => (
              <Text key={citation(basis)} size="sm">
                {citation(basis)}
              </Text>
            ))}
          </StatuteBasisDialog>
        </>
      ) : (
        badge
      )}
    </Flex>
  );
}
