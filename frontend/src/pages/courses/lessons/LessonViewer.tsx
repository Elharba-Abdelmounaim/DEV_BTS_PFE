import { useState } from 'react'
import { Link } from 'react-router-dom'
import { lessonsApi } from '@/api/lessons'
import type { Lesson, CourseProgress } from '@/types/lessons'
import styles from './LessonViewer.module.css'

interface Props {
  lesson:      Lesson
  courseId:    string
  isTeacher:   boolean
  progress?:   CourseProgress
  onComplete:  (updatedProgress: { is_completed: boolean; completed_count: number; total_lessons: number }) => void
  onEdit?:     () => void
  onNext?:     () => void
  onPrev?:     () => void
}

// ── Video player ──────────────────────────────────────────────────────────────

function VideoPlayer({ url, type }: { url: string; type: string | null }) {
  const getEmbedUrl = (): string | null => {
    if (type === 'youtube') {
      const id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)?.[1]
      return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null
    }
    if (type === 'vimeo') {
      const id = url.match(/vimeo\.com\/(\d+)/)?.[1]
      return id ? `https://player.vimeo.com/video/${id}?title=0&byline=0` : null
    }
    return null // 'upload' — use native <video>
  }

  const embedUrl = getEmbedUrl()

  if (embedUrl) {
    return (
      <div className={styles.videoWrap}>
        <iframe
          src={embedUrl}
          className={styles.videoFrame}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title="Lesson video"
        />
      </div>
    )
  }

  return (
    <div className={styles.videoWrap}>
      <video src={url} controls className={styles.videoNative}>
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

// ── File download list ────────────────────────────────────────────────────────

function FileList({ files }: { files: Lesson['files'] }) {
  if (!files || files.length === 0) return null

  const icon = (mime?: string) => {
    if (!mime) return '📎'
    if (mime.includes('pdf'))   return '📄'
    if (mime.includes('image')) return '🖼'
    if (mime.includes('zip'))   return '🗜'
    if (mime.includes('text') || mime.includes('code')) return '💻'
    return '📎'
  }

  const formatSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024)       return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={styles.files}>
      <h3 className={styles.filesTitle}>Downloads</h3>
      <ul className={styles.fileList}>
        {files.map((f, i) => (
          <li key={i}>
            <a href={f.url} download className={styles.fileRow} target="_blank" rel="noreferrer">
              <span className={styles.fileIcon}>{icon(f.mime_type)}</span>
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{f.name}</span>
                {f.size && <span className={styles.fileSize}>{formatSize(f.size)}</span>}
              </div>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={styles.downloadIcon}>
                <path d="M8 2v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Main viewer ───────────────────────────────────────────────────────────────

export default function LessonViewer({
  lesson, courseId, isTeacher, progress, onComplete, onEdit, onNext, onPrev,
}: Props) {
  const [completing, setCompleting] = useState(false)
  const [completed,  setCompleted]  = useState(lesson.is_completed ?? false)

  const handleComplete = async () => {
    if (isTeacher) return
    setCompleting(true)
    try {
      const result = await lessonsApi.complete(courseId, lesson.module_id, lesson.id)
      setCompleted(result.is_completed)
      onComplete(result)

      // 🎉 Confetti on full course completion (premium UX)
      if (result.completed_count === result.total_lessons && result.is_completed) {
        import('canvas-confetti').then(({ default: confetti }) => {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } })
        }).catch(() => {})
      }
    } finally {
      setCompleting(false)
    }
  }

  const typeLabel: Record<string, string> = {
    video: '▶ Video', reading: '📄 Reading', quiz: '✏️ Quiz', lab: '⚗️ Lab',
  }

  return (
    <article className={styles.viewer}>

      {/* Lesson header */}
      <header className={styles.header}>
        <div className={styles.headerMeta}>
          <span className={styles.typeBadge}>{typeLabel[lesson.lesson_type] ?? lesson.lesson_type}</span>
          {lesson.duration_minutes && (
            <span className={styles.duration}>{lesson.duration_minutes} min</span>
          )}
          {lesson.reading_time_minutes && lesson.lesson_type !== 'video' && (
            <span className={styles.duration}>{lesson.reading_time_minutes} min read</span>
          )}
          {!lesson.is_published && (
            <span className={styles.draftBadge}>Draft</span>
          )}
        </div>

        <h1 className={styles.title}>{lesson.title}</h1>
        {lesson.excerpt && <p className={styles.excerpt}>{lesson.excerpt}</p>}

        {/* Teacher actions */}
        {isTeacher && onEdit && (
          <button className={styles.editBtn} onClick={onEdit}>Edit lesson</button>
        )}
      </header>

      {/* Video */}
      {lesson.video_url && (
        <VideoPlayer url={lesson.video_url} type={lesson.video_type} />
      )}

      {/* Rich text body */}
      {lesson.body_html && (
        <div
          className={styles.body}
          dangerouslySetInnerHTML={{ __html: lesson.body_html }}
        />
      )}

      {/* Files */}
      <FileList files={lesson.files} />

      {/* Linked assignment */}
      {lesson.assignment && (
        <div className={styles.assignmentCard}>
          <span className={styles.assignmentIcon}>📝</span>
          <div>
            <p className={styles.assignmentLabel}>Practice assignment</p>
            <Link to={`/assignments/${lesson.assignment.id}`} className={styles.assignmentLink}>
              {lesson.assignment.title} →
            </Link>
          </div>
          <span className={styles.assignmentScore}>{lesson.assignment.max_score} pts</span>
        </div>
      )}

      {/* Navigation + complete button */}
      <footer className={styles.footer}>
        <div className={styles.navBtns}>
          <button className={styles.navBtn} onClick={onPrev} disabled={!onPrev}>
            ← Previous
          </button>
          <button className={styles.navBtn} onClick={onNext} disabled={!onNext}>
            Next →
          </button>
        </div>

        {!isTeacher && (
          <button
            className={`${styles.completeBtn} ${completed ? styles.completeBtnDone : ''}`}
            onClick={handleComplete}
            disabled={completing}
          >
            {completing ? (
              <span className="spinner" style={{ width: 16, height: 16 }} />
            ) : completed ? (
              '✓ Completed'
            ) : (
              'Mark as completed'
            )}
          </button>
        )}
      </footer>
    </article>
  )
}
