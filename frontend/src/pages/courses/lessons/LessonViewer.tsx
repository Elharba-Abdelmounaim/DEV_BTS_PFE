// src/pages/courses/lessons/LessonViewer.tsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { lessonsApi } from '../../../api/lessons';
import type { Lesson, CourseProgress, LessonFile } from '../../../types';
import styles from './LessonViewer.module.css';

interface Props {
  lesson: Lesson;
  courseId: string;
  isTeacher: boolean;
  progress?: CourseProgress;
  onComplete: (updatedProgress: { 
    is_completed: boolean; 
    completed_count: number; 
    total_lessons: number 
  }) => void;
  onEdit?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

// ── Video Player ──────────────────────────────────────────────────────────────
function VideoPlayer({ url, type }: { url: string; type: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const getEmbedUrl = (): string | null => {
    if (type === 'youtube') {
      const id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)?.[1];
      return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&enablejsapi=1` : null;
    }
    if (type === 'vimeo') {
      const id = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0` : null;
    }
    return null;
  };

  const embedUrl = getEmbedUrl();

  if (embedUrl) {
    return (
      <div className={styles.videoWrap}>
        <div className={styles.videoContainer}>
          <iframe
            src={embedUrl}
            className={styles.videoFrame}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="Lesson video"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  // Native video player
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(pct);
    }
  };

  return (
    <div className={styles.videoWrap}>
      <div className={styles.videoContainer}>
        <video
          ref={videoRef}
          src={url}
          controls
          className={styles.videoNative}
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeUpdate={handleTimeUpdate}
          poster={`https://img.youtube.com/vi/${url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)?.[1]}/hqdefault.jpg`}
        >
          Your browser does not support the video tag.
        </video>
        {!isPlaying && (
          <button 
            className={styles.videoPlayBtn}
            onClick={() => videoRef.current?.play()}
          >
            <span className={styles.videoPlayIcon}>▶</span>
          </button>
        )}
        <div className={styles.videoProgress}>
          <div 
            className={styles.videoProgressFill} 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── File Download List ──────────────────────────────────────────────────────
function FileList({ files }: { files: LessonFile[] | undefined }) {
  if (!files || files.length === 0) return null;

  const getIcon = (mime?: string): string => {
    if (!mime) return '📎';
    if (mime.includes('pdf')) return '📄';
    if (mime.includes('image')) return '🖼️';
    if (mime.includes('zip') || mime.includes('rar')) return '🗜️';
    if (mime.includes('text') || mime.includes('code') || mime.includes('javascript')) return '💻';
    if (mime.includes('video')) return '🎬';
    if (mime.includes('audio')) return '🎵';
    return '📎';
  };

  const getColor = (mime?: string): string => {
    if (!mime) return '#64748b';
    if (mime.includes('pdf')) return '#ef4444';
    if (mime.includes('image')) return '#8b5cf6';
    if (mime.includes('zip')) return '#f59e0b';
    if (mime.includes('text') || mime.includes('code')) return '#3b82f6';
    return '#64748b';
  };

  const formatSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={styles.files}>
      <div className={styles.filesHeader}>
        <h3 className={styles.filesTitle}>
          <span className={styles.filesIcon}>📂</span>
          Attachments
        </h3>
        <span className={styles.filesCount}>{files.length} files</span>
      </div>
      <ul className={styles.fileList}>
        {files.map((f: LessonFile, i: number) => (
          <li key={i}>
            <a 
              href={f.url} 
              download 
              className={styles.fileRow} 
              target="_blank" 
              rel="noreferrer"
            >
              <div 
                className={styles.fileIcon} 
                style={{ backgroundColor: `${getColor(f.mime_type)}15`, color: getColor(f.mime_type) }}
              >
                {getIcon(f.mime_type)}
              </div>
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{f.name}</span>
                {f.size && <span className={styles.fileSize}>{formatSize(f.size)}</span>}
              </div>
              <span className={styles.fileDownloadIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function LessonViewer({
  lesson,
  courseId,
  isTeacher,
  onComplete,
  onEdit,
  onNext,
  onPrev,
}: Props) {
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(lesson.is_completed ?? false);

  // Update completed state when lesson changes
  useEffect(() => {
    setCompleted(lesson.is_completed ?? false);
  }, [lesson]);

  const handleComplete = async () => {
    if (isTeacher) return;
    
    setCompleting(true);
    try {
      const result = await lessonsApi.complete(courseId, lesson.module_id, lesson.id);
      setCompleted(result.is_completed);
      onComplete(result);

      // 🎉 Confetti on course completion
      if (result.completed_count === result.total_lessons && result.is_completed) {
        try {
          const confetti = (await import('canvas-confetti')).default;
          confetti({ 
            particleCount: 150, 
            spread: 90, 
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444']
          });
        } catch (e) {
          // Ignore if confetti fails
        }
      }
    } catch (error) {
      console.error('Failed to mark lesson as complete:', error);
    } finally {
      setCompleting(false);
    }
  };

  const typeLabel: Record<string, { label: string; icon: string; color: string }> = {
    video: { label: 'Video', icon: '▶️', color: '#3b82f6' },
    reading: { label: 'Reading', icon: '📖', color: '#8b5cf6' },
    quiz: { label: 'Quiz', icon: '✏️', color: '#f59e0b' },
    assignment: { label: 'Lab', icon: '⚗️', color: '#22c55e' },
  };

  const lessonType = typeLabel[lesson.lesson_type] ?? { 
    label: lesson.lesson_type, 
    icon: '📚', 
    color: '#64748b' 
  };

  return (
    <article className={styles.viewer}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerMeta}>
          <span 
            className={styles.typeBadge}
            style={{ backgroundColor: `${lessonType.color}15`, color: lessonType.color }}
          >
            <span className={styles.typeIcon}>{lessonType.icon}</span>
            {lessonType.label}
          </span>
          {lesson.duration_minutes && lesson.lesson_type === 'video' && (
            <span className={styles.duration}>
              <span className={styles.durationIcon}>⏱️</span>
              {lesson.duration_minutes} min
            </span>
          )}
          {lesson.reading_time_minutes && lesson.lesson_type === 'reading' && (
            <span className={styles.duration}>
              <span className={styles.durationIcon}>📖</span>
              {lesson.reading_time_minutes} min read
            </span>
          )}
          {!lesson.is_published && (
            <span className={styles.draftBadge}>
              <span className={styles.draftIcon}>📝</span>
              Draft
            </span>
          )}
          {completed && !isTeacher && (
            <span className={styles.completedBadge}>
              <span className={styles.completedIcon}>✅</span>
              Completed
            </span>
          )}
        </div>

        <h1 className={styles.title}>{lesson.title}</h1>
        {lesson.excerpt && <p className={styles.excerpt}>{lesson.excerpt}</p>}

        {/* Teacher actions */}
        {isTeacher && onEdit && (
          <div className={styles.teacherActions}>
            <button className={styles.editBtn} onClick={onEdit}>
              <span className={styles.editIcon}>✏️</span>
              Edit Lesson
            </button>
          </div>
        )}
      </header>

      {/* ── Video ────────────────────────────────────────────────────────── */}
      {lesson.video_url && (
        <VideoPlayer url={lesson.video_url} type={lesson.video_type || null} />
      )}

      {/* ── Rich Text Body ──────────────────────────────────────────────── */}
      {lesson.body_html && (
        <div
          className={styles.body}
          dangerouslySetInnerHTML={{ __html: lesson.body_html }}
        />
      )}

      {/* ── Files ────────────────────────────────────────────────────────── */}
      <FileList files={lesson.files} />

      {/* ── Linked Assignment ────────────────────────────────────────────── */}
      {lesson.assignment && (
        <div className={styles.assignmentCard}>
          <div className={styles.assignmentCardLeft}>
            <span className={styles.assignmentIcon}>📝</span>
            <div>
              <p className={styles.assignmentLabel}>Practice Assignment</p>
              <Link to={`/assignments/${lesson.assignment.id}`} className={styles.assignmentLink}>
                {lesson.assignment.title}
                <span className={styles.assignmentArrow}>→</span>
              </Link>
            </div>
          </div>
          <div className={styles.assignmentCardRight}>
            <span className={styles.assignmentScore}>
              🏆 {lesson.assignment.max_score} pts
            </span>
            <span className={`${styles.assignmentStatus} ${
              lesson.assignment.is_published ? styles.statusPublished : styles.statusDraft
            }`}>
              {lesson.assignment.is_published ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerLeft}>
          <div className={styles.navBtns}>
            <button 
              className={`${styles.navBtn} ${styles.navBtnPrev}`} 
              onClick={onPrev} 
              disabled={!onPrev}
            >
              <span className={styles.navArrow}>←</span>
              Previous
            </button>
            <button 
              className={`${styles.navBtn} ${styles.navBtnNext}`} 
              onClick={onNext} 
              disabled={!onNext}
            >
              Next
              <span className={styles.navArrow}>→</span>
            </button>
          </div>
        </div>

        <div className={styles.footerRight}>
          {!isTeacher && (
            <button
              className={`${styles.completeBtn} ${completed ? styles.completeBtnDone : ''}`}
              onClick={handleComplete}
              disabled={completing}
            >
              {completing ? (
                <>
                  <span className={styles.spinner} />
                  Updating...
                </>
              ) : completed ? (
                <>
                  <span className={styles.completeIcon}>✅</span>
                  Completed
                </>
              ) : (
                <>
                  <span className={styles.completeIcon}>○</span>
                  Mark as Completed
                </>
              )}
            </button>
          )}
          {isTeacher && onEdit && (
            <button className={styles.completeBtn} onClick={onEdit}>
              <span className={styles.completeIcon}>✏️</span>
              Edit Lesson
            </button>
          )}
        </div>
      </footer>

      {/* ── Lesson Progress Indicator ────────────────────────────────────── */}
      <div className={styles.progressIndicator}>
        <div className={styles.progressDots}>
          {Array.from({ length: Math.min(5, 10) }).map((_, i) => (
            <span 
              key={i} 
              className={`${styles.progressDot} ${
                i === 0 ? styles.progressDotActive : 
                i < 2 ? styles.progressDotDone : 
                styles.progressDotPending
              }`}
            />
          ))}
        </div>
        <span className={styles.progressText}>
          {completed ? '✅ Lesson complete!' : '📖 In progress'}
        </span>
      </div>
    </article>
  );
}