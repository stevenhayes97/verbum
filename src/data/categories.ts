import type { Category } from '../types/flashcard';

export interface CategoryMeta {
  id: Category;
  label: string;
  dataUrl: string;
  enabled: boolean;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'nouns', label: 'Nouns', dataUrl: '/data/nouns.json', enabled: true },
  { id: 'verbs', label: 'Verbs', dataUrl: '/data/verbs.json', enabled: false },
  { id: 'adjectives', label: 'Adjectives', dataUrl: '/data/adjectives.json', enabled: true },
  { id: 'prepositions', label: 'Prepositions', dataUrl: '/data/prepositions.json', enabled: false },
  { id: 'other', label: 'Other', dataUrl: '/data/other.json', enabled: false },
];
