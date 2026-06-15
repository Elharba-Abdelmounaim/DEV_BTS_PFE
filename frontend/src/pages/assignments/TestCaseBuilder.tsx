import { useState } from 'react'
import type { TestCase } from '@/types'
import styles from './TestCaseBuilder.module.css'

const STRATEGIES = [
  { value: 'exit_zero',       label: 'Exit code 0',       hint: 'Program exits without error' },
  { value: 'no_timeout',      label: 'No timeout',        hint: 'Completes within time limit' },
  { value: 'has_output',      label: 'Has output',        hint: 'Prints at least one line' },
  { value: 'no_stderr',       label: 'No stderr',         hint: 'No error/warning output' },
  { value: 'output_contains', label: 'Output contains',   hint: 'Stdout includes expected text' },
  { value: 'output_matches',  label: 'Output matches regex', hint: 'Stdout matches a pattern' },
  { value: 'json_field',      label: 'JSON field',        hint: 'Output JSON has required key' },
]

interface Props {
  testCases: TestCase[]
  onChange:  (cases: TestCase[]) => void
  maxScore:  number
}

let _idCounter = 1
function newId() { return `tc${_idCounter++}` }

export default function TestCaseBuilder({ testCases, onChange, maxScore }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const add = () => {
    const tc: TestCase = { id: newId(), name: 'New test', strategy: 'exit_zero', weight: Math.floor(maxScore / 4) }
    onChange([...testCases, tc])
    setExpanded(tc.id)
  }

  const update = (id: string, patch: Partial<TestCase>) => {
    onChange(testCases.map(tc => tc.id === id ? { ...tc, ...patch } : tc))
  }

  const remove = (id: string) => {
    onChange(testCases.filter(tc => tc.id !== id))
    if (expanded === id) setExpanded(null)
  }

  const totalWeight = testCases.reduce((s, tc) => s + (tc.weight ?? 0), 0)

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>Test cases ({testCases.length})</span>
        {totalWeight > 0 && (
          <span className={`${styles.weightTotal} ${totalWeight !== maxScore ? styles.weightWarn : styles.weightOk}`}>
            Total weight: {totalWeight}/{maxScore}
          </span>
        )}
      </div>

      {testCases.length === 0 && (
        <p className={styles.empty}>No test cases yet. Add one to enable auto-grading.</p>
      )}

      <div className={styles.list}>
        {testCases.map((tc, i) => (
          <div key={tc.id} className={styles.card}>
            {/* Card header */}
            <div className={styles.cardHead} onClick={() => setExpanded(expanded === tc.id ? null : tc.id)}>
              <span className={styles.cardNum}>#{i + 1}</span>
              <span className={styles.cardName}>{tc.name || 'Unnamed test'}</span>
              <span className={styles.cardStrategy}>{STRATEGIES.find(s => s.value === tc.strategy)?.label}</span>
              <span className={styles.cardWeight}>{tc.weight}pts</span>
              <button className={styles.removeBtn} onClick={e => { e.stopPropagation(); remove(tc.id) }}>✕</button>
              <svg className={`${styles.chevron} ${expanded === tc.id ? styles.chevronOpen : ''}`}
                width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Expanded editor */}
            {expanded === tc.id && (
              <div className={styles.editor}>
                <div className={styles.editorRow}>
                  <div className={styles.editorField}>
                    <label className={styles.editorLabel}>Test name</label>
                    <input
                      type="text"
                      value={tc.name}
                      onChange={e => update(tc.id, { name: e.target.value })}
                      className={styles.editorInput}
                      placeholder="e.g. Empty input returns 0"
                    />
                  </div>
                  <div className={styles.editorField} style={{ maxWidth: 100 }}>
                    <label className={styles.editorLabel}>Weight (pts)</label>
                    <input
                      type="number"
                      value={tc.weight}
                      min={0}
                      max={100}
                      onChange={e => update(tc.id, { weight: Number(e.target.value) })}
                      className={styles.editorInput}
                    />
                  </div>
                </div>

                <div className={styles.editorField}>
                  <label className={styles.editorLabel}>Strategy</label>
                  <select
                    value={tc.strategy}
                    onChange={e => update(tc.id, { strategy: e.target.value })}
                    className={styles.editorSelect}
                  >
                    {STRATEGIES.map(s => (
                      <option key={s.value} value={s.value}>{s.label} — {s.hint}</option>
                    ))}
                  </select>
                </div>

                {['output_contains', 'output_matches', 'json_field'].includes(tc.strategy) && (
                  <div className={styles.editorField}>
                    <label className={styles.editorLabel}>
                      {tc.strategy === 'output_contains' ? 'Expected substring' :
                       tc.strategy === 'output_matches'  ? 'Regex pattern' :
                       'JSON key name'}
                    </label>
                    <input
                      type="text"
                      value={tc.expected ?? ''}
                      onChange={e => update(tc.id, { expected: e.target.value })}
                      className={styles.editorInput}
                      placeholder={
                        tc.strategy === 'output_contains' ? 'e.g. Hello, World!' :
                        tc.strategy === 'output_matches'  ? 'e.g. ^\\d+$' :
                        'e.g. result'
                      }
                    />
                  </div>
                )}

                <div className={styles.editorField}>
                  <label className={styles.editorLabel}>Hint for students (shown on failure)</label>
                  <input
                    type="text"
                    value={tc.hint ?? ''}
                    onChange={e => update(tc.id, { hint: e.target.value })}
                    className={styles.editorInput}
                    placeholder="e.g. Make sure your function returns an integer"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button type="button" className={styles.addBtn} onClick={add}>
        + Add test case
      </button>
    </div>
  )
}
