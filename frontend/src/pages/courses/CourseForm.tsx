import { useState } from 'react';
import type { Course } from '../../types';
import styles from './CourseForm.module.css';

interface CourseFormProps {
  initialData?: Course;
  onSubmit: (data: Partial<Course>) => Promise<void>;
  loading?: boolean;
}

export default function CourseForm({ initialData, onSubmit, loading }: CourseFormProps) {
  const [code, setCode] = useState(initialData?.code || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [credits, setCredits] = useState(initialData?.credits || 3);
  const [academicYear, setAcademicYear] = useState(initialData?.academic_year || new Date().getFullYear());
  const [semester, setSemester] = useState(initialData?.semester || 'fall');
  const [maxStudents, setMaxStudents] = useState(initialData?.max_students || 30);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      code,
      title,
      description,
      credits,
      academic_year: academicYear,
      semester,
      max_students: maxStudents,
      is_active: isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <fieldset className={styles.fieldset}>
        <legend>Identité du cours</legend>

        <div className={styles.field}>
          <label>Code du cours *</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ex: DEV101"
            required
          />
          <small>Code unique (ex: DEV101, MATH201)</small>
        </div>

        <div className={styles.field}>
          <label>Titre *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Introduction à la programmation"
            required
          />
        </div>

        <div className={styles.field}>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Description détaillée du cours..."
          />
        </div>

        <div className={styles.field}>
          <label>Crédits *</label>
          <input
            type="number"
            value={credits}
            onChange={(e) => setCredits(parseInt(e.target.value))}
            min={1}
            max={10}
            required
          />
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Planification</legend>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Année académique *</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(parseInt(e.target.value))}
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>{y}-{y + 1}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Semestre *</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              <option value="fall">Automne</option>
              <option value="spring">Printemps</option>
              <option value="summer">Été</option>
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label>Nombre max d'étudiants *</label>
          <input
            type="number"
            value={maxStudents}
            onChange={(e) => setMaxStudents(parseInt(e.target.value))}
            min={1}
            max={500}
            required
          />
        </div>

        {initialData && (
          <div className={styles.field}>
            <label>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              Cours actif
            </label>
            <small>Les cours inactifs ne sont plus visibles par les étudiants</small>
          </div>
        )}
      </fieldset>

      <div className={styles.actions}>
        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? 'Enregistrement...' : (initialData ? 'Mettre à jour' : 'Créer le cours')}
        </button>
      </div>
    </form>
  );
}