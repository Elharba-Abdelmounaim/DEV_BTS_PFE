// src/pages/assignments/AssignmentListPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assignmentsApi } from '../../api/assignments';
import type { Assignment } from '../../types';
import styles from './AssignmentListPage.module.css';

export default function AssignmentListPage() {
  const { isTeacher } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const data = await assignmentsApi.list();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading assignments...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>📝 Assignments</h1>
        {isTeacher && (
          <Link to="/assignments/new" className={styles.createBtn}>
            + Create Assignment
          </Link>
        )}
      </div>

      <div className={styles.list}>
        {assignments.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📭</span>
            <p>No assignments yet</p>
          </div>
        ) : (
          assignments.map(assignment => (
            <Link 
              key={assignment.id} 
              to={`/assignments/${assignment.id}`}
              className={styles.card}
            >
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{assignment.title}</h3>
                <span className={`${styles.status} ${
                  assignment.is_published ? styles.published : styles.draft
                }`}>
                  {assignment.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className={styles.cardDesc}>{assignment.description}</p>
              <div className={styles.cardFooter}>
                <span className={styles.cardCourse}>
                  📚 {assignment.course?.title || 'No course'}
                </span>
                <span className={styles.cardDue}>
                  📅 Due: {new Date(assignment.due_date).toLocaleDateString()}
                </span>
                <span className={styles.cardScore}>
                  🏆 {assignment.max_score} pts
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}