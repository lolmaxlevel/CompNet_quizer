// src/components/game-ui/GameResult.tsx
import styles from '../GameMode.module.css';

interface GameResultProps {
  stats: {
    totalAnswered: number;
    correctAnswers: number;
  };
  onRestart: () => void;
}

export default function GameResult({ stats, onRestart }: GameResultProps) {
  const percentCorrect = stats.totalAnswered > 0
    ? Math.round((stats.correctAnswers / stats.totalAnswered) * 100)
    : 0;

  return (
    <div className={styles.marathonComplete}>
      <h2>Марафон завершен!</h2>
      <div className={styles.marathonStats}>
        <p>Всего вопросов: {stats.totalAnswered}</p>
        <p>Правильных ответов: {stats.correctAnswers}</p>
        <p>Процент правильных: {percentCorrect}%</p>
      </div>
      <button
        className={styles.btn}
        onClick={onRestart}
      >
        Начать заново
      </button>
    </div>
  );
}