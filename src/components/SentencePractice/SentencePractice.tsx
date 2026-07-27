import { useEffect, useState } from 'react';
import type { Sentence, SentenceFile } from '../../types/flashcard';
import { CardNav } from '../CardNav/CardNav';
import { SentenceCard } from './SentenceCard';
import { shuffle } from '../../utils/shuffle';
import styles from './SentencePractice.module.css';

// Built from import.meta.env.BASE_URL for the same reason categories.ts does
// it -- a plain "/data/..." path breaks once the site is served from the
// /verbum/ subpath on GitHub Pages.
const SENTENCES_URL = `${import.meta.env.BASE_URL}data/sentences.json`;

export function SentencePractice() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(SENTENCES_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${SENTENCES_URL}`);
        return res.json() as Promise<SentenceFile>;
      })
      .then((data) => {
        setSentences(shuffle(data.sentences));
        setCurrentIndex(0);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const current = sentences[currentIndex];

  return (
    <div>
      <p className={styles.intro}>Translate the Latin, then tap the card to check yourself.</p>

      {loading && <p className={styles.status}>Loading…</p>}
      {error && <p className={styles.status}>{error}</p>}
      {!loading && !error && current && (
        <>
          <SentenceCard sentence={current} />
          <CardNav
            index={currentIndex}
            total={sentences.length}
            onPrev={() => setCurrentIndex((i) => (i - 1 + sentences.length) % sentences.length)}
            onNext={() => setCurrentIndex((i) => (i + 1) % sentences.length)}
            onShuffle={() => setSentences((s) => shuffle(s))}
          />
        </>
      )}
    </div>
  );
}
