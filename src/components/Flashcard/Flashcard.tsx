import { useEffect, useState } from 'react';
import type { AdjectiveCard, Card, DeclinedWord, NounCard, VerbCard } from '../../types/flashcard';
import { StemEndingDisplay, ordinal } from '../../utils/stemEnding';
import styles from './Flashcard.module.css';

function declinedFront(card: DeclinedWord) {
  return (
    <>
      {card.nominative} / <StemEndingDisplay form={card.genitive} /> / {ordinal(card.declension)} / {card.gender}
    </>
  );
}

function tripletFront(card: Extract<AdjectiveCard, { adjectiveForm: 'triplet' }>) {
  return (
    <>
      {card.masculine} / {card.feminine} / {card.neuter} ({card.declensionLabel} decl.)
    </>
  );
}

function verbFront(card: VerbCard) {
  return (
    <>
      {card.presentFirstSingular} / <StemEndingDisplay form={card.infinitive} /> / {card.perfectFirstSingular} /{' '}
      {card.perfectPassiveParticiple} ({card.conjugation} conj.)
    </>
  );
}

function renderFront(card: Card) {
  switch (card.partOfSpeech) {
    case 'noun':
      return declinedFront(card as NounCard);
    case 'adjective':
      return card.adjectiveForm === 'triplet' ? tripletFront(card) : declinedFront(card);
    case 'verb':
      return verbFront(card);
    default:
      return null;
  }
}

export function Flashcard({ card }: { card: Card }) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false);
  }, [card.id]);

  return (
    <div
      className={styles.scene}
      onClick={() => setFlipped((f) => !f)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
    >
      <div className={`${styles.inner} ${flipped ? styles.isFlipped : ''}`}>
        <div className={`${styles.face} ${styles.front}`}>
          <span>{renderFront(card)}</span>
        </div>
        <div className={`${styles.face} ${styles.back}`}>{card.english}</div>
      </div>
    </div>
  );
}
