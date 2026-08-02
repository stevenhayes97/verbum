import type { Difficulty, Sentence } from '../types/flashcard';

export function sentenceMatchesFilters(sentence: Sentence, selectedDifficulties: Difficulty[]): boolean {
  return selectedDifficulties.length === 0 || selectedDifficulties.includes(sentence.difficulty);
}
