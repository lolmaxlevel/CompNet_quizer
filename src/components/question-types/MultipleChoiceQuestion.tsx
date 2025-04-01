// src/components/question-types/MultipleChoiceQuestion.tsx
import styles from '../GameMode.module.css';
import React from "react";

interface MultipleChoiceQuestionProps {
  shuffledAnswers: {answer: any, originalIndex: number}[];
  userAnswers: number[];
  setUserAnswers: React.Dispatch<React.SetStateAction<any[]>>;
  isChecked: boolean;
}

export default function MultipleChoiceQuestion({
  shuffledAnswers,
  userAnswers,
  setUserAnswers,
  isChecked
}: MultipleChoiceQuestionProps) {

  const toggleAnswer = (index: number) => {
    if (isChecked) return;

    if (userAnswers.includes(index)) {
      setUserAnswers(userAnswers.filter(i => i !== index));
    } else {
      setUserAnswers([...userAnswers, index]);
    }
  };

  return (
    <div className={styles.answersContainer}>
      {shuffledAnswers.map((item, idx) => (
        <div
          key={idx}
          className={`${styles.answerOption}
            ${userAnswers.includes(item.originalIndex) ? styles.selected : ''}
            ${isChecked && item.answer.is_correct ? styles.correct : ''}
            ${isChecked && userAnswers.includes(item.originalIndex) && !item.answer.is_correct ? styles.incorrect : ''}`}
          onClick={() => toggleAnswer(item.originalIndex)}
        >
          {item.answer.text}
        </div>
      ))}
    </div>
  );
}