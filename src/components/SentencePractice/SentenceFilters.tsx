import type { Difficulty } from '../../types/flashcard';
import styles from './SentenceFilters.module.css';

interface SentenceFiltersProps {
  selectedDifficulties: Difficulty[];
  onDifficultiesChange: (difficulties: Difficulty[]) => void;
}

const TIERS: { id: Difficulty; label: string }[] = [
  { id: 'warm-up', label: 'Warm Up' },
  { id: 'easy', label: 'Easy' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'challenging', label: 'Challenging' },
];

export function SentenceFilters({ selectedDifficulties, onDifficultiesChange }: SentenceFiltersProps) {
  function toggleDifficulty(difficulty: Difficulty) {
    if (selectedDifficulties.includes(difficulty)) {
      onDifficultiesChange(selectedDifficulties.filter((d) => d !== difficulty));
    } else {
      onDifficultiesChange([...selectedDifficulties, difficulty]);
    }
  }

  return (
    <div className={styles.tagPills}>
      <button
        type="button"
        className={`${styles.tagPill} ${selectedDifficulties.length === 0 ? styles.selected : ''}`}
        onClick={() => onDifficultiesChange([])}
      >
        All
      </button>
      {TIERS.map(({ id, label }) => {
        const selected = selectedDifficulties.includes(id);
        return (
          <button
            key={id}
            type="button"
            className={`${styles.tagPill} ${selected ? styles.selected : ''}`}
            onClick={() => toggleDifficulty(id)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
