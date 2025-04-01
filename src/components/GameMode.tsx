// src/components/GameMode.tsx
'use client';

import {useState, useEffect, useCallback, useMemo} from 'react';
import {Question} from '@/utils/types';
import Image from 'next/image';
import styles from './GameMode.module.css';
import QuestionRenderer from './question-types/QuestionRenderer';
import GameStats from './game-ui/GameStats';
import GameControls from './game-ui/GameControls';
import FavoritesManager from './game-ui/FavoritesManager';
import GameResult from './game-ui/GameResult';

interface GameModeProps {
    questions: Question[];
    marathonMode?: boolean;
}

export default function GameMode({questions, marathonMode = false}: GameModeProps) {
    // Core game state
    const [gameState, setGameState] = useState({
        isLoading: true,
        isComplete: false,
        isChecked: false,
        showResult: false,
        isCorrect: false
    });

    // Question management
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [remainingQuestions, setRemainingQuestions] = useState<Question[]>([]);
    const [shuffledAnswers, setShuffledAnswers] = useState<{ answer: any, originalIndex: number }[]>([]);

    // User answers and progress
    const [userAnswers, setUserAnswers] = useState<any[]>([]);
    const [userProgress, setUserProgress] = useState({
        totalAnswered: 0,
        correctAnswers: 0,
        remainingCount: questions.length
    });

    // Favorites functionality
    const [favorites, setFavorites] = useState<number[]>([]);
    const [showFavorites, setShowFavorites] = useState(false);

    // Load favorites from localStorage on mount
    useEffect(() => {
        try {
            const savedFavorites = localStorage.getItem('favoriteQuestions');
            if (savedFavorites) {
                setFavorites(JSON.parse(savedFavorites));
            }
        } catch (e) {
            console.error('Error loading favorites from localStorage', e);
        }

        setGameState(prev => ({...prev, isLoading: false}));
    }, []);

    // Save favorites when they change
    useEffect(() => {
        localStorage.setItem('favoriteQuestions', JSON.stringify(favorites));
    }, [favorites]);

    // Initialize game based on mode
    useEffect(() => {
        if (marathonMode && questions.length > 0) {
            initializeMarathonMode();
        } else {
            initializeRegularMode();
        }
    }, [questions, marathonMode]);

    // Initialize marathon mode
    const initializeMarathonMode = useCallback(() => {
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        setRemainingQuestions(shuffled.slice(1));
        setCurrentQuestion(shuffled[0]);
        setUserProgress(prev => ({
            ...prev,
            remainingCount: shuffled.length - 1
        }));

        if (shuffled[0] && ["1", "2", "3", "4", "6"].includes(shuffled[0].type)) {
            setShuffledAnswers(
                shuffled[0].answers.map((answer, index) => ({
                    answer,
                    originalIndex: index
                })).sort(() => Math.random() - 0.5)
            );
        }

        setGameState(prev => ({
            ...prev,
            isComplete: false,
            isLoading: false
        }));
    }, [questions]);

    // Initialize regular mode
    const initializeRegularMode = useCallback(() => {
        const filteredQuestions = getFilteredQuestions();
        if (filteredQuestions.length === 0) return;

        const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
        const question = filteredQuestions[randomIndex];
        setCurrentQuestion(question);

        if (question && ["1", "2", "3", "4", "6"].includes(question.type)) {
            setShuffledAnswers(
                question.answers.map((answer, index) => ({
                    answer,
                    originalIndex: index
                })).sort(() => Math.random() - 0.5)
            );
        }
    }, [questions, showFavorites, favorites]);

    // Get questions based on favorites filter
    const getFilteredQuestions = useCallback(() => {
        if (showFavorites) {
            return questions.filter(q => favorites.includes(q.id));
        }
        return questions;
    }, [questions, showFavorites, favorites]);

    // Toggle favorite status for a question
    const toggleFavorite = useCallback((questionId: number) => {
        setFavorites(prev => {
            if (prev.includes(questionId)) {
                return prev.filter(id => id !== questionId);
            } else {
                return [...prev, questionId];
            }
        });
    }, []);

    // Load a new question
    const loadNewQuestion = useCallback((skipped: boolean = false) => {
        if (skipped) {
            setUserProgress(prev => ({
                ...prev,
                totalAnswered: prev.totalAnswered + 1
            }));
        }

        setUserAnswers([]);
        setGameState(prev => ({
            ...prev,
            isChecked: false,
            showResult: false
        }));

        if (marathonMode) {
            loadNextMarathonQuestion();
        } else {
            loadRandomQuestion();
        }
    }, [marathonMode, remainingQuestions, getFilteredQuestions]);

    // Load next question in marathon mode
    const loadNextMarathonQuestion = useCallback(() => {
        if (remainingQuestions.length === 0) {
            setGameState(prev => ({...prev, isComplete: true}));
            return;
        }

        const nextQuestion = remainingQuestions[0];
        const updatedRemaining = remainingQuestions.slice(1);

        setCurrentQuestion(nextQuestion);
        setRemainingQuestions(updatedRemaining);
        setUserProgress(prev => ({
            ...prev,
            remainingCount: updatedRemaining.length
        }));

        prepareQuestionAnswers(nextQuestion);
    }, [remainingQuestions]);

    // Load random question for regular mode
    const loadRandomQuestion = useCallback(() => {
        const filteredQuestions = getFilteredQuestions();
        if (filteredQuestions.length === 0) {
            alert('В избранном нет вопросов!');
            setShowFavorites(false);
            return;
        }

        const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
        const question = filteredQuestions[randomIndex];
        setCurrentQuestion(question);

        prepareQuestionAnswers(question);
    }, [getFilteredQuestions]);

    // Prepare shuffled answers for a question
    const prepareQuestionAnswers = useCallback((question: Question) => {
        if (["1", "2", "3", "4", "6"].includes(question.type)) {
            const shuffled = question.answers.map((answer, index) => ({
                answer,
                originalIndex: index
            })).sort(() => Math.random() - 0.5);

            setShuffledAnswers(shuffled);
        }
    }, []);

    // Check user's answer
    const checkAnswer = useCallback(() => {
        if (!currentQuestion) return;

        const questionType = currentQuestion.type || "1";
        let answerIsCorrect = false;

        switch (questionType) {
            case "1": // Single choice
                if (userAnswers.length === 0) {
                    alert('Пожалуйста, выберите ответ!');
                    return;
                }
                answerIsCorrect = currentQuestion.answers[userAnswers[0]].is_correct;
                break;

            case "2": // Multiple choice
                if (userAnswers.length === 0) {
                    alert('Пожалуйста, выберите хотя бы один ответ!');
                    return;
                }

                const correctIndices = currentQuestion.answers
                    .map((answer, index) => answer.is_correct ? index : null)
                    .filter(index => index !== null);

                const userSet = new Set(userAnswers);
                const correctSet = new Set(correctIndices);

                answerIsCorrect = userSet.size === correctSet.size &&
                    [...userSet].every(value => correctSet.has(value));
                break;

            case "3": // Ranking
                if (userAnswers.length === 0) {
                    alert('Пожалуйста, расположите элементы в правильном порядке!');
                    return;
                }

                answerIsCorrect = userAnswers.every((originalIndex, position) => {
                    return position === originalIndex;
                });
                break;

            case "6": // Matching
                if (userAnswers.length < currentQuestion.answers.filter(a => a.text.includes(":::")).length / 2) {
                    alert('Пожалуйста, завершите все сопоставления!');
                    return;
                }

                answerIsCorrect = userAnswers.every(match => match.left === match.right);
                break;

            case "7": // Text input
                if (!userAnswers[0]) {
                    alert('Пожалуйста, введите ответ!');
                    return;
                }

                const userInput = userAnswers[0].toLowerCase().trim();
                answerIsCorrect = currentQuestion.answers.some(answer =>
                    answer.is_correct && answer.text.toLowerCase().trim() === userInput
                );
                break;
        }

        setGameState(prev => ({
            ...prev,
            isCorrect: answerIsCorrect,
            showResult: true,
            isChecked: true
        }));

        setUserProgress(prev => ({
            ...prev,
            totalAnswered: prev.totalAnswered + 1,
            correctAnswers: prev.correctAnswers + (answerIsCorrect ? 1 : 0)
        }));
    }, [currentQuestion, userAnswers]);

    // Restart marathon
    const restartMarathon = useCallback(() => {
        setUserProgress({
            totalAnswered: 0,
            correctAnswers: 0,
            remainingCount: questions.length
        });

        initializeMarathonMode();
    }, [questions, initializeMarathonMode]);

    if (gameState.isLoading) return <div>Loading...</div>;

    if (gameState.isComplete) {
        return (
            <GameResult
                stats={userProgress}
                onRestart={restartMarathon}
            />
        );
    }

    return (
        <div className={styles.gameContainer}>
            <GameStats
                totalQuestions={questions.length}
                answeredQuestions={userProgress.totalAnswered}
                correctAnswers={userProgress.correctAnswers}
                remainingQuestions={userProgress.remainingCount + 1}
                marathonMode={marathonMode}
            />

            {!marathonMode && (
                <FavoritesManager
                    showFavorites={showFavorites}
                    favoritesCount={favorites.length}
                    onToggleView={setShowFavorites}
                />
            )}

            {currentQuestion && (
                <>
                    <div className={styles.questionHeader}>
                        <div className={styles.questionType}>
                            {currentQuestion.type === "1" ? "Одиночный выбор" :
                                currentQuestion.type === "2" ? "Множественный выбор" :
                                    currentQuestion.type === "3" ? "Ранжирование" :
                                        currentQuestion.type === "6" ? "Сопоставление" :
                                            currentQuestion.type === "7" ? "Ввод текста" : "Вопрос"}
                        </div>
                        <div className={styles.questionMeta}>
                            ID: {currentQuestion.id + 1}
                            {currentQuestion.group && ` | Группа: ${currentQuestion.group}`}
                        </div>
                        <button
                            className={`${styles.favoriteButton} ${favorites.includes(currentQuestion.id) ? styles.favoriteActive : ''}`}
                            onClick={() => toggleFavorite(currentQuestion.id)}
                            title={favorites.includes(currentQuestion.id) ? "Удалить из избранного" : "Добавить в избранное"}
                        >
                            {favorites.includes(currentQuestion.id) ? "★" : "☆"}
                        </button>
                    </div>

                    <div className={styles.questionText} dangerouslySetInnerHTML={{__html: currentQuestion.text}}/>

                    <QuestionRenderer
                        question={currentQuestion}
                        shuffledAnswers={shuffledAnswers}
                        userAnswers={userAnswers}
                        setUserAnswers={setUserAnswers}
                        isChecked={gameState.isChecked}
                    />

                    {gameState.showResult && (
                        <div
                            className={`${styles.resultMessage} ${gameState.isCorrect ? styles.correct : styles.incorrect}`}>
                            {gameState.isCorrect ? 'Правильно!' : 'Неправильно!'}
                        </div>
                    )}

                    <GameControls
                        isChecked={gameState.isChecked}
                        onCheck={checkAnswer}
                        onNext={() => loadNewQuestion(false)}
                        onSkip={() => loadNewQuestion(true)}
                    />
                </>
            )}
        </div>
    );
}