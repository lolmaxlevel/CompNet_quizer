// src/components/QuestionDisplay.tsx
import { Question } from '@/utils/types';
import Image from 'next/image';
import styles from './QuestionDisplay.module.css';

interface Props {
  questions: Question[];
  includeDeleted?: boolean;
}

export default function QuestionDisplay({ questions, includeDeleted = true }: Props) {
  // const filteredQuestions = includeDeleted
  //   ? questions
  //   : questions.filter(q => q.header.trim().toLowerCase() !== "deleted!");
  const filteredQuestions = questions
  const totalQuestions = filteredQuestions.length;

  return (
    <div>
      {filteredQuestions.map((question, idx) => (
        <div key={idx} className={styles.question}>
          <div className={styles.questionNumber}>Вопрос {idx + 1} из {totalQuestions}</div>
          <div className={styles.questionText} dangerouslySetInnerHTML={{ __html: question.text }} />

          {question.images.length > 0 && (
            <div className={styles.imageContainer}>
              {question.images.map((src, imgIdx) => (
                <Image
                  key={imgIdx}
                  src={src}
                  alt="Question image"
                  width={500}
                  height={300}
                  style={{ maxWidth: '70%', height: 'auto' }}
                />
              ))}
            </div>
          )}

          {question.answers.map((answer, ansIdx) => (
            <div
              key={ansIdx}
              className={`${styles.answer} ${answer.is_correct ? styles.correct : ''}`}
            >
              {answer.text}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}