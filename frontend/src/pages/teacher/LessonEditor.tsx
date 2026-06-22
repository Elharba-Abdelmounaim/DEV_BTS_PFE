// src/pages/teacher/LessonEditor.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { lessonsApi } from '../../api/lessons';
import TipTapEditor from '../courses/lessons/TipTapEditor';
import styles from './LessonEditor.module.css';

interface LessonData {
  id?: string;
  title: string;
  excerpt: string;
  content: string;      // HTML content from editor
  video_url: string;
  lesson_type: 'video' | 'reading' | 'quiz' | 'assignment';
  duration_minutes: number;
  is_published: boolean;
  order_index: number;
  module_id: string;
}

export default function LessonEditor() {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { isTeacher } = useAuth();

  const [lesson, setLesson] = useState<LessonData>({
    title: '',
    excerpt: '',
    content: '',
    video_url: '',
    lesson_type: 'reading',
    duration_minutes: 0,
    is_published: false,
    order_index: 0,
    module_id: moduleId || '',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [htmlContent, setHtmlContent] = useState('');

  // ── Load lesson if editing ──────────────────────────────────────────────
  useEffect(() => {
    if (lessonId) {
      loadLesson();
    }
  }, [lessonId]);

  const loadLesson = async () => {
    if (!lessonId) return;
    try {
      setLoading(true);
      const data = await lessonsApi.get(courseId!, moduleId!, lessonId);
      setLesson({
        id: data.id,
        title: data.title,
        excerpt: data.excerpt || '',
        content: data.body_html || '',
        video_url: data.video_url || '',
        lesson_type: data.lesson_type,
        duration_minutes: data.duration_minutes || 0,
        is_published: data.is_published || false,
        order_index: data.order_index || 0,
        module_id: data.module_id,
      });
      setContent(data.body || null);
      setHtmlContent(data.body_html || '');
    } catch (error) {
      console.error('Failed to load lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Save Lesson ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!lesson.title.trim()) {
      alert('Please enter a lesson title');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...lesson,
        body_html: htmlContent,
        body: content ?? {},
      };

      if (lessonId) {
        await lessonsApi.update(courseId!, moduleId!, lessonId, payload);
      } else {
        await lessonsApi.create(courseId!, moduleId!, payload);
      }
      
      navigate(`/courses/${courseId}/lessons`);
    } catch (error) {
      console.error('Failed to save lesson:', error);
      alert('Failed to save lesson. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isTeacher) {
    return <div className={styles.error}>Access denied. Teachers only.</div>;
  }

  if (loading) {
    return <div className={styles.loading}>Loading lesson...</div>;
  }

  return (
    <div className={styles.editor}>
      <div className={styles.header}>
        <h1>{lessonId ? '✏️ Edit Lesson' : '📝 Create New Lesson'}</h1>
        <div className={styles.actions}>
          <button 
            className={styles.cancelBtn}
            onClick={() => navigate(`/courses/${courseId}/lessons`)}
          >
            Cancel
          </button>
          <button 
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save Lesson'}
          </button>
        </div>
      </div>

      <div className={styles.form}>
        {/* ── Basic Info ──────────────────────────────────────────────────── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>📋 Basic Information</h3>
          
          <div className={styles.field}>
            <label className={styles.label}>Lesson Title *</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g., Reasoning in ChatGPT and Gemini"
              value={lesson.title}
              onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Excerpt (Short Description)</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Brief description shown in sidebar"
              value={lesson.excerpt}
              onChange={(e) => setLesson({ ...lesson, excerpt: e.target.value })}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Lesson Type</label>
              <select
                className={styles.select}
                value={lesson.lesson_type}
                onChange={(e) => setLesson({ 
                  ...lesson, 
                  lesson_type: e.target.value as any 
                })}
              >
                <option value="reading">📄 Reading</option>
                <option value="video">▶️ Video</option>
                <option value="quiz">✏️ Quiz</option>
                <option value="assignment">📝 Assignment</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Duration (minutes)</label>
              <input
                type="number"
                className={styles.input}
                placeholder="e.g., 12"
                value={lesson.duration_minutes}
                onChange={(e) => setLesson({ 
                  ...lesson, 
                  duration_minutes: parseInt(e.target.value) || 0 
                })}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Video URL (if video lesson)</label>
            <input
              type="url"
              className={styles.input}
              placeholder="https://youtube.com/watch?v=..."
              value={lesson.video_url}
              onChange={(e) => setLesson({ ...lesson, video_url: e.target.value })}
            />
          </div>
        </div>

        {/* ── Content Editor ──────────────────────────────────────────────── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>📝 Lesson Content</h3>
          <p className={styles.sectionDesc}>
            Write the main content of your lesson. Use the toolbar to format text,
            add images, links, and more.
          </p>
          
          <div className={styles.editorWrapper}>
            <TipTapEditor
              initialContent={content}
              onChange={(json: Record<string, unknown>, html: string) => {
                setContent(json);
                setHtmlContent(html);
              }}
            />
          </div>
        </div>

        {/* ── Status ────────────────────────────────────────────────────────── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>📊 Status</h3>
          
          <div className={styles.statusRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={lesson.is_published}
                onChange={(e) => setLesson({ 
                  ...lesson, 
                  is_published: e.target.checked 
                })}
              />
              <span>Publish immediately</span>
              <span className={styles.checkboxHint}>
                Students will see this lesson when published
              </span>
            </label>
          </div>
        </div>

        {/* ── Preview ────────────────────────────────────────────────────────── */}
        <div className={styles.previewSection}>
          <h3 className={styles.sectionTitle}>👁️ Live Preview</h3>
          <div className={styles.preview}>
            <div className={styles.previewHeader}>
              <span className={styles.previewBadge}>
                {lesson.lesson_type === 'video' ? '▶ Video' : 
                 lesson.lesson_type === 'reading' ? '📄 Reading' : 
                 lesson.lesson_type === 'quiz' ? '✏️ Quiz' : '📝 Assignment'}
              </span>
              {lesson.duration_minutes > 0 && (
                <span className={styles.previewDuration}>
                  ⏱️ {lesson.duration_minutes} min
                </span>
              )}
            </div>
            <h2 className={styles.previewTitle}>
              {lesson.title || 'Lesson Title'}
            </h2>
            <p className={styles.previewExcerpt}>
              {lesson.excerpt || 'Excerpt will appear here...'}
            </p>
            <div 
              className={styles.previewContent}
              dangerouslySetInnerHTML={{ __html: content || 'Content will appear here...' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}