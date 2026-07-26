import type { Category } from '../types/flashcard';

export interface CategoryMeta {
  id: Category;
  label: string;
  dataUrl: string;
  enabled: boolean;
}

// import.meta.env.BASE_URL accounts for Vite's configured `base` (e.g. the
// /verbum/ subpath on GitHub Pages) — a plain "/data/..." root path would
// resolve wrong once the site isn't served from the domain root.
const DATA_BASE = `${import.meta.env.BASE_URL}data/`;

export const CATEGORIES: CategoryMeta[] = [
  { id: 'nouns', label: 'Nouns', dataUrl: `${DATA_BASE}nouns.json`, enabled: true },
  { id: 'verbs', label: 'Verbs', dataUrl: `${DATA_BASE}verbs.json`, enabled: true },
  { id: 'adjectives', label: 'Adjectives', dataUrl: `${DATA_BASE}adjectives.json`, enabled: true },
  { id: 'adverbs', label: 'Adverbs', dataUrl: `${DATA_BASE}adverbs.json`, enabled: true },
  { id: 'prepositions', label: 'Prepositions', dataUrl: `${DATA_BASE}prepositions.json`, enabled: false },
  { id: 'other', label: 'Other', dataUrl: `${DATA_BASE}other.json`, enabled: false },
  // dataUrl unused -- App.tsx special-cases 'all' to fetch+merge every
  // other enabled category instead of a single file.
  { id: 'all', label: 'All', dataUrl: '', enabled: true },
];
