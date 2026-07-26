import { useEffect, useState } from 'react';
import { CATEGORIES } from './data/categories';
import type { Card, Category, CategoryFile } from './types/flashcard';
import { SectionNav } from './components/SectionNav/SectionNav';
import { DeckSelector } from './components/DeckSelector/DeckSelector';
import { SetCustomizer } from './components/SetCustomizer/SetCustomizer';
import { Flashcard } from './components/Flashcard/Flashcard';
import { CardNav } from './components/CardNav/CardNav';
import { shuffle } from './utils/shuffle';
import styles from './App.module.css';

async function fetchCategoryCards(dataUrl: string): Promise<Card[]> {
  const res = await fetch(dataUrl);
  if (!res.ok) throw new Error(`Failed to load ${dataUrl}`);
  const data = (await res.json()) as CategoryFile;
  return data.cards;
}

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
  const [rawCards, setRawCards] = useState<Card[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [cardCount, setCardCount] = useState<number | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetches whichever category is selected -- 'all' merges every other
  // enabled category instead of loading a single file.
  useEffect(() => {
    setLoading(true);
    setError(null);

    const metas =
      selectedCategory === 'all'
        ? CATEGORIES.filter((c) => c.enabled && c.id !== 'all')
        : CATEGORIES.filter((c) => c.id === selectedCategory);

    Promise.all(metas.map((meta) => fetchCategoryCards(meta.dataUrl)))
      .then((cardLists) => {
        setRawCards(cardLists.flat());
        setSelectedTag(null);
        setCardCount(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  // Derives the displayed deck from the raw category cards plus the tag/count
  // filters -- re-shuffles and re-slices on any filter change without
  // re-fetching.
  useEffect(() => {
    const pool = selectedTag ? rawCards.filter((c) => c.tags?.includes(selectedTag)) : rawCards;
    const deck = shuffle(pool);
    setCards(cardCount ? deck.slice(0, cardCount) : deck);
    setCurrentIndex(0);
  }, [rawCards, selectedTag, cardCount]);

  const currentCard = cards[currentIndex];

  return (
    <div className={styles.app} style={backgroundStyle}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1 className={styles.title}>Verbum</h1>
        <SectionNav />
        <DeckSelector selected={selectedCategory} onSelect={setSelectedCategory} />

        {loading && <p className={styles.status}>Loading…</p>}
        {error && <p className={styles.status}>{error}</p>}
        {!loading && !error && (
          <SetCustomizer
            cards={rawCards}
            selectedTag={selectedTag}
            onTagChange={setSelectedTag}
            cardCount={cardCount}
            onCardCountChange={setCardCount}
          />
        )}
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
