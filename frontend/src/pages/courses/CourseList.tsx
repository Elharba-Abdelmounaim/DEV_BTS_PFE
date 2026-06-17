// src/pages/courses/CourseList.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCourses, enrollInCourse, getMyEnrollments } from '../../api/courses';
import type { Course, Enrollment } from '../../types';
import styles from './CourseList.module.css';

// ── Types ────────────────────────────────────────────────────────────────────
type FilterType = 'all' | 'enrolled' | 'teaching' | 'popular';

// ── Search Bar Component ────────────────────────────────────────────────────
const SearchBar: React.FC<{ 
  value: string; 
  onChange: (v: string) => void;
  onClear: () => void;
}> = ({ value, onChange, onClear }) => (
  <div className={styles.searchWrapper}>
    <span className={styles.searchIcon}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    </span>
    <input
      type="text"
      className={styles.searchInput}
      placeholder="Search courses by title, code, or instructor..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {value && (
      <button className={styles.searchClear} onClick={onClear} aria-label="Clear search">
        ✕
      </button>
    )}
  </div>
);

// ── Filter Buttons ──────────────────────────────────────────────────────────
const FilterButtons: React.FC<{ 
  active: FilterType; 
  onChange: (v: FilterType) => void;
  counts: { all: number; enrolled: number; teaching: number; popular: number };
}> = ({ active, onChange, counts }) => {
  const filters: { key: FilterType; label: string; icon: string }[] = [
    { key: 'all', label: 'All Courses', icon: '📚' },
    { key: 'enrolled', label: 'My Courses', icon: '✅' },
    { key: 'teaching', label: 'Teaching', icon: '👨‍🏫' },
    { key: 'popular', label: 'Popular', icon: '🔥' },
  ];

  return (
    <div className={styles.filterButtons}>
      {filters.map(({ key, label, icon }) => (
        <button
          key={key}
          className={`${styles.filterBtn} ${active === key ? styles.filterBtnActive : ''}`}
          onClick={() => onChange(key)}
        >
          <span className={styles.filterIcon}>{icon}</span>
          {label}
          <span className={styles.filterCount}>{counts[key]}</span>
        </button>
      ))}
    </div>
  );
};

