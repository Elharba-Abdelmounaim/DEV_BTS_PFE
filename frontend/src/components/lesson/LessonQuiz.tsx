import React from 'react';
import type { QuizQuestion } from '../../types';

interface LessonQuizProps {
  lessonId: string;
  questions: QuizQuestion[];
}

export const LessonQuiz: React.FC<LessonQuizProps> = ({ lessonId, questions }) => {
  return (
    <div>
      {/* Quiz implementation for lesson {lessonId} */}
      {questions.map((q) => (
        <div key={q.id}>
          <p>{q.question_text}</p>
        </div>
      ))}
    </div>
  );
};

export default LessonQuiz;
