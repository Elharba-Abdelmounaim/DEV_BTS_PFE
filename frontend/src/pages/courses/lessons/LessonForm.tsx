// src/pages/courses/lessons/LessonForm.tsx
import { useState, useEffect } from 'react';
import { lessonsApi } from '../../../api/lessons';
import { useForm } from '../../../hooks/useForm';
import TipTapEditor from './TipTapEditor';
import type { Lesson, LessonType, CourseModule, LessonFile } from '../../../types';
import styles from './LessonForm.module.css';

interface Props {
  courseId: string;
  module: CourseModule;
  lesson?: Lesson | null;
  modules?: CourseModule[];
  onSuccess: (lesson: Lesson) => void;
  onCancel: () => void;
}

const TYPE_OPTIONS: { value: LessonType; label: string; icon: string; color: string; desc: string }[] = [
  { value: 'reading', label: 'Reading', icon: '📖', color: '#8b5cf6', desc: 'Text-based content with rich formatting' },
  { value: 'video', label: 'Video', icon: '▶️', color: '#3b82f6', desc: 'YouTube, Vimeo, or uploaded video' },
  { value: 'quiz', label: 'Quiz', icon: '✏️', color: '#f59e0b', desc: 'Interactive assessment' },
  { value: 'assignment', label: 'Lab', icon: '⚗️', color: '#22c55e', desc: 'Hands-on coding assignment' },
];

