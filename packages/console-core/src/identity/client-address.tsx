import { EmptyValue, Text, type TextProps } from "@simplix-react/ui";

import { isLocalAddress, readableAddress } from "./ip-address";

export interface ClientAddressProps {
  /** The masked address the server recorded, absent when it recorded none. */
  readonly value: string | undefined;
  /** How large the address is drawn, so a table cell and a detail row can differ. */
  readonly size?: TextProps["size"];
  /** Whether the address is drawn muted, for the places it sits under a name. */
  readonly tone?: TextProps["tone"];
}

/**
 * Where a request came from, as the audit record kept it.
 *
 * <p><b>What arrives is already masked and is not yet readable.</b> The server zeroes the host part
 * on the way in, and a servlet container reached over loopback writes IPv6 the long way — so a cell
 * printing the value raw shows `0:0:0:0:0:0:0:1` beside `0:0:0:0:0:0:0:0` for one sign-in, which
 * reads as two machines and as a fault in the product.
 *
 * <p>So the two shapes are separated. An address that names a network is collapsed to the notation
 * every other tool prints. An address that names nothing — loopback, or the unspecified address —
 * is an em dash, the same mark these screens already use for a value the record does not have.
 *
 * <p><b>Monospace in every place it appears.</b> An address is compared against another address
 * far more often than it is read as a word, and a proportional font makes two that differ in one
 * group look alike.
 */
export function ClientAddress({ value, size = "sm", tone }: ClientAddressProps) {
  if (isLocalAddress(value)) {
    return <EmptyValue />;
  }
  return (
    <Text size={size} tone={tone} font="mono">
      {readableAddress(value ?? "")}
    </Text>
  );
}
