import type { SentenceDirection } from '../../types/flashcard';
import styles from './SentenceDirectionToggle.module.css';

interface SentenceDirectionToggleProps {
  direction: SentenceDirection;
  onDirectionChange: (direction: SentenceDirection) => void;
}

const DIRECTIONS: { id: SentenceDirection; label: string }[] = [
  { id: 'la-en', label: 'Latin → English' },
  { id: 'en-la', label: 'English → Latin' },
];

export function SentenceDirectionToggle({ direction, onDirectionChange }: SentenceDirectionToggleProps) {
  return (
    <div className={styles.toggle}>
      {DIRECTIONS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={`${styles.tab} ${id === direction ? styles.active : ''}`}
          aria-pressed={id === direction}
          onClick={() => onDirectionChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
