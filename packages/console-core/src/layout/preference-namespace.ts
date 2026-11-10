import { createContext, useContext } from "react";

/**
 * The app's own preference namespace, the prefix of every preference the console keeps in the
 * browser between visits (`<namespace>.prefs:<name>`). `ConsoleProviders` provides the
 * `namespace` it is given, so two products opened in one browser keep their preferences apart.
 * Where no provider is mounted (a part drawn alone in a test or a board frame) the prefix is `app`.
 */
export const PreferenceNamespaceContext = createContext<string>("app");

/** The preference namespace in force. */
export function usePreferenceNamespace(): string {
  return useContext(PreferenceNamespaceContext);
}
