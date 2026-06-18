// src/pages/assignments/SubmitForm.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assignmentsApi, submissionsApi } from '../../api/assignments';
import type { Assignment } from '../../types';
import styles from './SubmitForm.module.css';

export default function SubmitForm() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // ── Form State ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    github_repo_url: '',
    github_branch: 'main',
    github_commit_sha: '',
    student_notes: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // ── Load Assignment ──────────────────────────────────────────────────────
  useEffect(() => {
    if (assignmentId) {
      loadAssignment();
    }
  }, [assignmentId]);

  const loadAssignment = async () => {
    if (!assignmentId) return;
    
    try {
      setLoading(true);
      const data = await assignmentsApi.get(assignmentId);
      setAssignment(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name);
  };

  const validateField = (fieldName: string) => {
    const value = formData[fieldName as keyof typeof formData];
    const errors: Record<string, string> = {};

    switch (fieldName) {
      case 'github_repo_url':
        if (!value.trim()) {
          errors.github_repo_url = 'GitHub repository URL is required';
        } else if (!isValidGitHubUrl(value)) {
          errors.github_repo_url = 'Please enter a valid GitHub repository URL';
        }
        break;
      case 'github_branch':
        if (!value.trim()) {
          errors.github_branch = 'Branch name is required';
        }
        break;
      case 'github_commit_sha':
        if (value.trim() && !isValidCommitSha(value)) {
          errors.github_commit_sha = 'Invalid commit SHA format (should be 40 characters)';
        }
        break;
    }

    setValidationErrors(prev => ({ ...prev, ...errors }));
  };

  // ── Validation Helpers ──────────────────────────────────────────────────
  const isValidGitHubUrl = (url: string): boolean => {
    const pattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+(\/)?$/;
    return pattern.test(url);
  };

  const isValidCommitSha = (sha: string): boolean => {
    return /^[a-f0-9]{40}$/i.test(sha);
  };

  const isFormValid = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.github_repo_url.trim()) {
      errors.github_repo_url = 'GitHub repository URL is required';
    } else if (!isValidGitHubUrl(formData.github_repo_url)) {
      errors.github_repo_url = 'Please enter a valid GitHub repository URL';
    }
    
    if (!formData.github_branch.trim()) {
      errors.github_branch = 'Branch name is required';
    }
    
    if (formData.github_commit_sha.trim() && !isValidCommitSha(formData.github_commit_sha)) {
      errors.github_commit_sha = 'Invalid commit SHA format';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assignmentId) return;
    
    // Validate all fields
    ['github_repo_url', 'github_branch', 'github_commit_sha'].forEach(field => {
      validateField(field);
    });
    
    if (!isFormValid()) {
      // Scroll to first error
      const firstError = document.querySelector(`.${styles.inputError}`);
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await submissionsApi.submit(assignmentId, {
        github_repo_url: formData.github_repo_url.trim(),
        github_branch: formData.github_branch.trim(),
        github_commit_sha: formData.github_commit_sha.trim() || undefined,
        student_notes: formData.student_notes.trim() || undefined,
      });

      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/submissions`);
      }, 2000);

    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p className={styles.loadingText}>Loading assignment...</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error && !assignment) {
    return (
      <div className={styles.errorContainer}>
        <span className={styles.errorIcon}>😕</span>
        <h2 className={styles.errorTitle}>Assignment not found</h2>
        <p className={styles.errorText}>{error}</p>
        <Link to="/assignments" className={styles.errorBackLink}>
          ← Back to Assignments
        </Link>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className={styles.errorContainer}>
        <span className={styles.errorIcon}>🔍</span>
        <h2 className={styles.errorTitle}>Assignment not found</h2>
        <p className={styles.errorText}>The assignment you're looking for doesn't exist.</p>
        <Link to="/assignments" className={styles.errorBackLink}>
          ← Back to Assignments
        </Link>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className={styles.successContainer}>
        <span className={styles.successIcon}>🎉</span>
        <h2 className={styles.successTitle}>Assignment Submitted!</h2>
        <p className={styles.successText}>
          Your assignment has been successfully submitted. You'll receive feedback shortly.
        </p>
        <div className={styles.successDetails}>
          <div className={styles.successDetail}>
            <span className={styles.successDetailLabel}>Assignment</span>
            <span className={styles.successDetailValue}>{assignment.title}</span>
          </div>
          <div className={styles.successDetail}>
            <span className={styles.successDetailLabel}>Repository</span>
            <span className={styles.successDetailValue}>{formData.github_repo_url}</span>
          </div>
          <div className={styles.successDetail}>
            <span className={styles.successDetailLabel}>Branch</span>
            <span className={styles.successDetailValue}>{formData.github_branch}</span>
          </div>
        </div>
        <div className={styles.successActions}>
          <Link to="/submissions" className={styles.successBtn}>
            View My Submissions
          </Link>
          <Link to={`/assignments/${assignmentId}`} className={styles.successBtnSecondary}>
            Back to Assignment
          </Link>
        </div>
      </div>
    );
  }

  const isPastDue = new Date(assignment.due_date) < new Date();
  const daysUntilDue = Math.ceil(
    (new Date(assignment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <Link to={`/assignments/${assignmentId}`} className={styles.backLink}>
          ← Back to Assignment
        </Link>
        <h1 className={styles.title}>📤 Submit Assignment</h1>
        <p className={styles.subtitle}>
          {assignment.title}
        </p>
      </div>

      {/* ── Info Banner ────────────────────────────────────────────────────── */}
      <div className={styles.infoBanner}>
        <div className={styles.infoBannerLeft}>
          <span className={styles.infoBannerIcon}>📋</span>
          <div>
            <span className={styles.infoBannerTitle}>Assignment Details</span>
            <span className={styles.infoBannerText}>
              {assignment.description || 'No description provided'}
            </span>
          </div>
        </div>
        <div className={styles.infoBannerRight}>
          <div className={styles.infoBadge}>
            <span className={styles.infoBadgeLabel}>Due Date</span>
            <span className={`${styles.infoBadgeValue} ${isPastDue ? styles.overdue : ''}`}>
              {new Date(assignment.due_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            {isPastDue ? (
              <span className={styles.overdueBadge}>⚠️ Overdue</span>
            ) : (
              <span className={styles.daysLeft}>
                {daysUntilDue} day{daysUntilDue > 1 ? 's' : ''} left
              </span>
            )}
          </div>
          <div className={styles.infoBadge}>
            <span className={styles.infoBadgeLabel}>Max Score</span>
            <span className={styles.infoBadgeValue}>🏆 {assignment.max_score} pts</span>
          </div>
        </div>
      </div>

      {/* ── Form ────────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Error Banner */}
        {error && (
          <div className={styles.errorBanner}>
            <span className={styles.errorBannerIcon}>❌</span>
            <span className={styles.errorBannerText}>{error}</span>
            <button 
              type="button" 
              className={styles.errorBannerClose}
              onClick={() => setError(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── GitHub Repository ───────────────────────────────────────────── */}
        <div className={styles.field}>
          <label htmlFor="github_repo_url" className={styles.label}>
            GitHub Repository URL <span className={styles.required}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>🐙</span>
            <input
              id="github_repo_url"
              name="github_repo_url"
              type="url"
              className={`${styles.input} ${
                touched.github_repo_url && validationErrors.github_repo_url ? styles.inputError : ''
              } ${
                touched.github_repo_url && !validationErrors.github_repo_url && formData.github_repo_url ? styles.inputSuccess : ''
              }`}
              placeholder="https://github.com/username/repository"
              value={formData.github_repo_url}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              disabled={submitting}
            />
            {touched.github_repo_url && !validationErrors.github_repo_url && formData.github_repo_url && (
              <span className={styles.inputSuccessIcon}>✅</span>
            )}
          </div>
          {validationErrors.github_repo_url && (
            <span className={styles.fieldError}>{validationErrors.github_repo_url}</span>
          )}
          <span className={styles.fieldHint}>
            Example: https://github.com/username/assignment-repo
          </span>
        </div>

        {/* ── Branch ───────────────────────────────────────────────────────── */}
        <div className={styles.field}>
          <label htmlFor="github_branch" className={styles.label}>
            Branch Name <span className={styles.required}>*</span>
          </label>
          <input
            id="github_branch"
            name="github_branch"
            type="text"
            className={`${styles.input} ${
              touched.github_branch && validationErrors.github_branch ? styles.inputError : ''
            }`}
            placeholder="main"
            value={formData.github_branch}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            disabled={submitting}
          />
          {validationErrors.github_branch && (
            <span className={styles.fieldError}>{validationErrors.github_branch}</span>
          )}
          <span className={styles.fieldHint}>
            The branch containing your code (e.g., main, master, develop)
          </span>
        </div>

        {/* ── Commit SHA ───────────────────────────────────────────────────── */}
        <div className={styles.field}>
          <label htmlFor="github_commit_sha" className={styles.label}>
            Commit SHA (Optional)
            <span className={styles.labelOptional}>(optional)</span>
          </label>
          <input
            id="github_commit_sha"
            name="github_commit_sha"
            type="text"
            className={`${styles.input} ${
              touched.github_commit_sha && validationErrors.github_commit_sha ? styles.inputError : ''
            }`}
            placeholder="e.g., a1b2c3d4e5f6..."
            value={formData.github_commit_sha}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={submitting}
          />
          {validationErrors.github_commit_sha && (
            <span className={styles.fieldError}>{validationErrors.github_commit_sha}</span>
          )}
          <span className={styles.fieldHint}>
            The specific commit hash to be graded (40 characters)
          </span>
        </div>

        {/* ── Student Notes ────────────────────────────────────────────────── */}
        <div className={styles.field}>
          <label htmlFor="student_notes" className={styles.label}>
            Notes (Optional)
            <span className={styles.labelOptional}>(optional)</span>
          </label>
          <textarea
            id="student_notes"
            name="student_notes"
            className={styles.textarea}
            placeholder="Any additional notes for the instructor..."
            value={formData.student_notes}
            onChange={handleChange}
            rows={4}
            disabled={submitting}
          />
          <div className={styles.charCounter}>
            <span>{(formData.student_notes?.length || 0)}/500</span>
            {(formData.student_notes?.length || 0) > 450 && (
              <span className={styles.charWarning}>⚠️ Almost at limit</span>
            )}
          </div>
        </div>

        {/* ── Submit Button ────────────────────────────────────────────────── */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => navigate(`/assignments/${assignmentId}`)}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting || isPastDue}
          >
            {submitting ? (
              <>
                <span className={styles.spinner} />
                Submitting...
              </>
            ) : isPastDue ? (
              '⛔ Assignment Overdue'
            ) : (
              '📤 Submit Assignment'
            )}
          </button>
        </div>

        {/* ── Overdue Warning ────────────────────────────────────────────── */}
        {isPastDue && (
          <div className={styles.overdueWarning}>
            <span className={styles.overdueWarningIcon}>⚠️</span>
            <span className={styles.overdueWarningText}>
              This assignment is past due. You can still submit, but late penalties may apply.
            </span>
          </div>
        )}
      </form>
    </div>
  );
}