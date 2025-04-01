// src/components/game-ui/GameStats.tsx
import styles from '../GameMode.module.css';

interface GameStatsProps {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  remainingQuestions: number;
  marathonMode: boolean;
}

export default function GameStats({
  totalQuestions,
  answeredQuestions,
  correctAnswers,
  remainingQuestions,
  marathonMode
}: GameStatsProps) {
  return (
    <div className={styles.stats}>
      <div className={styles.stat}>
        <span>Всего вопросов:</span> {totalQuestions}
      </div>
      <div className={styles.stat}>
        <span>Отвечено:</span> {answeredQuestions}
      </div>
      <div className={styles.stat}>
        <span>Правильно:</span> {correctAnswers}
      </div>
      {marathonMode && (
        <div className={styles.stat}>
          <span>Осталось вопросов:</span> {remainingQuestions}
        </div>
      )}
    </div>
  );
}