import { describe, it, expect } from 'vitest';
import { diffSymbols } from './symbolDiff';

describe('diffSymbols', () => {
  it('returns no additions or removals when the lists are identical', () => {
    const result = diffSymbols(['BTC/USD', 'ETH/USD'], ['BTC/USD', 'ETH/USD']);
    expect(result).toEqual({ added: [], removed: [] });
  });

  it('detects a symbol added to the list', () => {
    const result = diffSymbols(['BTC/USD'], ['BTC/USD', 'ETH/USD']);
    expect(result).toEqual({ added: ['ETH/USD'], removed: [] });
  });

  it('detects a symbol removed from the list', () => {
    const result = diffSymbols(['BTC/USD', 'ETH/USD'], ['BTC/USD']);
    expect(result).toEqual({ added: [], removed: ['ETH/USD'] });
  });

  it('detects simultaneous additions and removals', () => {
    const result = diffSymbols(['BTC/USD', 'ETH/USD'], ['BTC/USD', 'SOL/USD']);
    expect(result).toEqual({ added: ['SOL/USD'], removed: ['ETH/USD'] });
  });
});
