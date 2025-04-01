// src/components/question-types/TextInputQuestion.tsx
import styles from '../GameMode.module.css';
import React from "react";
import { Question } from '@/utils/types';

interface TextInputQuestionProps {
  question: Question;
  userAnswers: string[];
  setUserAnswers: React.Dispatch<React.SetStateAction<any[]>>;
  isChecked: boolean;
}

export default function TextInputQuestion({
  question,
  userAnswers,
  setUserAnswers,
  isChecked
}: TextInputQuestionProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isChecked) return;
    setUserAnswers([e.target.value]);
  };

  const isCorrect = () => {
    if (!userAnswers[0] || !question.answers[0]) return false;

    // Case insensitive comparison
    const userAnswer = userAnswers[0].toLowerCase().trim();
    const correctAnswers = question.answers.map(a => a.text.toLowerCase().trim());

    return correctAnswers.includes(userAnswer);
  };

  return (
    <div className={styles.textInputContainer}>
      <input
        type="text"
        className={`${styles.textInput} 
          ${isChecked && isCorrect() ? styles.correct : ''}
          ${isChecked && !isCorrect() ? styles.incorrect : ''}`}
        value={userAnswers[0] || ''}
        onChange={handleInputChange}
        placeholder="Введите ответ"
        disabled={isChecked}
      />

      {isChecked && (
        <div className={styles.correctAnswer}>
          <p>Правильный ответ: {question.answers.map(a => a.text).join(' или ')}</p>
        </div>
      )}
    </div>
  );
}