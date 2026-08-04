import type { Difficulty, Sentence, SentenceDirection } from '../../types/flashcard';
import { CardNav } from '../CardNav/CardNav';
import { SentenceCard } from './SentenceCard';
import { SentenceDirectionToggle } from './SentenceDirectionToggle';
import { SentenceFilters } from './SentenceFilters';
import styles from './SentencePractice.module.css';

interface SentencePracticeProps {
  direction: SentenceDirection;
  onDirectionChange: (direction: SentenceDirection) => void;
  sentences: Sentence[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  loading: boolean;
  error: string | null;
  selectedDifficulties: Difficulty[];
  onDifficultiesChange: (difficulties: Difficulty[]) => void;
}

export function SentencePractice({
  direction,
  onDirectionChange,
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
        {direction === 'la-en'
          ? 'Translate the Latin, then tap the card to check yourself.'
          : 'Compose the Latin, then tap the card to check yourself.'}{' '}
        Each difficulty tier is one short story, so the cards run in order.
      </p>

      <SentenceDirectionToggle direction={direction} onDirectionChange={onDirectionChange} />
      <SentenceFilters selectedDifficulties={selectedDifficulties} onDifficultiesChange={onDifficultiesChange} />

      {loading && <p className={styles.status}>Loading…</p>}
      {error && <p className={styles.status}>{error}</p>}
      {!loading && !error && current && (
        <>
          <SentenceCard sentence={current} direction={direction} />
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
