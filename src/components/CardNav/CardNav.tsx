import styles from './CardNav.module.css';

interface CardNavProps {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onShuffle: () => void;
}

export function CardNav({ index, total, onPrev, onNext, onShuffle }: CardNavProps) {
  return (
    <div className={styles.nav}>
      <button type="button" onClick={onPrev} disabled={total === 0}>
        ← Prev
      </button>
      <span className={styles.counter}>
        {total === 0 ? '0 / 0' : `${index + 1} / ${total}`}
      </span>
      <button type="button" onClick={onNext} disabled={total === 0}>
        Next →
      </button>
      <button type="button" onClick={onShuffle} disabled={total === 0} className={styles.shuffle}>
        Shuffle
      </button>
    </div>
  );
}
