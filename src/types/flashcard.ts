export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'other';
export type Category = 'all' | 'nouns' | 'verbs' | 'adjectives' | 'adverbs' | 'prepositions' | 'other';
export type Section =
  | 'flashcards'
  | 'about'
  | 'sentence-practice'
  | 'favorites'
  | 'vocab-list'
  | 'declension-tables'
  | 'pronunciation-guide';
export type Gender = 'Male' | 'Female' | 'Neuter';

export interface StemEndingForm {
  stem: string;
  ending: string;
}

export interface BaseCard {
  id: string;
  english: string;
  notes?: string;
  examples?: string[];
  // Thematic tags cutting across part-of-speech categories (e.g. "family",
  // "military"). Assigned on demand, checked against the canonical list in
  // README.md to avoid duplicate/near-duplicate tags.
  tags?: string[];
}

export interface DeclinedWord extends BaseCard {
  nominative: string;
  genitive: StemEndingForm;
  declension: 1 | 2 | 3 | 4 | 5;
  gender: Gender;
}

export interface NounCard extends DeclinedWord {
  partOfSpeech: 'noun';
}

// 3rd-declension-style adjectives (fortis, felix, ...): same nominative/genitive
// shape as a noun, since they don't have 3 distinct gender forms.
export interface DeclinedAdjectiveCard extends DeclinedWord {
  partOfSpeech: 'adjective';
  adjectiveForm: 'declined';
}

// 1st/2nd-declension adjectives (bonus, -a, -um): distinct masculine/feminine/neuter forms.
export interface TripleFormAdjectiveCard extends BaseCard {
  partOfSpeech: 'adjective';
  adjectiveForm: 'triplet';
  masculine: string;
  feminine: string;
  neuter: string;
  declensionLabel: string;
}

export type AdjectiveCard = DeclinedAdjectiveCard | TripleFormAdjectiveCard;

export type Conjugation = '1st' | '2nd' | '3rd' | '4th';

export interface VerbCard extends BaseCard {
  partOfSpeech: 'verb';
  presentFirstSingular: string;
  infinitive: StemEndingForm;
  perfectFirstSingular: string;
  perfectPassiveParticiple: string;
  conjugation: Conjugation;
}

export interface AdverbCard extends BaseCard {
  partOfSpeech: 'adverb';
  adverb: StemEndingForm;
  sourceAdjective: string;
}

export type PrepositionCase = 'Accusative' | 'Ablative';

export interface PrepositionCard extends BaseCard {
  partOfSpeech: 'preposition';
  preposition: string;
  grammaticalCase: PrepositionCase;
}

// Future: OtherCard joins this union.
export type Card = NounCard | AdjectiveCard | VerbCard | AdverbCard | PrepositionCard;

export interface CategoryFile {
  category: Category;
  cards: Card[];
}

export type Difficulty = 'warm-up' | 'easy' | 'intermediate' | 'challenging';

// Which way a sentence card runs: 'la-en' shows the Latin and reveals the
// English (comprehension), 'en-la' shows the English and reveals the Latin
// (composition). Each direction has its own sentence file -- see the
// "Sentence Practice" section of README.md.
export type SentenceDirection = 'la-en' | 'en-la';

export interface Sentence {
  id: string;
  latin: string;
  english: string;
  difficulty: Difficulty;
}

// Shape of both sentence files (sentences.json and sentences-en-la.json).
// Unlike the vocab files, they're wiped and regenerated wholesale each
// refresh (see CLAUDE.md) -- the `generated` date makes that lifecycle
// visible in the data itself rather than only in the docs.
export interface SentenceFile {
  generated: string;
  sentences: Sentence[];
}

// A personal, growing reference list -- unlike Sentence, this is display-only
// (a table row, not a flip card), so it skips the declension/gender/stem-
// ending fields NounCard needs for flashcard mechanics.
export interface FavoriteWord {
  id: string;
  nominative: string;
  genitive: string;
  english: string;
}

export interface FavoritesFile {
  words: FavoriteWord[];
}
