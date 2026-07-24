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

export interface DeclinedWord extends BaseCard {
  nominative: string;
  genitive: GenitiveForm;
  declension: 1 | 2 | 3 | 4 | 5;
  gender: Gender;
}

export interface NounCard extends DeclinedWord {
  partOfSpeech: 'noun';
}

export interface AdjectiveCard extends DeclinedWord {
  partOfSpeech: 'adjective';
}

// Future: VerbCard, PrepositionCard, OtherCard join this union.
export type Card = NounCard | AdjectiveCard;

export interface CategoryFile {
  category: Category;
  cards: Card[];
}
