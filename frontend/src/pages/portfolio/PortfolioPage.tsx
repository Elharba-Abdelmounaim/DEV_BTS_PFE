// src/pages/portfolio/PortfolioPage.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMySubmissions } from '../../api/assignments';
import { getMyEnrollments } from '../../api/courses';
import { getCourse } from '../../api/courses';
import { getCourseProgress } from '../../api/dashboard';
import type { Submission, Enrollment, Course } from '../../types';
import styles from './PortfolioPage.module.css';

// ── Icons ──────────────────────────────────────────────────────────────────
const Icons = {
  GitHub: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.15 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.62.24 2.85.12 3.15.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  ),
  ExternalLink: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
  Code: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Award: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="7"/>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>
  ),
  Book: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round"/>
    </svg>
  ),
  Progress: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 12l4-4M12 12v8"/>
    </svg>
  ),
};

// ── Types ──────────────────────────────────────────────────────────────────
interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  repoUrl?: string;
  liveUrl?: string;
  technologies: string[];
  date: string;
  status: 'completed' | 'in-progress' | 'planned';
  progress?: number;
  courseId?: string;
}

// ── Project Card ──────────────────────────────────────────────────────────────
function ProjectCard({ project }: { project: PortfolioProject }) {
  return (
    <div className={styles.projectCard}>
      <div className={styles.projectContent}>
        <div className={styles.projectHeader}>
          <h3 className={styles.projectTitle}>{project.title}</h3>
          <span className={`${styles.projectStatus} ${
            project.status === 'completed' ? styles.statusCompleted :
            project.status === 'in-progress' ? styles.statusInProgress :
            styles.statusPlanned
          }`}>
            {project.status === 'completed' ? '✅ Completed' :
             project.status === 'in-progress' ? `⏳ ${project.progress || 0}%` :
             '📋 Planned'}
          </span>
        </div>
        <p className={styles.projectDescription}>{project.description}</p>
        
        {project.status === 'in-progress' && project.progress !== undefined && (
          <div className={styles.projectProgress}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <span className={styles.progressText}>{project.progress}% complete</span>
          </div>
        )}

        <div className={styles.projectTechnologies}>
          {project.technologies.map((tech, i) => (
            <span key={i} className={styles.techTag}>{tech}</span>
          ))}
        </div>
        <div className={styles.projectLinks}>
          {project.repoUrl && (
            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
              <Icons.GitHub />
              Repository
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
              <Icons.ExternalLink />
              Live Demo
            </a>
          )}
          {project.courseId && (
            <Link to={`/courses/${project.courseId}`} className={styles.projectLink}>
              <Icons.Book />
              View Course
            </Link>
          )}
        </div>
        <div className={styles.projectDate}>
          📅 {new Date(project.date).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          })}
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ value, label, icon: Icon, color = '#3b82f6' }: { 
  value: number; 
  label: string; 
  icon: React.ComponentType;
  color?: string;
}) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ backgroundColor: color + '15', color }}>
        <Icon />
      </div>
      <div className={styles.statInfo}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const { user } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Load Data ──────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Load submissions and enrollments
      const [subsData, enrollsData] = await Promise.all([
        getMySubmissions().catch(() => [] as Submission[]),
        getMyEnrollments().catch(() => [] as Enrollment[]),
      ]);

      setSubmissions(subsData);
      setEnrollments(enrollsData);

      // 2. Load enrolled courses
      const courseIds = enrollsData.map(e => e.course_id);
      const coursesData: Course[] = [];
      
      for (const id of courseIds) {
        try {
          const course = await getCourse(id);
          coursesData.push(course);
        } catch (err) {
          console.error(`Failed to load course ${id}:`, err);
        }
      }

      // 3. Load progress for each course
      const progressMap: Record<string, any> = {};
      for (const course of coursesData) {
        try {
          const progress = await getCourseProgress(course.id);
          if (progress) {
            progressMap[course.id] = progress;
          }
        } catch (err) {
          console.error(`Failed to load progress for course ${course.id}:`, err);
        }
      }

      // 4. Build projects from courses
      const projectsData: PortfolioProject[] = coursesData.map(course => {
        const progress = progressMap[course.id];
        const isComplete = progress?.percent === 100;
        const isStarted = progress && progress.percent > 0;

        // Extract technologies from course description or use defaults
        const techs = extractTechnologies(course.title, course.description);

        return {
          id: course.id,
          title: course.title,
          description: course.description || `Course: ${course.code} - ${course.credits} credits`,
          repoUrl: user?.github_username ? `https://github.com/${user.github_username}/${course.code.toLowerCase()}` : undefined,
          technologies: techs,
          date: course.created_at || new Date().toISOString(),
          status: isComplete ? 'completed' : isStarted ? 'in-progress' : 'planned',
          progress: progress?.percent || 0,
          courseId: course.id,
        };
      });

      // 5. Add submissions as additional projects
      const submissionProjects: PortfolioProject[] = subsData
        .filter(s => s.assignment?.title)
        .map(s => ({
          id: `sub-${s.id}`,
          title: s.assignment?.title || 'Assignment',
          description: `Assignment submitted on ${new Date(s.submitted_at || s.created_at).toLocaleDateString()}`,
          repoUrl: s.github_repo_url,
          technologies: ['Assignment'],
          date: s.submitted_at || s.created_at || new Date().toISOString(),
          status: s.submission_status === 'graded' ? 'completed' : 'in-progress',
          progress: s.final_score !== null && s.final_score !== undefined ? s.final_score : undefined,
          courseId: s.assignment?.course_id,
        }));

      setProjects([...projectsData, ...submissionProjects]);

    } catch (err: any) {
      setError(err?.message || 'Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Helper: Extract technologies ──────────────────────────────────────────
  const extractTechnologies = (title: string, description?: string): string[] => {
    const text = `${title} ${description || ''}`.toLowerCase();
    const techs: string[] = [];
    
    const techMap: Record<string, string[]> = {
      'react': ['React', 'JavaScript', 'Frontend'],
      'node': ['Node.js', 'JavaScript', 'Backend'],
      'python': ['Python', 'Data Science'],
      'ai': ['AI', 'Machine Learning'],
      'data': ['Data Science', 'Analytics'],
      'web': ['Web Development', 'HTML', 'CSS'],
      'mobile': ['Mobile Development', 'React Native'],
      'cloud': ['Cloud Computing', 'AWS'],
      'devops': ['DevOps', 'CI/CD'],
      'security': ['Cybersecurity'],
      'blockchain': ['Blockchain', 'Web3'],
      'design': ['UI/UX Design', 'Figma'],
      'game': ['Game Development', 'Unity'],
    };

    for (const [key, techsList] of Object.entries(techMap)) {
      if (text.includes(key)) {
        techs.push(...techsList);
      }
    }

    return techs.length > 0 ? techs.slice(0, 4) : ['Programming', 'Problem Solving'];
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    projects: projects.length,
    submissions: submissions.length,
    courses: enrollments.length,
    completed: projects.filter(p => p.status === 'completed').length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
  };

  // ── Filters ──────────────────────────────────────────────────────────────
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress' | 'planned'>('all');
  const [search, setSearch] = useState('');
  
  const filteredProjects = useMemo(() => {
    let result = projects;
    
    if (filter !== 'all') {
      result = result.filter(p => p.status === filter);
    }
    
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.technologies.some(t => t.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [projects, filter, search]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Loading portfolio...</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error && !projects.length) {
    return (
      <div className={styles.errorContainer}>
        <span className={styles.errorIcon}>😕</span>
        <h2 className={styles.errorTitle}>Error loading portfolio</h2>
        <p className={styles.errorText}>{error}</p>
        <button className={styles.retryBtn} onClick={loadData}>
          Retry
        </button>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>💼</span>
            My Portfolio
          </h1>
          <p className={styles.subtitle}>
            {projects.length} projects · {stats.completed} completed · {stats.inProgress} in progress
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/profile" className={styles.profileLink}>
            <Icons.User />
            View Profile
          </Link>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className={styles.statsGrid}>
        <StatCard value={stats.projects} label="Projects" icon={Icons.Code} color="#3b82f6" />
        <StatCard value={stats.submissions} label="Submissions" icon={Icons.Book} color="#8b5cf6" />
        <StatCard value={stats.courses} label="Courses" icon={Icons.Book} color="#22c55e" />
        <StatCard value={stats.completed} label="Completed" icon={Icons.Award} color="#f59e0b" />
      </div>

      {/* ── Search & Filters ────────────────────────────────────────────── */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search projects by title, description, or technology..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => setSearch('')}>
              ✕
            </button>
          )}
        </div>
        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.filterActive : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({projects.length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'completed' ? styles.filterActive : ''}`}
            onClick={() => setFilter('completed')}
          >
            ✅ Completed ({projects.filter(p => p.status === 'completed').length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'in-progress' ? styles.filterActive : ''}`}
            onClick={() => setFilter('in-progress')}
          >
            ⏳ In Progress ({projects.filter(p => p.status === 'in-progress').length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'planned' ? styles.filterActive : ''}`}
            onClick={() => setFilter('planned')}
          >
            📋 Planned ({projects.filter(p => p.status === 'planned').length})
          </button>
        </div>
      </div>

      {/* ── Projects Grid ────────────────────────────────────────────────── */}
      {filteredProjects.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📭</span>
          <h3 className={styles.emptyTitle}>
            {search ? 'No results found' : 'No projects yet'}
          </h3>
          <p className={styles.emptyDesc}>
            {search 
              ? `No projects match "${search}". Try adjusting your search.`
              : "You haven't started any projects yet. Enroll in courses and start building!"}
          </p>
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch('')}>
              Clear search
            </button>
          )}
          {!search && (
            <Link to="/courses" className={styles.emptyBtn}>
              Browse Courses →
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.projectsGrid}>
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* ── Footer Note ──────────────────────────────────────────────────── */}
      <div className={styles.footerNote}>
        <p>
          💡 This portfolio is automatically generated from your courses and submissions. 
          Enroll in new courses and complete assignments to expand your portfolio.
        </p>
      </div>
    </div>
  );
}