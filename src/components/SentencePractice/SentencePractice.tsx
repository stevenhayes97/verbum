import type { Difficulty, Sentence } from '../../types/flashcard';
import { CardNav } from '../CardNav/CardNav';
import { SentenceCard } from './SentenceCard';
import { SentenceFilters } from './SentenceFilters';
import styles from './SentencePractice.module.css';

interface SentencePracticeProps {
  sentences: Sentence[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  loading: boolean;
  error: string | null;
  selectedDifficulties: Difficulty[];
  onDifficultiesChange: (difficulties: Difficulty[]) => void;
}

export function SentencePractice({
  sentences,
  currentIndex,
  onIndexChange,
  loading,
  error,
  selectedDifficulties,
  onDifficultiesChange,
}: SentencePracticeProps) {
  const current = sentences[currentIndex];

  return (
    <div>
      <p className={styles.intro}>
        Translate the Latin, then tap the card to check yourself. Each difficulty tier is one short
        story, so the cards run in order.
      </p>

      <SentenceFilters selectedDifficulties={selectedDifficulties} onDifficultiesChange={onDifficultiesChange} />

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
          />
        </>
      )}
    </div>
  );
}
