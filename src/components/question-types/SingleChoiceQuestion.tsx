// src/components/question-types/SingleChoiceQuestion.tsx
import styles from '../GameMode.module.css';
import React from "react";

interface SingleChoiceQuestionProps {
  shuffledAnswers: {answer: any, originalIndex: number}[];
  userAnswers: number[];
  setUserAnswers: React.Dispatch<React.SetStateAction<any[]>>;
  isChecked: boolean;
}

export default function SingleChoiceQuestion({
  shuffledAnswers,
  userAnswers,
  setUserAnswers,
  isChecked
}: SingleChoiceQuestionProps) {
  return (
    <div className={styles.answersContainer}>
      {shuffledAnswers.map((item, idx) => (
        <div
          key={idx}
          className={`${styles.answerOption}
            ${userAnswers[0] === item.originalIndex ? styles.selected : ''}
            ${isChecked && item.answer.is_correct ? styles.correct : ''}
            ${isChecked && userAnswers[0] === item.originalIndex && !item.answer.is_correct ? styles.incorrect : ''}`}
          onClick={() => !isChecked && setUserAnswers([item.originalIndex])}
        >
          {item.answer.text}
        </div>
      ))}
    </div>
  );
}