export default function LessonForm({ courseId, module, lesson, onSuccess, onCancel }: Props) {
  const isEdit = !!lesson;

  // ── State ──────────────────────────────────────────────────────────────────
  const [body, setBody] = useState<Record<string, unknown> | null>(lesson?.body ?? null);
  const [bodyHtml, setBodyHtml] = useState<string>(lesson?.body_html ?? '');
  const [files, setFiles] = useState<LessonFile[]>(lesson?.files ?? []);
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [selectedType, setSelectedType] = useState<LessonType>(lesson?.lesson_type ?? 'reading');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ── Form ──────────────────────────────────────────────────────────────────
  const { values, errors, globalError, loading, handleChange, handleSubmit, setValues } =
    useForm<{
      title: string;
      excerpt: string;
      lesson_type: string;
      video_url: string;
      video_type: string;
      duration_minutes: string;
      assignment_id: string;
      is_published: string;
      is_free_preview: string;
    }>({
      initialValues: {
        title: lesson?.title ?? '',
        excerpt: lesson?.excerpt ?? '',
        lesson_type: lesson?.lesson_type ?? 'reading',
        video_url: lesson?.video_url ?? '',
        video_type: lesson?.video_type ?? '',
        duration_minutes: lesson?.duration_minutes ? String(lesson.duration_minutes) : '',
        assignment_id: lesson?.assignment_id ?? '',
        is_published: String(lesson?.is_published ?? true),
        is_free_preview: String(lesson?.is_free_preview ?? false),
      },
      onSubmit: async (vals) => {
        // Detect video type from URL
        let detectedType = vals.video_type || '';
        if (vals.video_url && !detectedType) {
          if (vals.video_url.includes('youtube') || vals.video_url.includes('youtu.be'))
            detectedType = 'youtube';
          else if (vals.video_url.includes('vimeo'))
            detectedType = 'vimeo';
          else if (vals.video_url)
            detectedType = 'upload';
        }

        const payload: Partial<Lesson> = {
          title: vals.title,
          excerpt: vals.excerpt || undefined,
          lesson_type: vals.lesson_type as LessonType,
          body: body ?? undefined,
          body_html: bodyHtml || undefined,
          video_url: vals.video_url || undefined,
          video_type: (detectedType || undefined) as any,
          duration_minutes: vals.duration_minutes ? Number(vals.duration_minutes) : undefined,
          files: files.length ? files : [],
          assignment_id: vals.assignment_id || undefined,
          is_published: vals.is_published === 'true',
          is_free_preview: vals.is_free_preview === 'true',
        };

        let saved: Lesson;
        if (isEdit && lesson) {
          saved = await lessonsApi.update(courseId, module.id, lesson.id, payload);
        } else {
          saved = await lessonsApi.create(courseId, module.id, payload);
        }
        onSuccess(saved);
      },
    });

  // ── Update selected type ─────────────────────────────────────────────────
  useEffect(() => {
    setSelectedType(values.lesson_type as LessonType);
  }, [values.lesson_type]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const addFile = () => {
    if (!newFileUrl || !newFileName) return;
    setFiles(prev => [...prev, { name: newFileName, url: newFileUrl }]);
    setNewFileUrl('');
    setNewFileName('');
  };

  const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const isVideo = values.lesson_type === 'video';
  const isQuiz = values.lesson_type === 'quiz';
  const isAssignment = values.lesson_type === 'assignment';

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.root}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>{isEdit ? '✏️' : '📝'}</span>
          <div>
            <h2 className={styles.title}>
              {isEdit ? 'Edit Lesson' : 'Create New Lesson'}
            </h2>
            <p className={styles.subtitle}>
              {isEdit 
                ? `Updating "${lesson?.title}" in ${module.title}`
                : `Adding a new lesson to ${module.title}`}
            </p>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onCancel}>
          <span className={styles.closeIcon}>✕</span>
        </button>
      </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {globalError && (
        <div className={styles.errorBanner}>
          <span className={styles.errorIcon}>❌</span>
          <span className={styles.errorText}>{globalError}</span>
        </div>
      )}

      {/* ── Form ────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} noValidate className={styles.form}>

        {/* ── Lesson Type Selector ──────────────────────────────────────── */}
        <div className={styles.typeSection}>
          <label className={styles.sectionLabel}>Lesson Type</label>
          <div className={styles.typeGrid}>
            {TYPE_OPTIONS.map(opt => (
              <label
                key={opt.value}
                className={`${styles.typeOption} ${
                  selectedType === opt.value ? styles.typeActive : ''
                }`}
                style={{
                  borderColor: selectedType === opt.value ? opt.color : 'transparent',
                  background: selectedType === opt.value ? `${opt.color}10` : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="lesson_type"
                  value={opt.value}
                  checked={selectedType === opt.value}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
                <span className={styles.typeIcon} style={{ color: opt.color }}>
                  {opt.icon}
                </span>
                <div className={styles.typeInfo}>
                  <span className={styles.typeLabel}>{opt.label}</span>
                  <span className={styles.typeDesc}>{opt.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* ── Core Fields ────────────────────────────────────────────────── */}
        <div className={styles.fieldsSection}>
          {/* Title */}
          <div className={styles.field}>
            <label className={styles.label}>
              Lesson Title <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="title"
              className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
              placeholder="e.g., Introduction to Python Variables"
              value={values.title}
              onChange={handleChange}
              required
            />
            {errors.title && <span className={styles.fieldError}>{errors.title}</span>}
          </div>

          {/* Excerpt */}
          <div className={styles.field}>
            <label className={styles.label}>
              Short Description
              <span className={styles.labelOptional}>(shown in sidebar)</span>
            </label>
            <textarea
              name="excerpt"
              className={styles.textarea}
              placeholder="One sentence describing what students will learn..."
              value={values.excerpt}
              onChange={handleChange}
              rows={2}
            />
            <span className={styles.fieldHint}>
              {values.excerpt?.length || 0}/200 characters
            </span>
          </div>
        </div>

        {/* ── Video Section ────────────────────────────────────────────────── */}
        {isVideo && (
          <div className={styles.videoSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>🎬</span>
              <h4 className={styles.sectionTitle}>Video Settings</h4>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Video URL</label>
              <input
                type="url"
                name="video_url"
                className={`${styles.input} ${errors.video_url ? styles.inputError : ''}`}
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                value={values.video_url}
                onChange={handleChange}
              />
              <span className={styles.fieldHint}>
                Supports YouTube, Vimeo, and direct video links
              </span>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Duration (minutes)</label>
              <input
                type="number"
                name="duration_minutes"
                className={`${styles.input} ${errors.duration_minutes ? styles.inputError : ''}`}
                placeholder="e.g., 12"
                value={values.duration_minutes}
                onChange={handleChange}
                min={1}
                max={600}
              />
            </div>
          </div>
        )}

        {/* ── Quiz Section ────────────────────────────────────────────────── */}
        {isQuiz && (
          <div className={styles.quizSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>✏️</span>
              <h4 className={styles.sectionTitle}>Quiz Settings</h4>
            </div>
            <div className={styles.quizInfo}>
              <span className={styles.quizInfoIcon}>ℹ️</span>
              <span className={styles.quizInfoText}>
                Quiz questions can be added after creating the lesson.
                Use the quiz builder in the lesson viewer.
              </span>
            </div>
          </div>
        )}

        {/* ── Assignment Section ──────────────────────────────────────────── */}
        {isAssignment && (
          <div className={styles.assignmentSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>⚗️</span>
              <h4 className={styles.sectionTitle}>Lab Settings</h4>
            </div>
            <div className={styles.assignmentInfo}>
              <span className={styles.assignmentInfoIcon}>ℹ️</span>
              <span className={styles.assignmentInfoText}>
                Link this lesson to an assignment for hands-on practice.
                You can create the assignment separately and link it here.
              </span>
            </div>
          </div>
        )}

        {/* ── Rich Text Editor ────────────────────────────────────────────── */}
        <div className={styles.editorSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📄</span>
            <h4 className={styles.sectionTitle}>Lesson Content</h4>
          </div>
          <div className={styles.editorWrap}>
            <TipTapEditor
              initialContent={lesson?.body ?? null}
              onChange={(json, html) => {
                setBody(json);
                setBodyHtml(html);
              }}
            />
          </div>
        </div>

        {/* ── Files Section ────────────────────────────────────────────────── */}
        <div className={styles.filesSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📎</span>
            <h4 className={styles.sectionTitle}>Attachments</h4>
            <span className={styles.sectionBadge}>{files.length} files</span>
          </div>

          {files.length > 0 && (
            <ul className={styles.fileList}>
              {files.map((f, i) => (
                <li key={i} className={styles.fileItem}>
                  <span className={styles.fileIcon}>📄</span>
                  <span className={styles.fileName}>{f.name}</span>
                  <a 
                    href={f.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className={styles.fileLink}
                  >
                    🔗
                  </a>
                  <button 
                    type="button" 
                    className={styles.removeFile} 
                    onClick={() => removeFile(i)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className={styles.addFileRow}>
            <input
              type="text"
              placeholder="File name"
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              className={styles.fileInput}
            />
            <input
              type="url"
              placeholder="File URL (e.g., https://example.com/file.pdf)"
              value={newFileUrl}
              onChange={e => setNewFileUrl(e.target.value)}
              className={styles.fileInput}
            />
            <button 
              type="button" 
              className={styles.addFileBtn} 
              onClick={addFile}
              disabled={!newFileName || !newFileUrl}
            >
              <span className={styles.addFileIcon}>＋</span>
              Add
            </button>
          </div>
        </div>

        {/* ── Advanced Settings ────────────────────────────────────────────── */}
        <div className={styles.advancedSection}>
          <button 
            type="button"
            className={styles.advancedToggle}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span className={styles.advancedIcon}>⚙️</span>
            Advanced Settings
            <span className={`${styles.advancedChevron} ${showAdvanced ? styles.advancedChevronOpen : ''}`}>
              ▶
            </span>
          </button>

          {showAdvanced && (
            <div className={styles.advancedContent}>
              {/* Publish Toggle */}
              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleIcon}>
                    {values.is_published === 'true' ? '🌐' : '🔒'}
                  </span>
                  <div>
                    <span className={styles.toggleLabel}>
                      {values.is_published === 'true' ? 'Published' : 'Draft'}
                    </span>
                    <span className={styles.toggleSub}>
                      {values.is_published === 'true' 
                        ? 'Visible to all students' 
                        : 'Hidden from students'}
                    </span>
                  </div>
                </div>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={values.is_published === 'true'}
                    onChange={e => setValues({ 
                      ...values, 
                      is_published: String(e.target.checked) 
                    })}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>

              {/* Free Preview Toggle */}
              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleIcon}>
                    {values.is_free_preview === 'true' ? '🔓' : '🔒'}
                  </span>
                  <div>
                    <span className={styles.toggleLabel}>Free Preview</span>
                    <span className={styles.toggleSub}>
                      {values.is_free_preview === 'true' 
                        ? 'Anyone can view this lesson' 
                        : 'Only enrolled students can view'}
                    </span>
                  </div>
                </div>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={values.is_free_preview === 'true'}
                    onChange={e => setValues({ 
                      ...values, 
                      is_free_preview: String(e.target.checked) 
                    })}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* ── Form Actions ────────────────────────────────────────────────── */}
        <div className={styles.actions}>
          <button 
            type="button" 
            className={styles.cancelBtn} 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={styles.submitBtn} 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                {isEdit ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              <>
                <span className={styles.submitIcon}>
                  {isEdit ? '💾' : '🚀'}
                </span>
                {isEdit ? 'Save Changes' : 'Create Lesson'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}