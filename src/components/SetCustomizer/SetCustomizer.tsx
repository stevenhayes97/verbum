import { useState } from 'react';
import type { Card } from '../../types/flashcard';
import { DEFAULT_MAX_CARDS, MAX_SELECTED_TAGS } from '../../utils/constants';
import { cardMatchesFilters, getDeclensions } from '../../utils/declension';
import { ordinal } from '../../utils/stemEnding';
import styles from './SetCustomizer.module.css';

interface SetCustomizerProps {
  cards: Card[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  selectedDeclensions: number[];
  onDeclensionsChange: (declensions: number[]) => void;
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

function countByDeclension(cards: Card[]): [number, number][] {
  const counts = new Map<number, number>();
  for (const card of cards) {
    for (const declension of getDeclensions(card)) {
      counts.set(declension, (counts.get(declension) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => a[0] - b[0]);
}

export function SetCustomizer({
  cards,
  selectedTags,
  onTagsChange,
  selectedDeclensions,
  onDeclensionsChange,
  cardCount,
  onCardCountChange,
}: SetCustomizerProps) {
  const [open, setOpen] = useState(false);
  const tagCounts = countByTag(cards);
  const declensionCounts = countByDeclension(cards);
  const poolSize = cards.filter((c) => cardMatchesFilters(c, selectedTags, selectedDeclensions)).length;
  const atCap = selectedTags.length >= MAX_SELECTED_TAGS;
  const filtered = selectedTags.length > 0 || selectedDeclensions.length > 0 || cardCount !== null;

  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else if (!atCap) {
      onTagsChange([...selectedTags, tag]);
    }
  }

  function toggleDeclension(declension: number) {
    if (selectedDeclensions.includes(declension)) {
      onDeclensionsChange(selectedDeclensions.filter((d) => d !== declension));
    } else {
      onDeclensionsChange([...selectedDeclensions, declension]);
    }
  }

  const filterCount = selectedTags.length + selectedDeclensions.length;
  const toggleLabel = filtered
    ? `Advanced (${filterCount} filter${filterCount === 1 ? '' : 's'} · ${poolSize} card${poolSize === 1 ? '' : 's'}) ${open ? '▾' : '▸'}`
    : `Advanced ${open ? '▾' : '▸'}`;

  return (
    <div className={styles.customizer}>
      <div className={styles.summaryRow}>
        <button type="button" className={styles.advancedToggle} onClick={() => setOpen((o) => !o)}>
          {toggleLabel}
        </button>

        {filtered && (
          <button
            type="button"
            className={styles.reset}
            onClick={() => {
              onTagsChange([]);
              onDeclensionsChange([]);
              onCardCountChange(null);
            }}
          >
            Reset
          </button>
        )}
      </div>

      {open && (
        <>
          <div className={styles.field}>
            <span>
              Tags (up to {MAX_SELECTED_TAGS}) — {poolSize} card{poolSize === 1 ? '' : 's'}
            </span>
            <div className={styles.tagPills}>
              {tagCounts.map(([tag, count]) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`${styles.tagPill} ${selected ? styles.selected : ''}`}
                    disabled={!selected && atCap}
                    title={!selected && atCap ? `Deselect a tag to pick a different one (max ${MAX_SELECTED_TAGS})` : undefined}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {declensionCounts.length > 0 && (
            <div className={styles.field}>
              <span>Declension</span>
              <div className={styles.tagPills}>
                <button
                  type="button"
                  className={`${styles.tagPill} ${selectedDeclensions.length === 0 ? styles.selected : ''}`}
                  onClick={() => onDeclensionsChange([])}
                >
                  All
                </button>
                {declensionCounts.map(([declension, count]) => {
                  const selected = selectedDeclensions.includes(declension);
                  return (
                    <button
                      key={declension}
                      type="button"
                      className={`${styles.tagPill} ${selected ? styles.selected : ''}`}
                      onClick={() => toggleDeclension(declension)}
                    >
                      {ordinal(declension)} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <label className={styles.field}>
            Count
            <input
              className={styles.control}
              type="number"
              min={1}
              max={poolSize || undefined}
              placeholder={`${Math.min(poolSize, DEFAULT_MAX_CARDS)}`}
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
        </>
      )}
    </div>
  );
}
