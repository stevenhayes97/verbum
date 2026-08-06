import { useEffect, useMemo, useState } from 'react';
import { CATEGORIES } from '../../data/categories';
import type { Card, CategoryFile } from '../../types/flashcard';
import { foldMacrons } from '../../utils/latin';
import styles from './VocabList.module.css';

interface Group {
  label: string;
  cards: Card[];
}

function headword(card: Card): string {
  switch (card.partOfSpeech) {
    case 'noun':
      return card.nominative;
    case 'adjective':
      return card.adjectiveForm === 'triplet' ? card.masculine : card.nominative;
    case 'verb':
      return card.presentFirstSingular;
    case 'adverb':
      return `${card.adverb.stem}${card.adverb.ending}`;
    case 'preposition':
      return card.preposition;
    default:
      return '';
  }
}

function latinText(card: Card): string {
  switch (card.partOfSpeech) {
    case 'noun':
      return `${card.nominative}, ${card.genitive.stem}${card.genitive.ending}`;
    case 'adjective':
      return card.adjectiveForm === 'triplet'
        ? `${card.masculine}, ${card.feminine}, ${card.neuter}`
        : `${card.nominative}, ${card.genitive.stem}${card.genitive.ending}`;
    case 'verb':
      return card.presentFirstSingular;
    case 'adverb':
      return `${card.adverb.stem}${card.adverb.ending}`;
    case 'preposition':
      return card.preposition;
    default:
      return '';
  }
}

// Matches against the same Latin text the row shows (so a search for a
// genitive like "patris" hits) plus the English gloss. Macrons are folded
// off both sides, so "rex" finds "rēx" and pasting "rēx" back in still
// works -- typing vowel length isn't practical on a laptop keyboard.
function matches(card: Card, query: string): boolean {
  return foldMacrons(`${latinText(card)} ${card.english}`).toLowerCase().includes(query);
}

async function fetchCategoryCards(dataUrl: string): Promise<Card[]> {
  const res = await fetch(dataUrl);
  if (!res.ok) throw new Error(`Failed to load ${dataUrl}`);
  const data = (await res.json()) as CategoryFile;
  return data.cards;
}

export function VocabList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);

    const metas = CATEGORIES.filter((c) => c.enabled && c.id !== 'all');

    Promise.all(metas.map((meta) => fetchCategoryCards(meta.dataUrl)))
      .then((cardLists) => {
        setGroups(
          metas.map((meta, i) => ({
            label: meta.label,
            // sensitivity: 'base' already folds case and macrons, so ordering
            // agrees with the macron-insensitive matching in matches().
            cards: [...cardLists[i]].sort((a, b) =>
              headword(a).localeCompare(headword(b), undefined, { sensitivity: 'base' }),
            ),
          })),
        );
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Groups that end up with no matching card drop out entirely, so the
  // headings left standing all have rows under them.
  const visibleGroups = useMemo(() => {
    const needle = foldMacrons(query).trim().toLowerCase();
    if (!needle) return groups;
    return groups
      .map((group) => ({ ...group, cards: group.cards.filter((card) => matches(card, needle)) }))
      .filter((group) => group.cards.length > 0);
  }, [groups, query]);

  return (
    <div>
      {loading && <p className={styles.status}>Loading…</p>}
      {error && <p className={styles.status}>{error}</p>}
      {!loading && !error && (
        <>
          <p className={styles.disclaimer}>
            For more complete or nuanced definitions, consult the Logeion app or a Lewis &amp;
            Short dictionary.
          </p>
          <div className={styles.searchWrap}>
            <input
              type="search"
              className={styles.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Latin or English…"
              aria-label="Search vocabulary"
            />
          </div>
          {visibleGroups.length === 0 ? (
            <p className={styles.empty}>No words match “{query.trim()}”.</p>
          ) : (
            <div className={styles.listWrap}>
              {visibleGroups.map((group) => (
                <div key={group.label} className={styles.group}>
                  <h2 className={styles.groupTitle}>{group.label}</h2>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Latin</th>
                        <th>English</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.cards.map((card) => (
                        <tr key={card.id}>
                          <td>{latinText(card)}</td>
                          <td>{card.english}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
