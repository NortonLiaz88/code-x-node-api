export interface TokenInspector {
  verify: (value: string) => Promise<boolean | null>;
}
