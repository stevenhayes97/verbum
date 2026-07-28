import { useEffect, useState } from 'react';
import type { FavoriteWord, FavoritesFile } from '../../types/flashcard';
import styles from './Favorites.module.css';

// Built from import.meta.env.BASE_URL for the same reason categories.ts and
// SentencePractice.tsx do -- a plain "/data/..." path breaks once the site
// is served from the /verbum/ subpath on GitHub Pages.
const FAVORITES_URL = `${import.meta.env.BASE_URL}data/favorites.json`;

export function Favorites() {
  const [words, setWords] = useState<FavoriteWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(FAVORITES_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${FAVORITES_URL}`);
        return res.json() as Promise<FavoritesFile>;
      })
      .then((data) => setWords(data.words))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {loading && <p className={styles.status}>Loading…</p>}
      {error && <p className={styles.status}>{error}</p>}
      {!loading && !error && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Latin</th>
                <th>English</th>
              </tr>
            </thead>
            <tbody>
              {words.map((word) => (
                <tr key={word.id}>
                  <td>
                    {word.nominative}, {word.genitive}
                  </td>
                  <td>{word.english}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
