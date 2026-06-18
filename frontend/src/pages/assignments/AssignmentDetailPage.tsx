// src/pages/assignments/AssignmentDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assignmentsApi } from '../../api/assignments';
import type { Assignment } from '../../types';
import styles from './AssignmentDetailPage.module.css';

export default function AssignmentDetailPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { isTeacher, isStudent } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assignmentId) {
      loadAssignment();
    }
  }, [assignmentId]);

  const loadAssignment = async () => {
    if (!assignmentId) return;
    try {
      const data = await assignmentsApi.get(assignmentId);
      setAssignment(data);
    } catch (error) {
      console.error('Failed to load assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading assignment...</div>;
  }

  if (!assignment) {
    return <div className={styles.error}>Assignment not found</div>;
  }

  const isPastDue = new Date(assignment.due_date) < new Date();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/assignments" className={styles.backLink}>← All Assignments</Link>
        <h1 className={styles.title}>{assignment.title}</h1>
        <div className={styles.meta}>
          <span className={styles.course}>📚 {assignment.course?.title}</span>
          <span className={`${styles.status} ${
            assignment.is_published ? styles.published : styles.draft
          }`}>
            {assignment.is_published ? 'Published' : 'Draft'}
          </span>
          <span className={styles.due}>
            📅 Due: {new Date(assignment.due_date).toLocaleDateString()}
            {isPastDue && <span className={styles.overdue}> (Overdue)</span>}
          </span>
          <span className={styles.score}>🏆 {assignment.max_score} pts</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.description}>
          <h2>Description</h2>
          <p>{assignment.description || 'No description provided'}</p>
        </div>

        <div className={styles.actions}>
          {isStudent && (
            <Link 
              to={`/assignments/${assignmentId}/submit`}
              className={styles.submitBtn}
            >
              📤 Submit Assignment
            </Link>
          )}
          {isTeacher && (
            <Link 
              to={`/assignments/${assignmentId}/submissions`}
              className={styles.reviewBtn}
            >
              👀 Review Submissions
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}