// ── Course Card Component ───────────────────────────────────────────────────
const CourseCard: React.FC<{ 
  course: Course; 
  isEnrolled: boolean;
  isTeaching: boolean;
  onEnroll: (id: string) => void;
  loading: boolean;
}> = ({ course, isEnrolled, isTeaching, onEnroll, loading }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/courses/${course.id}`);
  };

  const handleEnroll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEnroll(course.id);
  };

  // Couleur basée sur l'ID
  const colors = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];
  const colorIndex = parseInt(course.id.slice(-2), 16) % colors.length;
  const bgColor = colors[colorIndex];

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.courseCard} onClick={handleClick}>
      {/* Header */}
      <div className={styles.courseCardHeader}>
        <div className={styles.courseCardLeft}>
          <div className={styles.courseAvatar} style={{ backgroundColor: bgColor }}>
            {course.title.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className={styles.courseCode}>{course.code}</span>
            <span className={styles.courseSemester}>{course.semester}</span>
          </div>
        </div>
        <div className={styles.courseCardBadges}>
          {isTeaching && <span className={styles.teacherBadge}>👨‍🏫</span>}
          {isEnrolled && !isTeaching && <span className={styles.enrolledBadge}>✅</span>}
          {!isEnrolled && !isTeaching && course.enrollments_count && course.enrollments_count > 10 && (
            <span className={styles.popularBadge}>🔥</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={styles.courseCardBody}>
        <h3 className={styles.courseCardTitle}>{course.title}</h3>
        <p className={styles.courseCardDesc}>
          {course.description || 'No description available'}
        </p>
        <div className={styles.courseCardTags}>
          <span className={styles.courseTag}>
            <span className={styles.tagIcon}>📚</span> {course.credits} Credits
          </span>
          <span className={styles.courseTag}>
            <span className={styles.tagIcon}>📅</span> {course.academic_year}
          </span>
          {course.enrollments_count !== undefined && (
            <span className={styles.courseTag}>
              <span className={styles.tagIcon}>👥</span> {course.enrollments_count} Students
            </span>
          )}
          <span className={styles.courseTag}>
            <span className={styles.tagIcon}>📆</span> {formatDate(course.created_at)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.courseCardFooter}>
        <div className={styles.courseCardInstructor}>
          <span className={styles.instructorAvatar}>
            {course.instructor?.first_name?.[0] || '👤'}
          </span>
          <span className={styles.instructorName}>
            {course.instructor?.full_name || course.instructor?.first_name || 'Unknown'}
          </span>
        </div>
        <div className={styles.courseCardActions}>
          {isTeaching ? (
            <Link 
              to={`/courses/${course.id}/edit`} 
              className={styles.manageBtn}
              onClick={(e) => e.stopPropagation()}
            >
              ⚙️ Manage
            </Link>
          ) : isEnrolled ? (
            <span className={styles.enrolledBadgeText}>✅ Enrolled</span>
          ) : (
            <button
              className={styles.enrollBtn}
              onClick={handleEnroll}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.spinner} />
              ) : (
                'Enroll Now →'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Skeleton Loader ─────────────────────────────────────────────────────────
const CourseCardSkeleton: React.FC = () => (
  <div className={styles.courseCardSkeleton}>
    <div className={styles.skeletonHeader} />
    <div className={styles.skeletonBody}>
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonDesc} />
      <div className={styles.skeletonTags} />
    </div>
    <div className={styles.skeletonFooter} />
  </div>
);

// ── Main Component ──────────────────────────────────────────────────────────
export default function CourseList() {
  const { user, isTeacher } = useAuth();
  const navigate = useNavigate();

  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [error, setError] = useState<string | null>(null);

  // ── Load Data ──────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [coursesRes, enrollmentsRes] = await Promise.all([
        getCourses(),
        getMyEnrollments().catch(() => [] as Enrollment[]),
      ]);

      setCourses(coursesRes);
      setEnrollments(enrollmentsRes);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Enroll Handler ─────────────────────────────────────────────────────────
  const handleEnroll = async (courseId: string) => {
    try {
      setEnrolling(courseId);
      await enrollInCourse(courseId);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(null);
    }
  };

  // ── Computed Values ────────────────────────────────────────────────────────
  const enrolledIds = useMemo(() => new Set(enrollments.map(e => e.course_id)), [enrollments]);
  const teachingIds = useMemo(
    () => new Set(courses.filter(c => c.instructor_id === user?.id).map(c => c.id)),
    [courses, user]
  );

  // Calculate counts for filters
  const counts = useMemo(() => {
    const all = courses.length;
    const enrolled = courses.filter(c => enrolledIds.has(c.id)).length;
    const teaching = courses.filter(c => teachingIds.has(c.id)).length;
    const popular = courses.filter(c => (c.enrollments_count || 0) > 5).length;
    return { all, enrolled, teaching, popular };
  }, [courses, enrolledIds, teachingIds]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    const searchLower = search.toLowerCase();
    
    // First apply search filter
    let result = courses.filter(course => {
      const matchesSearch = 
        course.title.toLowerCase().includes(searchLower) ||
        course.code.toLowerCase().includes(searchLower) ||
        course.instructor?.full_name?.toLowerCase().includes(searchLower) ||
        course.instructor?.first_name?.toLowerCase().includes(searchLower) ||
        false;
      return matchesSearch;
    });

    // Then apply category filter
    switch (filter) {
      case 'enrolled':
        result = result.filter(c => enrolledIds.has(c.id));
        break;
      case 'teaching':
        result = result.filter(c => teachingIds.has(c.id));
        break;
      case 'popular':
        result = result.filter(c => (c.enrollments_count || 0) > 5);
        break;
      default:
        break;
    }

    // Sort: Teaching first, then enrolled, then by popularity
    return result.sort((a, b) => {
      const aTeaching = teachingIds.has(a.id) ? 1 : 0;
      const bTeaching = teachingIds.has(b.id) ? 1 : 0;
      if (aTeaching !== bTeaching) return bTeaching - aTeaching;
      
      const aEnrolled = enrolledIds.has(a.id) ? 1 : 0;
      const bEnrolled = enrolledIds.has(b.id) ? 1 : 0;
      if (aEnrolled !== bEnrolled) return bEnrolled - aEnrolled;
      
      return (b.enrollments_count || 0) - (a.enrollments_count || 0);
    });
  }, [courses, search, filter, enrolledIds, teachingIds]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>📚 Courses</h1>
          <p className={styles.subtitle}>
            Discover, enroll, and master new skills
          </p>
        </div>
        <div className={styles.headerRight}>
          {isTeacher && (
            <Link to="/courses/new" className={styles.createBtn}>
              <span className={styles.createIcon}>➕</span>
              Create Course
            </Link>
          )}
          <button className={styles.refreshBtn} onClick={loadData}>
            <span className={styles.refreshIcon}>⟳</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className={styles.errorBanner}>
          <span className={styles.errorIcon}>⚠️</span>
          <span className={styles.errorText}>{error}</span>
          <button onClick={loadData} className={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <SearchBar 
          value={search} 
          onChange={setSearch} 
          onClear={() => setSearch('')}
        />
        <FilterButtons 
          active={filter} 
          onChange={setFilter} 
          counts={counts}
        />
      </div>

      {/* Results Info */}
      <div className={styles.resultsInfo}>
        <span className={styles.resultsCount}>
          <strong>{filteredCourses.length}</strong> courses
          {search && <span className={styles.resultsSearch}> · searching for "{search}"</span>}
          {filter !== 'all' && (
            <span className={styles.resultsFilter}>
              · {filter === 'enrolled' ? 'My Courses' : 
                 filter === 'teaching' ? 'Teaching' : 'Popular'}
            </span>
          )}
        </span>
        <span className={styles.resultsTotal}>Total: {courses.length}</span>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className={styles.courseGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <h3 className={styles.emptyTitle}>
            {search ? 'No results found' : 'No courses available'}
          </h3>
          <p className={styles.emptyDesc}>
            {search 
              ? `No courses match "${search}". Try adjusting your search terms.`
              : filter === 'enrolled' 
                ? "You haven't enrolled in any courses yet. Start your learning journey!"
                : filter === 'teaching'
                  ? "You're not teaching any courses yet. Create your first course!"
                  : 'Check back later for new courses.'}
          </p>
          {search && (
            <button className={styles.clearSearchBtn} onClick={() => setSearch('')}>
              Clear search
            </button>
          )}
          {!search && !courses.length && isTeacher && (
            <Link to="/courses/new" className={styles.emptyCreateBtn}>
              Create your first course →
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.courseGrid}>
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={enrolledIds.has(course.id)}
              isTeaching={teachingIds.has(course.id)}
              onEnroll={handleEnroll}
              loading={enrolling === course.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}