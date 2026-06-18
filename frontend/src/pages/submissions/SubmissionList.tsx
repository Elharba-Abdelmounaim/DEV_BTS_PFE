// src/pages/submissions/SubmissionList.tsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMySubmissions } from '../../api/assignments';
import type { Submission } from '../../types';
import styles from './SubmissionList.module.css';

type FilterType = 'all' | 'pending' | 'graded' | 'queued' | 'failed';

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Submission['submission_status'] }) {
  const statusMap: Record<string, { label: string; icon: string; color: string; bg: string }> = {
    pending: { label: 'Pending Review', icon: '⏳', color: '#d97706', bg: '#fef3c7' },
    queued: { label: 'Queued', icon: '📤', color: '#3b82f6', bg: '#dbeafe' },
    grading: { label: 'Grading...', icon: '⚡', color: '#4f46e5', bg: '#e0e7ff' },
    graded: { label: 'Graded ✓', icon: '✅', color: '#16a34a', bg: '#dcfce7' },
    failed: { label: 'Failed ✗', icon: '❌', color: '#dc2626', bg: '#fee2e2' },
  };

  const info = statusMap[status] || statusMap.pending;

  return (
    <span 
      className={styles.statusBadge}
      style={{ backgroundColor: info.bg, color: info.color }}
    >
      <span className={styles.statusIcon}>{info.icon}</span>
      {info.label}
    </span>
  );
}

