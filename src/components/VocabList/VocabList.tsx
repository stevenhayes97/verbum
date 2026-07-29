import { useEffect, useState } from 'react';
import { CATEGORIES } from '../../data/categories';
import type { Card, CategoryFile } from '../../types/flashcard';
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

  useEffect(() => {
    setLoading(true);
    setError(null);

    const metas = CATEGORIES.filter((c) => c.enabled && c.id !== 'all');

    Promise.all(metas.map((meta) => fetchCategoryCards(meta.dataUrl)))
      .then((cardLists) => {
        setGroups(
          metas.map((meta, i) => ({
            label: meta.label,
            cards: [...cardLists[i]].sort((a, b) =>
              headword(a).localeCompare(headword(b), undefined, { sensitivity: 'base' }),
            ),
          })),
        );
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {loading && <p className={styles.status}>Loading…</p>}
      {error && <p className={styles.status}>{error}</p>}
      {!loading && !error && (
        <div className={styles.listWrap}>
          {groups.map((group) => (
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
    </div>
  );
}
