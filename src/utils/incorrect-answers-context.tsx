// src/utils/incorrect-answers-context.tsx
'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface IncorrectAnswersContextType {
  incorrectAnswers: Record<string, number[]>;
  isIncorrect: (testId: string, questionId: number) => boolean;
  addIncorrect: (testId: string, questionId: number) => void;
  removeIncorrect: (testId: string, questionId: number) => void;
  getIncorrectByTest: (testId: string) => number[];
}

const IncorrectAnswersContext = createContext<IncorrectAnswersContextType | undefined>(undefined);

export function IncorrectAnswersProvider({ children }: { children: ReactNode }) {
  const [incorrectAnswers, setIncorrectAnswers] = useState<Record<string, number[]>>({});

  useEffect(() => {
    try {
      const savedIncorrect = localStorage.getItem('incorrectAnswers');
      if (savedIncorrect) {
        setIncorrectAnswers(JSON.parse(savedIncorrect));
      }
    } catch (e) {
      console.error('Error loading incorrect answers from localStorage', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('incorrectAnswers', JSON.stringify(incorrectAnswers));
  }, [incorrectAnswers]);

  const isIncorrect = (testId: string, questionId: number) => {
    return incorrectAnswers[testId]?.includes(questionId) || false;
  };

  const addIncorrect = (testId: string, questionId: number) => {
    setIncorrectAnswers(prev => {
      const testIncorrect = prev[testId] || [];
      if (!testIncorrect.includes(questionId)) {
        return { ...prev, [testId]: [...testIncorrect, questionId] };
      }
      return prev;
    });
  };

  const removeIncorrect = (testId: string, questionId: number) => {
    setIncorrectAnswers(prev => ({
      ...prev,
      [testId]: (prev[testId] || []).filter(id => id !== questionId)
    }));
  };

  const getIncorrectByTest = (testId: string) => {
    return incorrectAnswers[testId] || [];
  };

  return (
    <IncorrectAnswersContext.Provider value={{
      incorrectAnswers, isIncorrect, addIncorrect, removeIncorrect, getIncorrectByTest
    }}>
      {children}
    </IncorrectAnswersContext.Provider>
  );
}

export function useIncorrectAnswers() {
  const context = useContext(IncorrectAnswersContext);
  if (context === undefined) {
    throw new Error('useIncorrectAnswers must be used within an IncorrectAnswersProvider');
  }
  return context;
}