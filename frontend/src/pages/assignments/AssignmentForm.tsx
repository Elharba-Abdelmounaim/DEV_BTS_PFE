import { useState } from 'react';
import TestCaseBuilder from './TestCaseBuilder';
import styles from './AssignmentForm.module.css';

interface AssignmentFormProps {
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
  prefillCourseId?: string;
}

export default function AssignmentForm({ onSubmit, loading, prefillCourseId }: AssignmentFormProps) {
  const [courseId, setCourseId] = useState(prefillCourseId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [isPublished, setIsPublished] = useState(false);
  const [allowLate, setAllowLate] = useState(false);
  const [latePenalty, setLatePenalty] = useState(10);
  const [autoGrade, setAutoGrade] = useState(true);
  const [language, setLanguage] = useState('python');
  const [testCases, setTestCases] = useState<any[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      course_id: courseId,
      title,
      description,
      due_date: dueDate,
      max_score: maxScore,
      is_published: isPublished,
      allow_late: allowLate,
      late_penalty: allowLate ? latePenalty : 0,
      auto_grade: autoGrade,
      language: autoGrade ? language : null,
      test_cases: autoGrade ? testCases : [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <fieldset className={styles.fieldset}>
        <legend>Détails du devoir</legend>

        <div className={styles.field}>
          <label>ID du cours *</label>
          <input
            type="text"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            placeholder="Ex: course-uuid-here"
            required
            disabled={!!prefillCourseId}
          />
          <small>ID du cours auquel ce devoir appartient</small>
        </div>

        <div className={styles.field}>
          <label>Titre *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: TP1 - Les bases de Python"
            required
          />
        </div>

        <div className={styles.field}>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Instructions détaillées..."
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Date d'échéance *</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>Note maximale *</label>
            <input
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(parseInt(e.target.value))}
              min={1}
              max={1000}
              required
            />
          </div>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Politique de retard</legend>
        <div className={styles.field}>
          <label>
            <input
              type="checkbox"
              checked={allowLate}
              onChange={(e) => setAllowLate(e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            Autoriser les soumissions en retard
          </label>
        </div>
        {allowLate && (
          <div className={styles.field}>
            <label>Pénalité par jour (%)</label>
            <input
              type="number"
              value={latePenalty}
              onChange={(e) => setLatePenalty(parseInt(e.target.value))}
              min={0}
              max={100}
            />
            <small>-{latePenalty}% par jour de retard</small>
          </div>
        )}
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Correction automatique</legend>
        <div className={styles.field}>
          <label>
            <input
              type="checkbox"
              checked={autoGrade}
              onChange={(e) => setAutoGrade(e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            Activer la correction automatique
          </label>
        </div>
        {autoGrade && (
          <>
            <div className={styles.field}>
              <label>Langage</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
              </select>
            </div>

            <TestCaseBuilder
              testCases={testCases}
              onChange={setTestCases}
              maxScore={maxScore}
            />
          </>
        )}
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Visibilité</legend>
        <div className={styles.field}>
          <label>
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            Publier immédiatement
          </label>
          <small>Les étudiants pourront voir et soumettre le devoir</small>
        </div>
      </fieldset>

      <div className={styles.actions}>
        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? 'Création...' : 'Créer le devoir'}
        </button>
      </div>
    </form>
  );
}