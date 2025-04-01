// src/components/question-types/RankingQuestion.tsx
import styles from '../GameMode.module.css';
import React from "react";

interface RankingQuestionProps {
  shuffledAnswers: {answer: any, originalIndex: number}[];
  userAnswers: number[];
  setUserAnswers: React.Dispatch<React.SetStateAction<any[]>>;
  isChecked: boolean;
}

export default function RankingQuestion({
  shuffledAnswers,
  userAnswers,
  setUserAnswers,
  isChecked
}: RankingQuestionProps) {

  const handleSelect = (originalIndex: number) => {
    if (isChecked) return;

    // If already selected, remove it
    if (userAnswers.includes(originalIndex)) {
      setUserAnswers(userAnswers.filter(index => index !== originalIndex));
    } else {
      // Add to the ranking
      setUserAnswers([...userAnswers, originalIndex]);
    }
  };

  return (
    <div className={styles.answersContainer}>
      <div className={styles.rankingInstructions}>
        Выберите ответы в правильном порядке
      </div>

      <div className={styles.rankingPreview}>
        {userAnswers.map((originalIndex, idx) => {
          const answer = shuffledAnswers.find(a => a.originalIndex === originalIndex)?.answer;
          return (
            <div
              key={idx}
              className={styles.rankingItem}
              onClick={() => handleSelect(originalIndex)}
            >
              {idx + 1}. {answer?.text}
            </div>
          );
        })}
      </div>

      <div className={styles.rankingOptions}>
        {shuffledAnswers.map((item, idx) => {
          const isSelected = userAnswers.includes(item.originalIndex);
          const correctPosition = isChecked ? item.originalIndex : null;
          const userPosition = userAnswers.indexOf(item.originalIndex);
          const isCorrectPosition = userPosition === correctPosition;

          return (
            <div
              key={idx}
              className={`${styles.answerOption} ${styles.rankingOption}
                ${isSelected ? styles.selected : ''}
                ${isChecked && isCorrectPosition ? styles.correct : ''}
                ${isChecked && isSelected && !isCorrectPosition ? styles.incorrect : ''}`}
              onClick={() => handleSelect(item.originalIndex)}
            >
              {isSelected && <span className={styles.rankNumber}>{userPosition + 1}</span>}
              {item.answer.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}