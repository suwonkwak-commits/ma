import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { advanceGame, createInitialState, hydrateGameState, type GameState } from '../game/engine';

const SAVE_KEY = '@murim-chronicles/game-v1';
export type SaveStatus = 'loading' | 'saved' | 'error';

export function useGame() {
  const [game, setGame] = useState<GameState>(() => createInitialState(Date.now()));
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('loading');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const current = useRef(game);
  const queue = useRef(Promise.resolve());
  const alive = useRef(true);
  current.current = game;

  const save = useCallback((value: GameState) => {
    const serialized = JSON.stringify(value);
    queue.current = queue.current.catch(() => undefined).then(async () => {
      try {
        await AsyncStorage.setItem(SAVE_KEY, serialized);
        if (alive.current) setSaveStatus('saved');
      } catch {
        if (alive.current) setSaveStatus('error');
      }
    });
  }, []);

  useEffect(() => {
    alive.current = true;
    let cancelled = false;
    void (async () => {
      let raw: unknown = null;
      try {
        const stored = await AsyncStorage.getItem(SAVE_KEY);
        if (stored) {
          try { raw = JSON.parse(stored); } catch { raw = null; }
        }
      } catch {
        // A failed read is not an empty save. Never overwrite unread progress.
        if (!cancelled) setSaveStatus('error');
        return;
      }
      if (cancelled) return;
      const next = hydrateGameState(raw, Date.now());
      current.current = next;
      setGame(next);
      setLoaded(true);
      setSaveStatus('saved');
    })();
    return () => { cancelled = true; alive.current = false; };
  }, [loadAttempt]);

  useEffect(() => {
    if (!loaded) return;
    let foreground = AppState.currentState !== 'background';
    const resumeGame = () => {
      const now = Date.now();
      setGame(previous => now - previous.lastTick > 30_000
        ? hydrateGameState(previous, now)
        : advanceGame(previous, now));
    };
    const tick = setInterval(() => {
      if (foreground && (Platform.OS !== 'web' || document.visibilityState === 'visible')) {
        setGame(previous => advanceGame(previous, Date.now()));
      }
    }, 1000);
    const autosave = setInterval(() => save(current.current), 3000);
    const subscription = AppState.addEventListener('change', status => {
      foreground = status === 'active';
      if (status === 'active') {
        resumeGame();
      } else save(current.current);
    });
    const flush = () => save(current.current);
    const resume = () => {
      if (document.visibilityState === 'visible') resumeGame();
      else flush();
    };
    if (Platform.OS === 'web') {
      window.addEventListener('pagehide', flush);
      document.addEventListener('visibilitychange', resume);
    }
    return () => {
      clearInterval(tick);
      clearInterval(autosave);
      subscription.remove();
      if (Platform.OS === 'web') {
        window.removeEventListener('pagehide', flush);
        document.removeEventListener('visibilitychange', resume);
      }
    };
  }, [loaded, save]);

  const act = useCallback((action: (previous: GameState) => GameState) => {
    if (!loaded) return;
    // Refs make rapid presses and an immediate background save observe the same state.
    const next = action(advanceGame(current.current, Date.now()));
    current.current = next;
    setGame(next);
    save(next);
  }, [loaded, save]);

  const reset = useCallback(() => {
    if (!loaded) return;
    const next = createInitialState(Date.now());
    current.current = next;
    setGame(next);
    save(next);
  }, [loaded, save]);

  return {
    game, loaded, saveStatus, act, reset,
    retrySave: () => { if (loaded) save(current.current); },
    retryLoad: () => { setSaveStatus('loading'); setLoadAttempt(attempt => attempt + 1); },
  };
}
