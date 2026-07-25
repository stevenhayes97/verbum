import { useEffect, useState } from 'react';
import { CATEGORIES } from './data/categories';
import type { Card, Category, CategoryFile } from './types/flashcard';
import { DeckSelector } from './components/DeckSelector/DeckSelector';
import { Flashcard } from './components/Flashcard/Flashcard';
import { CardNav } from './components/CardNav/CardNav';
import { shuffle } from './utils/shuffle';
import styles from './App.module.css';

// Root-absolute CSS url()s don't account for Vite's configured base path
// (e.g. the /verbum/ subpath on GitHub Pages), so this is built from
// import.meta.env.BASE_URL and applied inline instead of in index.css.
const backgroundStyle = {
  backgroundImage: `url('${import.meta.env.BASE_URL}images/roman-forum.jpg'), linear-gradient(160deg, #3a2f28 0%, #6b4f3a 45%, #8a6a4a 70%, #4a3527 100%)`,
  backgroundSize: 'cover, cover',
  backgroundPosition: 'center, center',
  backgroundAttachment: 'fixed, fixed',
};

function App() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('nouns');
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const meta = CATEGORIES.find((c) => c.id === selectedCategory);
    if (!meta) return;

    setLoading(true);
    setError(null);

    fetch(meta.dataUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${meta.dataUrl}`);
        return res.json() as Promise<CategoryFile>;
      })
      .then((data) => {
        setCards(shuffle(data.cards));
        setCurrentIndex(0);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const currentCard = cards[currentIndex];

  return (
    <div className={styles.app} style={backgroundStyle}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1 className={styles.title}>Verbum</h1>
        <DeckSelector selected={selectedCategory} onSelect={setSelectedCategory} />

        {loading && <p className={styles.status}>Loading…</p>}
        {error && <p className={styles.status}>{error}</p>}
        {!loading && !error && currentCard && (
          <>
            <Flashcard card={currentCard} />
            <CardNav
              index={currentIndex}
              total={cards.length}
              onPrev={() => setCurrentIndex((i) => (i - 1 + cards.length) % cards.length)}
              onNext={() => setCurrentIndex((i) => (i + 1) % cards.length)}
              onShuffle={() => setCards((c) => shuffle(c))}
            />
          </>
        )}

        <footer className={styles.footer}>
          Verbum — a Latin flashcard app
        </footer>
      </div>
    </div>
  );
}

export default App;
