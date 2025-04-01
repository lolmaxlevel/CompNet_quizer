// src/utils/types.ts
export interface Answer {
  text: string;
  is_correct: boolean;
}

export interface Question {
  id: number;
  type: string;
  right: number;
  value: string;
  text: string;
  images: string[];
  answers: Answer[];
  group: string;
}

export interface QuestionGroup {
  id: number;
  name: string;
  totalQuestions: number;
  randomQuestions: number;
  questionIds: number[];
}

