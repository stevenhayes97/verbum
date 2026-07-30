import type { Sentence } from '../../types/flashcard';
import { CardNav } from '../CardNav/CardNav';
import { SentenceCard } from './SentenceCard';
import styles from './SentencePractice.module.css';

interface SentencePracticeProps {
  sentences: Sentence[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onShuffle: () => void;
  loading: boolean;
  error: string | null;
}

export function SentencePractice({
  sentences,
  currentIndex,
  onIndexChange,
  onShuffle,
  loading,
  error,
}: SentencePracticeProps) {
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
            onPrev={() => onIndexChange((currentIndex - 1 + sentences.length) % sentences.length)}
            onNext={() => onIndexChange((currentIndex + 1) % sentences.length)}
            onShuffle={onShuffle}
          />
        </>
      )}
    </div>
  );
}
