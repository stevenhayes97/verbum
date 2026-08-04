import { useEffect, useState } from 'react';
import { CATEGORIES } from './data/categories';
import type { Card, Category, CategoryFile, Section, SentenceDirection } from './types/flashcard';
import { SectionNav } from './components/SectionNav/SectionNav';
import { DeckSelector } from './components/DeckSelector/DeckSelector';
import { SetCustomizer } from './components/SetCustomizer/SetCustomizer';
import { Flashcard } from './components/Flashcard/Flashcard';
import { CardNav } from './components/CardNav/CardNav';
import { SentencePractice } from './components/SentencePractice/SentencePractice';
import { Favorites } from './components/Favorites/Favorites';
import { VocabList } from './components/VocabList/VocabList';
import { DeclensionTables } from './components/DeclensionTables/DeclensionTables';
import { About } from './components/About/About';
import { useSentenceDeck } from './hooks/useSentenceDeck';
import { shuffle } from './utils/shuffle';
import { DEFAULT_MAX_CARDS } from './utils/constants';
import { cardMatchesFilters } from './utils/declension';
import styles from './App.module.css';

async function fetchCategoryCards(dataUrl: string): Promise<Card[]> {
  const res = await fetch(dataUrl);
  if (!res.ok) throw new Error(`Failed to load ${dataUrl}`);
  const data = (await res.json()) as CategoryFile;
  return data.cards;
}

// Built from import.meta.env.BASE_URL for the same reason categories.ts does
// it -- a plain "/data/..." path breaks once the site is served from the
// /verbum/ subpath on GitHub Pages.
const SENTENCES_URL = `${import.meta.env.BASE_URL}data/sentences.json`;
const EN_LA_SENTENCES_URL = `${import.meta.env.BASE_URL}data/sentences-en-la.json`;

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
  const [section, setSection] = useState<Section>('flashcards');
  const [selectedCategory, setSelectedCategory] = useState<Category>('nouns');
  const [rawCards, setRawCards] = useState<Card[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDeclensions, setSelectedDeclensions] = useState<number[]>([]);
  const [cardCount, setCardCount] = useState<number | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sentence Practice state lives here (not inside SentencePractice) for the
  // same reason the flashcard state above does: App never unmounts when
  // `section` changes, only the JSX under each `section === '...'` branch
  // does, so keeping the decks here lets you leave for Declension Tables (or
  // any other section) and come back to the same sentence instead of a
  // freshly-refetched deck at index 0.
  //
  // The two directions are separate decks, each with its own file, filter and
  // position, so switching between them doesn't disturb the other. Both hooks
  // are called unconditionally; only the `active` argument changes.
  const [sentenceDirection, setSentenceDirection] = useState<SentenceDirection>('la-en');
  const inSentencePractice = section === 'sentence-practice';
  const laEnDeck = useSentenceDeck(SENTENCES_URL, inSentencePractice && sentenceDirection === 'la-en');
  const enLaDeck = useSentenceDeck(EN_LA_SENTENCES_URL, inSentencePractice && sentenceDirection === 'en-la');
  const sentenceDeck = sentenceDirection === 'la-en' ? laEnDeck : enLaDeck;

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
        setSelectedTags([]);
        setSelectedDeclensions([]);
        setCardCount(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  // Derives the displayed deck from the raw category cards plus the
  // tag/declension/count filters -- re-shuffles and re-slices on any filter
  // change without re-fetching. Multiple selected tags (or declensions) are
  // OR'd together within their own dimension (a card matches if it has any
  // of them), since most cards only carry one tag -- requiring all selected
  // tags on one card would return almost nothing. The tag and declension
  // dimensions are AND'd together.
  useEffect(() => {
    const pool = rawCards.filter((c) => cardMatchesFilters(c, selectedTags, selectedDeclensions));
    const deck = shuffle(pool);
    const limit = cardCount ?? Math.min(pool.length, DEFAULT_MAX_CARDS);
    setCards(deck.slice(0, limit));
    setCurrentIndex(0);
  }, [rawCards, selectedTags, selectedDeclensions, cardCount]);

  const currentCard = cards[currentIndex];

  return (
    <div className={styles.app} style={backgroundStyle}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1 className={styles.title}>Verbum</h1>
        <SectionNav selected={section} onSelect={setSection} />

        {section === 'flashcards' && (
          <>
            <DeckSelector selected={selectedCategory} onSelect={setSelectedCategory} />

            {loading && <p className={styles.status}>Loading…</p>}
            {error && <p className={styles.status}>{error}</p>}
            {!loading && !error && (
              <SetCustomizer
                cards={rawCards}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                selectedDeclensions={selectedDeclensions}
                onDeclensionsChange={setSelectedDeclensions}
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
          </>
        )}

        {section === 'sentence-practice' && (
          <SentencePractice
            direction={sentenceDirection}
            onDirectionChange={setSentenceDirection}
            sentences={sentenceDeck.sentences}
            currentIndex={sentenceDeck.currentIndex}
            onIndexChange={sentenceDeck.setCurrentIndex}
            loading={sentenceDeck.loading}
            error={sentenceDeck.error}
            selectedDifficulties={sentenceDeck.selectedDifficulties}
            onDifficultiesChange={sentenceDeck.setSelectedDifficulties}
          />
        )}
        {section === 'about' && <About />}
        {section === 'vocab-list' && <VocabList />}
        {section === 'favorites' && <Favorites />}
        {section === 'declension-tables' && <DeclensionTables />}

        <footer className={styles.footer}>
          Verbum — a Latin flashcard app
        </footer>
      </div>
    </div>
  );
}

export default App;
