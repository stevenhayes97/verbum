import type { Card } from '../../types/flashcard';
import styles from './SetCustomizer.module.css';

interface SetCustomizerProps {
  cards: Card[];
  selectedTag: string | null;
  onTagChange: (tag: string | null) => void;
  cardCount: number | null;
  onCardCountChange: (count: number | null) => void;
}

function countByTag(cards: Card[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const card of cards) {
    for (const tag of card.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export function SetCustomizer({ cards, selectedTag, onTagChange, cardCount, onCardCountChange }: SetCustomizerProps) {
  const tagCounts = countByTag(cards);
  const poolSize = selectedTag ? (tagCounts.find(([tag]) => tag === selectedTag)?.[1] ?? 0) : cards.length;

  return (
    <div className={styles.customizer}>
      <label className={styles.field}>
        Tag
        <select
          className={styles.control}
          value={selectedTag ?? ''}
          onChange={(e) => onTagChange(e.target.value || null)}
        >
          <option value="">All tags ({cards.length})</option>
          {tagCounts.map(([tag, count]) => (
            <option key={tag} value={tag}>
              {tag} ({count})
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        Count
        <input
          className={styles.control}
          type="number"
          min={1}
          max={poolSize || undefined}
          placeholder={`${poolSize}`}
          value={cardCount ?? ''}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              onCardCountChange(null);
              return;
            }
            const clamped = Math.max(1, Math.min(poolSize, Number(raw)));
            onCardCountChange(clamped);
          }}
        />
      </label>

      {(selectedTag !== null || cardCount !== null) && (
        <button
          type="button"
          className={styles.reset}
          onClick={() => {
            onTagChange(null);
            onCardCountChange(null);
          }}
        >
          Reset
        </button>
      )}
    </div>
  );
}
