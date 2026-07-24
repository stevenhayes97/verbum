import { useEffect, useState } from 'react';
import type { Card } from '../../types/flashcard';
import { GenitiveDisplay, ordinal } from '../../utils/genitive';
import styles from './Flashcard.module.css';

function renderFront(card: Card) {
  switch (card.partOfSpeech) {
    case 'noun':
    case 'adjective':
      return (
        <>
          {card.nominative} / <GenitiveDisplay genitive={card.genitive} /> / {ordinal(card.declension)} /{' '}
          {card.gender}
        </>
      );
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
        <div className={`${styles.face} ${styles.front}`}>{renderFront(card)}</div>
        <div className={`${styles.face} ${styles.back}`}>{card.english}</div>
      </div>
    </div>
  );
}
