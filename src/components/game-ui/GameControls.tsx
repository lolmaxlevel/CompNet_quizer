// src/components/game-ui/GameControls.tsx
import styles from '../GameMode.module.css';

interface GameControlsProps {
  isChecked: boolean;
  onCheck: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export default function GameControls({
  isChecked,
  onCheck,
  onNext,
  onSkip
}: GameControlsProps) {
  return (
    <div className={styles.controls}>
      {!isChecked && (
        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onSkip}>
          Пропустить
        </button>
      )}

      {!isChecked && (
        <button className={styles.btn} onClick={onCheck}>
          Проверить
        </button>
      )}

      {isChecked && (
        <button className={styles.btn} onClick={onNext}>
          Следующий вопрос
        </button>
      )}
    </div>
  );
}