/**
 * How a masked client address is said to a person.
 *
 * <p><b>What arrives is already masked, and masking is not the same as readable.</b> The audit
 * record zeroes an address's host part on the way in — an IPv4 loses its last octet, an IPv6 its
 * last group — so what a screen receives is a network rather than a machine, which is the point.
 * What it also receives, on a deployment reached over loopback, is `0:0:0:0:0:0:0:0`: the servlet
 * container writes the unspecified IPv6 address in full, the mask leaves it as it found it, and
 * eight groups of zero reach the reader as a string that looks like a fault in the product.
 *
 * <p>Two shapes are therefore separated here. An address that names a network is abbreviated and
 * shown. An address that names nothing — loopback, or the unspecified address — is not an answer
 * to 「어디에서」 at all, and a sentence built around it says less than the sentence without it.
 */

/** IPv6 written the long way, as a servlet container reports it. */
const IPV6_GROUPS = /^[0-9a-fA-F]{1,4}(:[0-9a-fA-F]{1,4}){7}$/;

/**
 * Whether this address tells the reader nothing about where a request came from.
 *
 * @param address the masked address the server recorded, absent when it recorded none
 * @returns whether a sentence naming it would be worse than one that does not
 */
export function isLocalAddress(address: string | undefined): boolean {
  if (!address) {
    return true;
  }
  const value = address.trim().toLowerCase();
  if (value === "" || value === "::" || value === "::0" || value === "::1") {
    return true;
  }
  // The unspecified and loopback addresses written in full, which is the form that actually
  // arrives. `0:0:0:0:0:0:0:0` is what a masked loopback becomes, and it is the common case on a
  // development deployment.
  if (IPV6_GROUPS.test(value) && /^0(:0){6}:[01]$/.test(value)) {
    return true;
  }
  // 127.0.0.0/8 masked to its network, and the network itself.
  return value === "127.0.0.0" || value.startsWith("127.");
}

/**
 * The masked address as a person reads it.
 *
 * <p>An IPv6 written in full is collapsed at its longest run of zero groups, which is the notation
 * every other tool prints and the only one short enough to sit inside a sentence. An IPv4 and an
 * already-abbreviated IPv6 are returned as they came.
 *
 * @param address the masked address the server recorded
 * @returns the same address in the notation it is normally written in
 */
export function readableAddress(address: string): string {
  const value = address.trim();
  if (!IPV6_GROUPS.test(value)) {
    return value;
  }
  const groups = value.toLowerCase().split(":").map((group) => group.replace(/^0+(?=.)/, ""));

  let bestStart = -1;
  let bestLength = 0;
  let start = -1;
  for (let i = 0; i <= groups.length; i += 1) {
    if (i < groups.length && groups[i] === "0") {
      if (start < 0) start = i;
      continue;
    }
    if (start >= 0) {
      const length = i - start;
      // Only a run of two or more is worth collapsing — `::` standing for one group is the same
      // number of characters and is not how the notation is written.
      if (length > bestLength && length > 1) {
        bestStart = start;
        bestLength = length;
      }
      start = -1;
    }
  }
  if (bestStart < 0) {
    return groups.join(":");
  }
  const head = groups.slice(0, bestStart).join(":");
  const tail = groups.slice(bestStart + bestLength).join(":");
  return `${head}::${tail}`;
}