// ── Submission Card (Mobile/Grid View) ──────────────────────────────────────
function SubmissionCard({ 
  submission, 
  onClick 
}: { 
  submission: Submission; 
  onClick: () => void;
}) {
  const isGraded = submission.submission_status === 'graded';
  const score = submission.final_score ?? submission.score ?? null;
  const assignmentTitle = submission.assignment?.title || 'Assignment';
  const courseTitle = submission.assignment?.course?.title || 'No course';

  return (
    <div 
      className={`${styles.card} ${isGraded ? styles.cardGraded : ''}`}
      onClick={onClick}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardLeft}>
          <span className={styles.cardIcon}>📝</span>
          <div>
            <h4 className={styles.cardTitle}>{assignmentTitle}</h4>
            <p className={styles.cardCourse}>{courseTitle}</p>
          </div>
        </div>
        <StatusBadge status={submission.submission_status} />
      </div>

      <div className={styles.cardBody}>
        {submission.github_repo_url && (
          <a 
            href={submission.github_repo_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.cardRepo}
            onClick={(e) => e.stopPropagation()}
          >
            <span className={styles.repoIcon}>🐙</span>
            {submission.github_repo_url.replace('https://github.com/', '')}
          </a>
        )}
        {submission.student_notes && (
          <p className={styles.cardNotes}>{submission.student_notes}</p>
        )}
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.cardMeta}>
          <span className={styles.cardDate}>
            📅 {new Date(submission.submitted_at || submission.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          {submission.is_late && (
            <span className={styles.lateBadge}>⚠️ Late</span>
          )}
        </div>
        {isGraded && score !== null && (
          <div className={styles.cardScore}>
            <span className={styles.scoreLabel}>Score</span>
            <span className={`${styles.scoreValue} ${
              score >= 80 ? styles.scoreHigh :
              score >= 60 ? styles.scoreMid : styles.scoreLow
            }`}>
              {score}/100
            </span>
          </div>
        )}
        {submission.teacher_feedback && (
          <div className={styles.cardFeedback}>
            <span className={styles.feedbackIcon}>💬</span>
            <span className={styles.feedbackText}>{submission.teacher_feedback}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Skeleton Loader ──────────────────────────────────────────────────────────
function SubmissionSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonHeader} />
      <div className={styles.skeletonBody} />
      <div className={styles.skeletonFooter} />
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function SubmissionList() {
  const navigate = useNavigate();

  // State
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  // ── Load Data ──────────────────────────────────────────────────────────────
  const loadSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMySubmissions();
      setSubmissions(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleView = (id: string) => {
    navigate(`/submissions/${id}`);
  };

  const handleRefresh = () => {
    loadSubmissions();
  };

  // ── Filters ─────────────────────────────────────────────────────────────────
  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];

    if (filter !== 'all') {
      result = result.filter(s => s.submission_status === filter);
    }

    if (search) {
      const query = search.toLowerCase();
      result = result.filter(s => 
        s.assignment?.title?.toLowerCase().includes(query) ||
        s.assignment?.course?.title?.toLowerCase().includes(query) ||
        s.github_repo_url?.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    result.sort((a, b) => 
      new Date(b.submitted_at || b.created_at).getTime() - 
      new Date(a.submitted_at || a.created_at).getTime()
    );

    return result;
  }, [submissions, filter, search]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter(s => s.submission_status === 'pending').length;
    const graded = submissions.filter(s => s.submission_status === 'graded').length;
    const queued = submissions.filter(s => s.submission_status === 'queued').length;
    const failed = submissions.filter(s => s.submission_status === 'failed').length;
    const avgScore = graded > 0 
      ? Math.round(submissions.filter(s => s.submission_status === 'graded').reduce((sum, s) => sum + (s.final_score || 0), 0) / graded)
      : null;

    return { total, pending, graded, queued, failed, avgScore };
  }, [submissions]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>📤 My Submissions</h1>
        </div>
        <div className={styles.grid}>
          {[1, 2, 3, 4].map(i => (
            <SubmissionSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>📤 My Submissions</h1>
          <p className={styles.subtitle}>
            Track all your assignment submissions and feedback
          </p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.refreshBtn} onClick={handleRefresh}>
            <span className={styles.refreshIcon}>⟳</span>
          </button>
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {error && (
        <div className={styles.errorBanner}>
          <span className={styles.errorIcon}>⚠️</span>
          <span className={styles.errorText}>{error}</span>
          <button onClick={loadSubmissions} className={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statValue}>{stats.graded}</span>
          <span className={styles.statLabel}>Graded</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statValue}>{stats.pending}</span>
          <span className={styles.statLabel}>Pending</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statValue}>
            {stats.avgScore !== null ? `${stats.avgScore}%` : '—'}
          </span>
          <span className={styles.statLabel}>Average</span>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by assignment, course, or repository..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button 
              className={styles.searchClear}
              onClick={() => setSearch('')}
            >
              ✕
            </button>
          )}
        </div>
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.filterActive : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'pending' ? styles.filterActive : ''}`}
            onClick={() => setFilter('pending')}
          >
            ⏳ Pending ({stats.pending})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'graded' ? styles.filterActive : ''}`}
            onClick={() => setFilter('graded')}
          >
            ✅ Graded ({stats.graded})
          </button>
        </div>
      </div>

      {/* ── Results Count ────────────────────────────────────────────────── */}
      <div className={styles.resultsInfo}>
        <span className={styles.resultsCount}>
          <strong>{filteredSubmissions.length}</strong> submissions
          {search && <span className={styles.resultsSearch}> · searching for "{search}"</span>}
          {filter !== 'all' && (
            <span className={styles.resultsFilter}>
              · {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </span>
          )}
        </span>
      </div>

      {/* ── Submissions Grid ──────────────────────────────────────────────── */}
      {filteredSubmissions.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            {search ? '🔍' : '📭'}
          </span>
          <h3 className={styles.emptyTitle}>
            {search ? 'No results found' : 'No submissions yet'}
          </h3>
          <p className={styles.emptyDesc}>
            {search 
              ? `No submissions match "${search}". Try adjusting your search.`
              : "You haven't submitted any assignments yet. Start by enrolling in a course!"}
          </p>
          {search ? (
            <button className={styles.clearBtn} onClick={() => setSearch('')}>
              Clear search
            </button>
          ) : (
            <Link to="/courses" className={styles.emptyBtn}>
              Browse Courses →
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredSubmissions.map(submission => (
            <SubmissionCard 
              key={submission.id} 
              submission={submission}
              onClick={() => handleView(submission.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}