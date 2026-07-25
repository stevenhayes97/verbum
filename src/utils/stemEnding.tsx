import type { StemEndingForm } from '../types/flashcard';

export function StemEndingDisplay({ form }: { form: StemEndingForm }) {
  return (
    <>
      {form.stem}
      <strong>{form.ending}</strong>
    </>
  );
}

const ORDINAL_SUFFIXES: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };

export function ordinal(n: number): string {
  return `${n}${ORDINAL_SUFFIXES[n] ?? 'th'}`;
}
