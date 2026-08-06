import type { Card } from '../types/flashcard';
import { foldMacrons } from './latin';

// The declension(s) a card belongs to, or [] if its part of speech doesn't
// decline at all (verbs, prepositions, other). Some cards belong to more
// than one: a 1st/2nd-declension triplet adjective (bonus, -a, -um) spans
// both, since it borrows 1st-declension endings for the feminine and
// 2nd-declension endings for the masculine/neuter.
//
// Adverbs are themselves indeclinable -- nothing about "far" or "bravely"
// changes for case or number -- so "declension" doesn't strictly apply to
// them. But each adverb is formed from an adjective, and its ending reveals
// which declension family that source adjective came from: a bare -ē marks
// a 1st/2nd-declension source (longus -> longē), while -iter/-ter/-er marks
// a 3rd-declension source (fortis -> fortiter, prūdēns -> prūdenter) -- the
// same split adjectives already record via declensionLabel.
export function getDeclensions(card: Card): number[] {
  switch (card.partOfSpeech) {
    case 'noun':
      return [card.declension];
    case 'adjective':
      if (card.adjectiveForm === 'declined') return [card.declension];
      return card.declensionLabel === '1st/2nd' ? [1, 2] : [3];
    case 'adverb':
      // Folded, because the data writes this ending long ("-ē") -- a bare
      // 'e' comparison would file every 1st/2nd-declension adverb as 3rd.
      return foldMacrons(card.adverb.ending) === 'e' ? [1, 2] : [3];
    default:
      return [];
  }
}

export function cardMatchesFilters(card: Card, selectedTags: string[], selectedDeclensions: number[]): boolean {
  const tagMatch = selectedTags.length === 0 || (card.tags?.some((t) => selectedTags.includes(t)) ?? false);
  const declensionMatch = selectedDeclensions.length === 0 || getDeclensions(card).some((d) => selectedDeclensions.includes(d));
  return tagMatch && declensionMatch;
}
