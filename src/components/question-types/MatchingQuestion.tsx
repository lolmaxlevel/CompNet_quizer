// src/components/question-types/MatchingQuestion.tsx
import styles from '../GameMode.module.css';
import React from "react";

interface MatchingQuestionProps {
    shuffledAnswers: { answer: any, originalIndex: number }[];
    userAnswers: { left: number, right: number }[];
    setUserAnswers: React.Dispatch<React.SetStateAction<any[]>>;
    isChecked: boolean;
}

export default function MatchingQuestion({
                                             shuffledAnswers,
                                             userAnswers,
                                             setUserAnswers,
                                             isChecked
                                         }: MatchingQuestionProps) {
    // Filter items with ":::" as these are matching items
    const matchingItems = shuffledAnswers.filter(item => item.answer.text.includes(":::"));

    return (
        <div className={styles.matchingContainer}>
            {matchingItems.map((item, idx) => {
                if (item.answer.text.includes(":::")) {
                    const [leftText, rightText] = item.answer.text.split(":::").map((t: string) => t.trim());
                    const originalIndex = item.originalIndex;

                    // Find user's selected match for this left item
                    const userMatch = userAnswers.find(m => m.left === originalIndex);
                    // Determine if this match is correct (user matched with the original right side)
                    const isCorrectMatch = isChecked && userMatch && userMatch.right === originalIndex;
                    // Determine if this match is incorrect (user matched with wrong right side)
                    const isIncorrectMatch = isChecked && userMatch && userMatch.right !== originalIndex;

                    return (
                        <div key={idx} className={styles.matchingPair}>
                            <div className={styles.matchingLeft} data-index={originalIndex}>{leftText}</div>
                            <div className={styles.matchingLine}>→</div>
                            <select
                                className={`${styles.matchingRight}
                  ${isCorrectMatch ? styles.correct : ''}
                  ${isIncorrectMatch ? styles.incorrect : ''}`}
                                value={userMatch?.right || ""}
                                onChange={(e) => {
                                    if (isChecked) return;
                                    const val = e.target.value;
                                    if (!val) return;

                                    setUserAnswers(prev => {
                                        const newAnswers = prev.filter(m => m.left !== originalIndex);
                                        return [...newAnswers, {left: originalIndex, right: parseInt(val)}];
                                    });
                                }}
                                disabled={isChecked}
                            >
                                <option value="">Выберите соответствие...</option>
                                {matchingItems.map((rightItem, i) => {
                                    if (rightItem.answer.text.includes(":::")) {
                                        const rightText = rightItem.answer.text.split(":::")[1].trim();
                                        return (
                                            <option key={i} value={rightItem.originalIndex}>{rightText}</option>
                                        );
                                    }
                                    return null;
                                })}
                            </select>

                            {/* Show correct answer if user got it wrong */}
                            {isChecked && isIncorrectMatch && (
                                <div className={styles.correctAnswer}>
                                    Правильно: {
                                    shuffledAnswers.find(a => a.originalIndex === originalIndex)?.answer.text.split(":::")[1].trim()
                                }
                                </div>
                            )}
                        </div>
                    );
                }
                return null;
            })}
        </div>
    );
}