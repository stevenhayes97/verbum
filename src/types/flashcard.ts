export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'preposition' | 'other';
export type Category = 'nouns' | 'verbs' | 'adjectives' | 'prepositions' | 'other';
export type Gender = 'Male' | 'Female' | 'Neuter';

export interface GenitiveForm {
  stem: string;
  ending: string;
}

export interface BaseCard {
  id: string;
  english: string;
  notes?: string;
  examples?: string[];
}

export interface NounCard extends BaseCard {
  partOfSpeech: 'noun';
  nominative: string;
  genitive: GenitiveForm;
  declension: 1 | 2 | 3 | 4 | 5;
  gender: Gender;
}

// Future: VerbCard, AdjectiveCard, PrepositionCard, OtherCard join this union.
export type Card = NounCard;

export interface CategoryFile {
  category: Category;
  cards: Card[];
}
