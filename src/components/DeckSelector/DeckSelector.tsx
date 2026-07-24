import { CATEGORIES } from '../../data/categories';
import type { Category } from '../../types/flashcard';
import styles from './DeckSelector.module.css';

interface DeckSelectorProps {
  selected: Category;
  onSelect: (category: Category) => void;
}

export function DeckSelector({ selected, onSelect }: DeckSelectorProps) {
  return (
    <div className={styles.selector}>
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          type="button"
          className={`${styles.tab} ${category.id === selected ? styles.active : ''}`}
          disabled={!category.enabled}
          title={category.enabled ? undefined : 'Coming soon'}
          onClick={() => onSelect(category.id)}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
