import styles from './CourseProgress.module.css'

interface Props {
  completed: number
  total:     number
  pct:       number
}

export default function CourseProgress({ completed, total, pct }: Props) {
  if (total === 0) return null

  const isComplete = completed === total

  return (
    <div className={`${styles.root} ${isComplete ? styles.rootComplete : ''}`}>
      <div className={styles.top}>
        <span className={styles.label}>
          {isComplete ? '🎉 Course complete!' : 'Your progress'}
        </span>
        <span className={styles.count}>
          {completed} / {total} lessons
        </span>
      </div>
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${isComplete ? styles.fillComplete : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={styles.pct}>{pct}%</span>
    </div>
  )
}
