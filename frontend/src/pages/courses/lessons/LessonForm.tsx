import { useState } from 'react'
import { lessonsApi } from '@/api/lessons'
import { useForm } from '@/hooks/useForm'
import Input from '@/components/ui/Input'
import TipTapEditor from './TipTapEditor'
import type { Lesson, LessonType, CourseModule, LessonFile } from '../../../types'
import styles from './LessonForm.module.css'

interface Props {
  courseId:   string
  module:     CourseModule
  lesson?:    Lesson | null      // null = create mode
  modules?:   CourseModule[]     // for module selector
  onSuccess:  (lesson: Lesson) => void
  onCancel:   () => void
}

const TYPE_OPTIONS: { value: LessonType; label: string; icon: string }[] = [
  { value: 'reading', label: 'Reading',  icon: '📄' },
  { value: 'video',   label: 'Video',    icon: '▶' },
  { value: 'quiz',    label: 'Quiz',     icon: '✏️' },
  { value: 'assignment', label: 'Lab',   icon: '⚗️' },
]

export default function LessonForm({ courseId, module, lesson, onSuccess, onCancel }: Props) {
  const isEdit = !!lesson

  const [body,        setBody]        = useState<Record<string, unknown> | null>(lesson?.body ?? null)
  const [bodyHtml,    setBodyHtml]    = useState<string>(lesson?.body_html ?? '')
  const [files,       setFiles]       = useState<LessonFile[]>(lesson?.files ?? [])
  const [newFileUrl,  setNewFileUrl]  = useState('')
  const [newFileName, setNewFileName] = useState('')

  const { values, errors, globalError, loading, handleChange, handleSubmit, setValues } =
    useForm<{
      title:            string
      excerpt:          string
      lesson_type:      string
      video_url:        string
      video_type:       string
      duration_minutes: string
      assignment_id:    string
      is_published:     string
      is_free_preview:  string
    }>({
      initialValues: {
        title:            lesson?.title            ?? '',
        excerpt:          lesson?.excerpt          ?? '',
        lesson_type:      lesson?.lesson_type      ?? 'reading',
        video_url:        lesson?.video_url        ?? '',
        video_type:       lesson?.video_type       ?? '',
        duration_minutes: lesson?.duration_minutes ? String(lesson.duration_minutes) : '',
        assignment_id:    lesson?.assignment_id    ?? '',
        is_published:     String(lesson?.is_published    ?? false),
        is_free_preview:  String(lesson?.is_free_preview ?? false),
      },
      onSubmit: async (vals) => {
        // Detect video type from URL
        let detectedType = vals.video_type || ''
        if (vals.video_url && !detectedType) {
          if (vals.video_url.includes('youtube') || vals.video_url.includes('youtu.be'))
            detectedType = 'youtube'
          else if (vals.video_url.includes('vimeo'))
            detectedType = 'vimeo'
          else if (vals.video_url)
            detectedType = 'upload'
        }

        const payload: Partial<Lesson> = {
          title:            vals.title,
          excerpt:          vals.excerpt || undefined,
          lesson_type:      vals.lesson_type as LessonType,
          body:             body ?? undefined,
          body_html:        bodyHtml || undefined,
          video_url:        vals.video_url || undefined,
          video_type:       (detectedType || undefined) as any,
          duration_minutes: vals.duration_minutes ? Number(vals.duration_minutes) : undefined,
          files:            files.length ? files : [],
          assignment_id:    vals.assignment_id || undefined,
          is_published:     vals.is_published === 'true',
          is_free_preview:  vals.is_free_preview === 'true',
        }

        let saved: Lesson
        if (isEdit && lesson) {
          saved = await lessonsApi.update(courseId, module.id, lesson.id, payload)
        } else {
          saved = await lessonsApi.create(courseId, module.id, payload)
        }
        onSuccess(saved)
      },
    })

  const addFile = () => {
    if (!newFileUrl || !newFileName) return
    setFiles(prev => [...prev, { name: newFileName, url: newFileUrl }])
    setNewFileUrl('')
    setNewFileName('')
  }

  const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i))

  const isVideo = values.lesson_type === 'video'

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h2 className={styles.title}>{isEdit ? 'Edit lesson' : 'New lesson'}</h2>
        <button className={styles.closeBtn} onClick={onCancel}>✕</button>
      </div>

      {globalError && <div className={styles.alert}>{globalError}</div>}

      <form onSubmit={handleSubmit} noValidate className={styles.form}>

        {/* Lesson type selector */}
        <div className={styles.typeRow}>
          {TYPE_OPTIONS.map(opt => (
            <label
              key={opt.value}
              className={`${styles.typeOption} ${values.lesson_type === opt.value ? styles.typeActive : ''}`}
            >
              <input
                type="radio"
                name="lesson_type"
                value={opt.value}
                checked={values.lesson_type === opt.value}
                onChange={handleChange}
                style={{ display: 'none' }}
              />
              <span className={styles.typeIcon}>{opt.icon}</span>
              <span className={styles.typeLabel}>{opt.label}</span>
            </label>
          ))}
        </div>

        {/* Core fields */}
        <Input
          label="Title"
          name="title"
          placeholder="e.g. Introduction to Python Variables"
          value={values.title}
          onChange={handleChange}
          error={errors.title}
          required
        />

        <div className={styles.field}>
          <label className={styles.label}>Short description (shown in sidebar)</label>
          <textarea
            name="excerpt"
            placeholder="One sentence describing what students will learn…"
            value={values.excerpt}
            onChange={handleChange}
            className={styles.textarea}
            rows={2}
          />
        </div>

        {/* Video section */}
        {isVideo && (
          <div className={styles.fieldset}>
            <legend className={styles.legend}>Video</legend>
            <Input
              label="Video URL (YouTube, Vimeo, or direct link)"
              name="video_url"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={values.video_url}
              onChange={handleChange}
              error={errors.video_url}
              hint="Paste a YouTube or Vimeo link — embed is auto-detected."
            />
            <Input
              label="Duration (minutes)"
              name="duration_minutes"
              type="number"
              min={1}
              max={600}
              placeholder="e.g. 12"
              value={values.duration_minutes}
              onChange={handleChange}
              error={errors.duration_minutes}
            />
          </div>
        )}

        {/* Rich text body */}
        <div className={styles.field}>
          <label className={styles.label}>Lesson content</label>
          <div className={styles.editorWrap}>
            <TipTapEditor
              initialContent={lesson?.body ?? null}
              onChange={(json, html) => {
                setBody(json)
                setBodyHtml(html)
              }}
            />
          </div>
        </div>

        {/* Downloadable files */}
        <div className={styles.fieldset}>
          <legend className={styles.legend}>Downloadable files</legend>

          {files.length > 0 && (
            <ul className={styles.fileList}>
              {files.map((f, i) => (
                <li key={i} className={styles.fileItem}>
                  <span className={styles.fileName}>{f.name}</span>
                  <button type="button" className={styles.removeFile} onClick={() => removeFile(i)}>✕</button>
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
              placeholder="https://..."
              value={newFileUrl}
              onChange={e => setNewFileUrl(e.target.value)}
              className={styles.fileInput}
            />
            <button type="button" className={styles.addFileBtn} onClick={addFile}>
              + Add
            </button>
          </div>
        </div>

        {/* Toggles */}
        <div className={styles.toggleRow}>
          <div>
            <p className={styles.toggleLabel}>Publish immediately</p>
            <p className={styles.toggleSub}>Students will see this lesson when published.</p>
          </div>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={values.is_published === 'true'}
              onChange={e => setValues({ is_published: String(e.target.checked) })}
            />
            <span className={styles.toggleSlider} />
          </label>
        </div>

        <div className={styles.toggleRow}>
          <div>
            <p className={styles.toggleLabel}>Free preview</p>
            <p className={styles.toggleSub}>Non-enrolled students can view this lesson.</p>
          </div>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={values.is_free_preview === 'true'}
              onChange={e => setValues({ is_free_preview: String(e.target.checked) })}
            />
            <span className={styles.toggleSlider} />
          </label>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading
              ? <span className="spinner" style={{ width: 16, height: 16 }} />
              : isEdit ? 'Save changes' : 'Create lesson'}
          </button>
        </div>
      </form>
    </div>
  )
}
