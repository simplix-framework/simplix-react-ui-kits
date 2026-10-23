import type { ReactNode } from "react";
import { TableCardFrame } from "@simplix-react/ui";
import { slotAttributes } from "@simplix-react/ui/design";

import { tableCardStyle } from "./table-card.style";

interface TableCardProps {
  /** The table. */
  readonly children: ReactNode;
}

/**
 * A card holding a table, clipped to the card's own corners and scrolling inside it.
 *
 * <p><b>The framework's frame, under this product's name.</b> `TableCardFrame` is what
 * `CrudList.TableCard`, `CrudTree.TableCard` and `CrudDetail.Table` all render, and it publishes
 * itself to the table inside so the header sticks while the body scrolls. This held its own
 * `Card` + overflow pair for a while, which drew the same box without the sticky header — two
 * surfaces that resembled each other, and a table in a panel that behaved unlike a table on a
 * list screen.
 *
 * <p><b>It stays as a name because it is the zero-argument spelling.</b> Thirteen screens frame a
 * table with no paging and nothing to configure; making each of them name the frame and pass
 * nothing would be the same call written longer. A table that PAGES uses `CrudDetail.Table`
 * directly, because the pager is the thing it has to be handed.
 */
export function TableCard({ children }: TableCardProps) {
  return (
    <div className="flex min-w-0 flex-col" {...slotAttributes(tableCardStyle, {})}>
      <TableCardFrame>{children}</TableCardFrame>
    </div>
  );
}
