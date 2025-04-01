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

export default function Home() {
    const [activeTab, setActiveTab] = useState('all');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [groupes, setGroupes] = useState<QuestionGroup[]>([]);
    const [groupedQuestions, setGroupedQuestions] = useState<Question[]>([]);
    const [examQuestions, setExamQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTest, setSelectedTest] = useState('test1');

    const testOptions = [
        { id: 'test1', label: 'Тест 1 (2025г)' },
        { id: 'test2', label: 'Тест 2 (2022г)' },
        { id: 'test3', label: 'Тест 3 (2022г)' },
        { id: 'exam', label: 'Экзамен (2022г)' },
    ];

    const tabOptions = [
        {id: 'all', label: 'Все вопросы'},
        {id: 'grouped', label: 'Вопросы к тесту'},
        {id: 'game', label: 'Режим игры'},
        {id: 'game_exam', label: 'Режим теста'},
        {id: 'marathon', label: 'Марафон'},
    ];

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
                            <p>Вопросы которые скорее всего будут в тесте, данный режим бесконечный, вопросы могут повторяться</p>
                        </div>
                        <GameMode questions={groupedQuestions}/>
                    </div>
                    <div className={styles.tabContent}>
                        <div className={styles.marathonHeader}>
                            <h2>Экзамен</h2>
                            <p>Режим игры, но вопросы не повторяются и выбираются по тому же принципу что и в тесте</p>
                            <p>p.s. при перезагрузке страницы вопросы будут новые</p>
                        </div>

                        <GameMode questions={examQuestions} marathonMode={true}/>
                    </div>
                    <div className={styles.tabContent}>
                        <div className={styles.marathonHeader}>
                            <h2>Марафон</h2>
                            <p>Режим теста только со всеми вопросами из теста</p>
                        </div>
                        <GameMode questions={groupedQuestions} marathonMode={true}/>
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