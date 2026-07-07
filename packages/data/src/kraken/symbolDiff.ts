export interface SymbolDiff {
  added: string[];
  removed: string[];
}

export function diffSymbols(current: string[], next: string[]): SymbolDiff {
  const currentSet = new Set(current);
  const nextSet = new Set(next);
  return {
    added: next.filter((s) => !currentSet.has(s)),
    removed: current.filter((s) => !nextSet.has(s)),
  };
}
