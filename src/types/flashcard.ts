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

// Future: VerbCard, PrepositionCard, OtherCard join this union.
export type Card = NounCard | AdjectiveCard;

export interface CategoryFile {
  category: Category;
  cards: Card[];
}
