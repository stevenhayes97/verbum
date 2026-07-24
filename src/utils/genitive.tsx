import type { GenitiveForm } from '../types/flashcard';

export function GenitiveDisplay({ genitive }: { genitive: GenitiveForm }) {
  return (
    <>
      {genitive.stem}
      <strong>{genitive.ending}</strong>
    </>
  );
}

const ORDINAL_SUFFIXES: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };

export function ordinal(n: number): string {
  return `${n}${ORDINAL_SUFFIXES[n] ?? 'th'}`;
}
