import styles from './PronunciationGuide.module.css';

// Built from import.meta.env.BASE_URL for the same reason App.tsx does it --
// a plain "/pronunciation-guide.html" path breaks once the site is served
// from the /verbum/ subpath on GitHub Pages.
const GUIDE_URL = `${import.meta.env.BASE_URL}pronunciation-guide.html`;

export function PronunciationGuide() {
  return (
    <iframe
      className={styles.frame}
      src={GUIDE_URL}
      title="Latin Pronunciation Guide"
    />
  );
}
