/** Child paths from Vue Router must be absolute before rendering them independently. */
export function normalizeSsgRoutes(paths: string[], extra: string[]): string[] {
  return [
    ...new Set(
      [...paths, ...extra]
        .filter((path) => !path.includes(':'))
        .map((path) => (path.startsWith('/') ? path : `/${path}`)),
    ),
  ];
}
