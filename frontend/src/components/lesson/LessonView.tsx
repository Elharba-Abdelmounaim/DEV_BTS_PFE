// src/pages/student/LessonView.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { modulesApi, lessonsApi } from '../../api/lessons';
import { SidebarNavigation } from '../../components/lesson/SidebarNavigation';
import { ContentRenderer } from '../../components/lesson/ContentRenderer';
import styles from './LessonView.module.css';

interface LessonData {
  id: string;
  title: string;
  excerpt?: string;
  body_html?: string;
  video_url?: string;
  lesson_type: string;
  duration_minutes?: number;
  is_completed?: boolean;
  module_id: string;
}

export default function LessonView() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { isTeacher } = useAuth();

  const [modules, setModules] = useState<any[]>([]);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId, lessonId]);

  const loadData = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      
      // Load modules
      const modulesData = await modulesApi.list(courseId);
      setModules(modulesData.data);

      // Load progress
      try {
        const progressData = await lessonsApi.progress(courseId);
        setProgress(progressData);
      } catch (error) {
        console.warn('Progress not available:', error);
      }

      // Load lesson if lessonId exists
      if (lessonId) {
        // Find module containing this lesson
        let foundLesson: LessonData | null = null;
        
        for (const module of modulesData.data) {
          const lessons = module.lessons || [];
          const found = lessons.find((l: any) => l.id === lessonId);
          if (found) {
            try {
              const fullLesson = await lessonsApi.get(courseId, module.id, lessonId);
              foundLesson = fullLesson;
              break;
            } catch (error) {
              console.error('Failed to load lesson:', error);
            }
          }
        }
        
        setLesson(foundLesson);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLesson = async (selectedLesson: any, module: any) => {
    // Navigate to the selected lesson
    navigate(`/courses/${courseId}/lessons/${selectedLesson.id}`);
    // Reload data
    await loadData();
  };

  const handleComplete = async () => {
    if (!lesson || !courseId) return;
    
    try {
      // Find the module containing this lesson
      let moduleId = lesson.module_id;
      if (!moduleId) {
        for (const module of modules) {
          const lessons = module.lessons || [];
          const found = lessons.find((l: any) => l.id === lesson.id);
          if (found) {
            moduleId = module.id;
            break;
          }
        }
      }

      if (!moduleId) {
        console.error('Module not found for lesson');
        return;
      }

      const result = await lessonsApi.complete(courseId, moduleId, lesson.id);
      
      // Update progress
      setProgress((prev: any) => ({
        ...prev,
        completed_lessons: result.completed_count,
        percent: Math.round((result.completed_count / result.total_lessons) * 100)
      }));
      
      // Update lesson completed status
      setLesson((prev: any) => ({ ...prev, is_completed: true }));
      
      // Reload data to update sidebar
      await loadData();
    } catch (error) {
      console.error('Failed to mark lesson as complete:', error);
    }
  };

  const handleAddModule = () => {
    navigate(`/courses/${courseId}/modules/new`);
  };

  const handleAddLesson = (moduleId: string) => {
    navigate(`/courses/${courseId}/modules/${moduleId}/lessons/new`);
  };

  // ── Get embed URL ──────────────────────────────────────────────────────────
  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0`;
    }
    
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0`;
    }
    
    return url;
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading lesson...</div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <SidebarNavigation
        modules={modules}
        activeLessonId={lessonId || null}
        onSelectLesson={handleSelectLesson}
        isTeacher={isTeacher}
        onAddModule={handleAddModule}
        onAddLesson={handleAddLesson}
      />

      {/* ── Main Content ────────────────────────────────────────────── */}
      <main className={styles.main}>
        {lesson ? (
          <>
            {/* Header */}
            <header className={styles.header}>
              <div className={styles.headerTop}>
                <div className={styles.headerMeta}>
                  <span className={styles.typeBadge}>
                    {lesson.lesson_type === 'video' ? '▶ Video' : 
                     lesson.lesson_type === 'reading' ? '📄 Reading' : 
                     lesson.lesson_type === 'quiz' ? '✏️ Quiz' : '📝 Assignment'}
                  </span>
                  {lesson.duration_minutes && lesson.duration_minutes > 0 && (
                    <span className={styles.duration}>
                      ⏱️ {lesson.duration_minutes} min
                    </span>
                  )}
                  {lesson.is_completed && (
                    <span className={styles.completedBadge}>✅ Completed</span>
                  )}
                </div>
              </div>

              <h1 className={styles.title}>{lesson.title}</h1>
              {lesson.excerpt && (
                <p className={styles.excerpt}>{lesson.excerpt}</p>
              )}
            </header>

            {/* Content */}
            <div className={styles.content}>
              {/* Video */}
              {lesson.video_url && (
                <div className={styles.videoWrap}>
                  <div className={styles.videoContainer}>
                    <iframe
                      src={getEmbedUrl(lesson.video_url)}
                      className={styles.videoFrame}
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      title={lesson.title}
                    />
                  </div>
                </div>
              )}

              {/* Body */}
              {lesson.body_html && (
                <ContentRenderer content={lesson.body_html} />
              )}

              {/* Complete Button */}
              <div className={styles.actions}>
                {!isTeacher && !lesson.is_completed && (
                  <button 
                    className={styles.completeBtn}
                    onClick={handleComplete}
                  >
                    ✅ Mark as Completed
                  </button>
                )}

                {lesson.is_completed && (
                  <div className={styles.completedMessage}>
                    🎉 You've completed this lesson!
                  </div>
                )}

                {isTeacher && (
                  <button 
                    className={styles.editBtn}
                    onClick={() => navigate(`/courses/${courseId}/lessons/${lesson.id}/edit`)}
                  >
                    ✏️ Edit Lesson
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>👈</span>
            <p>Select a lesson from the sidebar to start learning!</p>
          </div>
        )}
      </main>
    </div>
  );
}