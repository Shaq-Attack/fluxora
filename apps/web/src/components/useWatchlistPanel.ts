import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { isKrakenPairSupported } from '@fluxora/data';
import { useMarketStore } from '../store/marketStore';
import { useWatchlistStore } from '../store/watchlistStore';

export interface WatchlistRow {
  symbol: string;
  lastPrice: number | null;
  changePercent24h: number | null;
  isActive: boolean;
}

export interface UseWatchlistPanelResult {
  rows: WatchlistRow[];
  inputValue: string;
  isValidating: boolean;
  addError: string | null;
  handleSelectSymbol: (symbol: string) => void;
  handleAddSymbol: () => void;
  handleRemoveSymbol: (symbol: string) => void;
  handleInputChange: (value: string) => void;
}

export function useWatchlistPanel(): UseWatchlistPanelResult {
  const { watchlist, addSymbol, removeSymbol } = useWatchlistStore(
    useShallow((s) => ({
      watchlist: s.watchlist,
      addSymbol: s.addSymbol,
      removeSymbol: s.removeSymbol,
    })),
  );

  const { tickers, activeSymbol, setActiveSymbol } = useMarketStore(
    useShallow((s) => ({
      tickers: s.tickers,
      activeSymbol: s.activeSymbol,
      setActiveSymbol: s.setActiveSymbol,
    })),
  );

  const [inputValue, setInputValue] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const rows: WatchlistRow[] = watchlist.map((symbol) => {
    const ticker = tickers[symbol];
    return {
      symbol,
      lastPrice: ticker?.price ?? null,
      changePercent24h: ticker?.changePercent24h ?? null,
      isActive: symbol === activeSymbol,
    };
  });

  const handleSelectSymbol = useCallback(
    (symbol: string): void => {
      setActiveSymbol(symbol);
    },
    [setActiveSymbol],
  );

  const handleAddSymbol = useCallback((): void => {
    const trimmed = inputValue.trim().toUpperCase();
    if (trimmed.length === 0) return;
    setAddError(null);
    setIsValidating(true);
    void isKrakenPairSupported(trimmed).then((supported) => {
      setIsValidating(false);
      if (!supported) {
        setAddError(`${trimmed} is not a supported pair at this time.`);
        return;
      }
      addSymbol(trimmed);
      setInputValue('');
    });
  }, [inputValue, addSymbol]);

  const handleRemoveSymbol = useCallback(
    (symbol: string): void => {
      removeSymbol(symbol);
    },
    [removeSymbol],
  );

  const handleInputChange = useCallback((value: string): void => {
    setInputValue(value);
    setAddError(null);
  }, []);

  return {
    rows,
    inputValue,
    isValidating,
    addError,
    handleSelectSymbol,
    handleAddSymbol,
    handleRemoveSymbol,
    handleInputChange,
  };
}
