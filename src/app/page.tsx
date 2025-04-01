// src/app/page.tsx
'use client';

import {useState, useEffect} from 'react';
import {Question, QuestionGroup} from '@/utils/types';
import {parseGroups, parseTxt} from '@/utils/parser';
import QuestionDisplay from '../components/QuestionDisplay';
import GameMode from '../components/GameMode';
import Tabs from '../components/Tabs';
import styles from './page.module.css';
import {convertFdbToTxt} from "@/utils/fdb-to-txt";
import {useFavorites} from "@/utils/favorites-context";
import {useIncorrectAnswers} from "@/utils/incorrect-answers-context";

export default function Home() {
    const [activeTab, setActiveTab] = useState('all');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [setGroupes] = useState<QuestionGroup[]>([]);
    const [groupedQuestions, setGroupedQuestions] = useState<Question[]>([]);
    const [examQuestions, setExamQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTest, setSelectedTest] = useState('test1');
    const {getFavoritesByTest} = useFavorites();
    const {getIncorrectByTest} = useIncorrectAnswers();

    const testOptions = [
        {id: 'test1', label: 'Тест 1 (2025г)'},
        {id: 'test2', label: 'Тест 2 (2022г)'},
        {id: 'test3', label: 'Тест 3 (2022г)'},
        {id: 'exam', label: 'Экзамен (2022г)'},
    ];

    const tabOptions = [
        {id: 'all', label: 'Все вопросы'},
        {id: 'grouped', label: 'Вопросы к тесту'},
        {id: 'game', label: 'Режим игры'},
        {id: 'game_exam', label: 'Режим теста'},
        {id: 'marathon', label: 'Марафон'},
        {id: 'favorites', label: 'Избранное'},
        {id: 'incorrect', label: 'Ошибки'},
    ];

    const favoriteQuestions = questions.filter(question =>
        getFavoritesByTest(selectedTest).includes(question.id)
    );

    const incorrectQuestions = questions.filter(question =>
        getIncorrectByTest(selectedTest).includes(question.id)
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Choose endpoint based on selected test
                const endpoint = `/data/${selectedTest}.fdb`;

                const response = await fetch(endpoint);
                const fdbContent = await response.text();
                const fdbtext = convertFdbToTxt(fdbContent);
                const parsedQuestions = parseTxt(fdbtext);
                const parsedGroups = parseGroups(fdbtext);
                setQuestions(parsedQuestions);
                setGroupes(parsedGroups);

                const groupedIds = parsedGroups.map(group => group.questionIds).flat();
                const filtered = parsedQuestions.filter(question => {
                    return groupedIds.includes(question.id);
                });
                setGroupedQuestions(filtered);

                // Generate exam questions
                const examList: Question[] = [];

                parsedGroups.forEach(group => {
                    // Get all questions from this group
                    const groupQuestions = parsedQuestions.filter(q => group.questionIds.includes(q.id));
                    // add group name to questions
                    groupQuestions.forEach(question => {
                        question.group = group.name;
                    });
                    // Shuffle the questions
                    const shuffled = [...groupQuestions].sort(() => Math.random() - 0.5);
                    // Select the required number of random questions (or all if there aren't enough)
                    const numToSelect = Math.min(group.randomQuestions, groupQuestions.length);
                    const selectedQuestions = shuffled.slice(0, numToSelect);
                    // Add to exam questions list
                    examList.push(...selectedQuestions);
                });

                setExamQuestions(examList);
            } catch (error) {
                console.error('Error loading questions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedTest]);

    if (loading) {
        return <div className={styles.loading}>Loading questions...</div>;
    }

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className={styles.testSelector}>
                    <label htmlFor="test-select">Выберите тест: </label>
                    <select
                        id="test-select"
                        value={selectedTest}
                        onChange={(e) => setSelectedTest(e.target.value)}
                        className={styles.testSelect}
                    >
                        {testOptions.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <Tabs
                    tabs={tabOptions}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                >
                    <div className={styles.tabContent}>
                        <QuestionDisplay questions={questions}/>
                    </div>

                    <div className={styles.tabContent}>
                        <QuestionDisplay questions={groupedQuestions}/>
                    </div>

                    <div className={styles.tabContent}>
                        <div className={styles.marathonHeader}>
                            <h2>Режим игры</h2>
                            <p>Вопросы которые скорее всего будут в тесте, данный режим бесконечный, вопросы могут
                                повторяться</p>
                        </div>
                        <GameMode questions={groupedQuestions} testId={selectedTest}/>
                    </div>
                    <div className={styles.tabContent}>
                        <div className={styles.marathonHeader}>
                            <h2>Экзамен</h2>
                            <p>Режим игры, но вопросы не повторяются и выбираются по тому же принципу что и в тесте</p>
                            <p>p.s. при перезагрузке страницы вопросы будут новые</p>
                        </div>

                        <GameMode questions={examQuestions} marathonMode={true} testId={selectedTest}/>
                    </div>
                    <div className={styles.tabContent}>
                        <div className={styles.marathonHeader}>
                            <h2>Марафон</h2>
                            <p>Режим теста только со всеми вопросами из теста</p>
                        </div>
                        <GameMode questions={groupedQuestions} marathonMode={true} testId={selectedTest}/>
                    </div>
                    <div className={styles.tabContent}>
                        <div className={styles.marathonHeader}>
                            <h2>Избранные вопросы</h2>
                            <p>Марафон только с избранными вопросами для текущего теста</p>
                        </div>
                        {favoriteQuestions.length > 0 ? (
                            <GameMode questions={favoriteQuestions} marathonMode={true} testId={selectedTest}/>
                        ) : (
                            <div className={styles.emptyFavorites}>
                                У вас пока нет избранных вопросов. Добавьте их, нажав на звездочку ★ в режиме игры.
                            </div>
                        )}
                    </div>
                    <div className={styles.tabContent}>
                        <div className={styles.marathonHeader}>
                            <h2>Вопросы с ошибками</h2>
                            <p>Марафон с вопросами, на которые вы ответили неправильно</p>
                        </div>
                        {incorrectQuestions.length > 0 ? (
                            <GameMode questions={incorrectQuestions}
                                      marathonMode={true}
                                      testId={selectedTest}
                                      isIncorrectMode={true}/>
                        ) : (
                            <div className={styles.emptyIncorrect}>
                                У вас пока нет вопросов с ошибками. Они появятся здесь, если вы ответите неправильно в
                                режимах игры или марафона.
                            </div>
                        )}
                    </div>
                </Tabs>
            </main>
            <footer className={styles.footer}>
                <a href="https://github.com/Imtjl/net-parser/" target="_blank" rel="noopener noreferrer">
                    powered by net-parser
                </a>
            </footer>
        </div>
    );
}