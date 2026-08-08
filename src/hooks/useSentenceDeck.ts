import { useEffect, useState } from 'react';
import type { Difficulty, Sentence, SentenceFile } from '../types/flashcard';
import { sentenceMatchesFilters } from '../utils/sentence';

export interface SentenceDeck {
  sentences: Sentence[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  loading: boolean;
  error: string | null;
  selectedDifficulties: Difficulty[];
  setSelectedDifficulties: (difficulties: Difficulty[]) => void;
}

// Owns one sentence deck: its fetch, its difficulty filter, and where you
// are in it. Sentence Practice has two decks (Latin -> English and English
// -> Latin, each with its own data file), and they're kept independent so
// switching direction doesn't lose your place or your tier selection in the
// other one -- hence a hook rather than two copies of this state in App.
//
// Call this from a component that stays mounted (App does; the JSX under
// each `section === '...'` branch does not). The state lives wherever the
// hook is called, so calling it somewhere that unmounts on navigation would
// hand you back a freshly-refetched deck at index 0 every visit.
//
// `active` gates the fetch: pass true only when this deck is the one on
// screen, so its file is fetched the first time it's actually needed rather
// than eagerly on app load.
export function useSentenceDeck(dataUrl: string, active: boolean): SentenceDeck {
  const [rawSentences, setRawSentences] = useState<Sentence[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>(['warm-up']);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // `loaded` guards against re-fetching, which would reset the user's place,
  // on every subsequent visit to this deck.
  useEffect(() => {
    if (!active || loaded) return;

    setLoading(true);
    setError(null);

    fetch(dataUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${dataUrl}`);
        return res.json() as Promise<SentenceFile>;
      })
      .then((data) => {
        setRawSentences(data.sentences);
        setLoaded(true);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [dataUrl, active, loaded]);

  // Derives the displayed pool from the raw fetched sentences plus the
  // difficulty filter, resetting to the first card on any filter change.
  // Unlike the vocab deck in App, the pool is deliberately NOT shuffled:
  // each difficulty tier is written as one coherent paragraph (see
  // CLAUDE.md, "Paragraph coherence"), so file order is the reading order.
  // filter() preserves it, which also means selecting several tiers plays
  // their paragraphs back to back rather than interleaving them.
  useEffect(() => {
    const pool = rawSentences.filter((s) => sentenceMatchesFilters(s, selectedDifficulties));
    setSentences(pool);
    setCurrentIndex(0);
  }, [rawSentences, selectedDifficulties]);

  return {
    sentences,
    currentIndex,
    setCurrentIndex,
    loading,
    error,
    selectedDifficulties,
    setSelectedDifficulties,
  };
}
