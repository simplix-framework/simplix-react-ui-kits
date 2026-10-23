import { createContext, useContext, type ReactNode } from "react";

/**
 * What a product hands the kit: the values the kit draws with and knows nothing about.
 *
 * <p>The kit names no product, so the permission subjects its parts check and the mark its sign-in
 * chrome shows arrive here, once per app, rather than as imports of one product's tables.
 */
export interface ConsoleProduct {
  /** Permission subjects by key, as the product registers them with its access policy. */
  readonly subjects: Readonly<Record<string, string>>;
  /** The mark the sign-in chrome shows above the form. */
  readonly brand: ReactNode;
}

const ConsoleProductContext = createContext<ConsoleProduct | null>(null);

/** Props for {@link ConsoleProductProvider}. */
export interface ConsoleProductProviderProps extends ConsoleProduct {
  readonly children: ReactNode;
}

/** Supplies the product's values to every kit part beneath it. Mount once at the app root. */
export function ConsoleProductProvider({ subjects, brand, children }: ConsoleProductProviderProps) {
  return <ConsoleProductContext.Provider value={{ subjects, brand }}>{children}</ConsoleProductContext.Provider>;
}

function useConsoleProduct(): ConsoleProduct {
  const product = useContext(ConsoleProductContext);
  // Thrown rather than defaulted: a kit part that drew without the product's values would check no
  // permission or show no mark, and nothing on the screen would say why.
  if (!product) throw new Error("No ConsoleProductProvider is mounted. Wrap the app root in <ConsoleProductProvider>.");
  return product;
}

/** The permission subject the product registered under `key`. */
export function useConsoleSubject(key: string): string {
  const subject = useConsoleProduct().subjects[key];
  if (subject === undefined) throw new Error(`ConsoleProductProvider has no permission subject "${key}".`);
  return subject;
}

/** The product's mark for the sign-in chrome. */
export function useConsoleBrand(): ReactNode {
  return useConsoleProduct().brand;
}
