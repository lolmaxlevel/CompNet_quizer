// src/components/question-types/QuestionRenderer.tsx
import { Question } from '@/utils/types';
import styles from '../GameMode.module.css';
import SingleChoiceQuestion from './SingleChoiceQuestion';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import RankingQuestion from './RankingQuestion';
import MatchingQuestion from './MatchingQuestion';
import TextInputQuestion from './TextInputQuestion';
import React from "react";

interface QuestionRendererProps {
  question: Question;
  shuffledAnswers: {answer: any, originalIndex: number}[];
  userAnswers: any[];
  setUserAnswers: React.Dispatch<React.SetStateAction<any[]>>;
  isChecked: boolean;
}

export default function QuestionRenderer({
  question,
  shuffledAnswers,
  userAnswers,
  setUserAnswers,
  isChecked
}: QuestionRendererProps) {

  switch(question.type) {
    case "1":
      return (
        <SingleChoiceQuestion
          shuffledAnswers={shuffledAnswers}
          userAnswers={userAnswers}
          setUserAnswers={setUserAnswers}
          isChecked={isChecked}
        />
      );
    case "2":
      return (
        <MultipleChoiceQuestion
          shuffledAnswers={shuffledAnswers}
          userAnswers={userAnswers}
          setUserAnswers={setUserAnswers}
          isChecked={isChecked}
        />
      );
    case "3":
      return (
        <RankingQuestion
          shuffledAnswers={shuffledAnswers}
          userAnswers={userAnswers}
          setUserAnswers={setUserAnswers}
          isChecked={isChecked}
        />
      );
    case "6":
      return (
        <MatchingQuestion
          shuffledAnswers={shuffledAnswers}
          userAnswers={userAnswers}
          setUserAnswers={setUserAnswers}
          isChecked={isChecked}
        />
      );
    case "7":
      return (
        <TextInputQuestion
          question={question}
          userAnswers={userAnswers}
          setUserAnswers={setUserAnswers}
          isChecked={isChecked}
        />
      );
    default:
      return <div>Unsupported question type</div>;
  }
}