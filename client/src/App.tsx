import { useCallback, useEffect, useState } from 'react'
import './App.css'
import {
  loadAutoSettings,
  loadHandledKeys,
  markSlotHandled,
  newAutoRow,
  nextPromptDecision,
  saveAutoSettings,
  saveHandledKeys,
  WEEKDAY_LABELS,
  type AutoRow,
  type AutoSettings,
  type PromptDecision,
} from './autoSchedule.ts'
import { parsePeriod, yesterdayAndToday } from './ymd.ts'

type SheetRow = Record<string, string>
type Sheets = Record<string, SheetRow[]>

type Candidate = {
  proposedTitle?: string
  startAt?: string | null
  dueAt?: string | null
  confidenceBand?: string
  autoRegisterEligible?: boolean
}

type IngestResult = {
  ok?: boolean
  error?: string
  steps?: string[]
  file?: string
  path?: string
  sheets?: Sheets
  candidates?: Candidate[]
  extraction?: { count?: number; error?: string | null }
  items?: { title?: string; when?: string; due?: string }[]
  ai?: { ok?: boolean; error?: string; model?: string }
}

type LoadingMode = 'ingest' | 'latest' | 'manual' | 'auto' | null

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function App() {
  const defaults = yesterdayAndToday()
  const [loading, setLoading] = useState<LoadingMode>(null)
  const [result, setResult] = useState<IngestResult | null>(null)
  const [manualError, setManualError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState(defaults.start)
  const [endDate, setEndDate] = useState(defaults.end)
  const [settings, setSettings] = useState<AutoSettings>(() => loadAutoSettings())
  const [handled, setHandled] = useState<Set<string>>(() => loadHandledKeys())
  const [prompt, setPrompt] = useState<PromptDecision | null>(null)

  const persistSettings = useCallback((next: AutoSettings) => {
    setSettings(next)
    saveAutoSettings(next)
  }, [])

  const persistHandled = useCallback((next: Set<string>) => {
    setHandled(next)
    saveHandledKeys(next, yesterdayAndToday().end)
  }, [])

  async function runOrganize(mode: Exclude<LoadingMode, null>, period?: { start: string; end: string }) {
    setLoading(mode)
    setResult(null)
    setManualError(null)
    try {
      const url = mode === 'latest' ? '/api/open-latest' : '/api/ingest'
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:
          mode === 'latest' || !period
            ? '{}'
            : JSON.stringify({ startDate: period.start, endDate: period.end }),
      })
      const data = (await res.json()) as IngestResult
      setResult(data)
    } catch (e) {
      setResult({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        steps: [],
      })
    } finally {
      setLoading(null)
    }
  }

  function submitManual() {
    const parsed = parsePeriod(startDate, endDate)
    if (!parsed.ok) {
      setManualError(parsed.error)
      return
    }
    setManualError(null)
    void runOrganize('manual', { start: parsed.start, end: parsed.end })
  }

  useEffect(() => {
    const tick = () => {
      if (loading !== null || prompt !== null) return
      const due = nextPromptDecision(new Date(), settings.rows, handled)
      if (due) setPrompt(due)
    }
    tick()
    const id = window.setInterval(tick, 15000)
    const onVis = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [handled, loading, prompt, settings.rows])

  function closePrompt(run: boolean) {
    if (!prompt) return
    const next = markSlotHandled(handled, prompt.slotKey)
    persistHandled(next)
    setPrompt(null)
    if (run) {
      void runOrganize('auto')
    }
  }

  function addRow() {
    persistSettings({ rows: [...settings.rows, newAutoRow()] })
  }

  function updateRow(id: string, patch: Partial<AutoRow>) {
    persistSettings({
      rows: settings.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })
  }

  function removeRow(id: string) {
    persistSettings({ rows: settings.rows.filter((r) => r.id !== id) })
  }

  function toggleWeekday(row: AutoRow, day: number) {
    const has = row.weekdays.includes(day)
    const weekdays = has ? row.weekdays.filter((d) => d !== day) : [...row.weekdays, day].sort()
    updateRow(row.id, { weekdays })
  }

  const sheets = result?.sheets ?? {}
  const sheetNames = Object.keys(sheets)
  const error = result && !result.ok ? result.error : result?.error
  const busy = loading !== null
  const candidates = result?.candidates ?? []
  const items = result?.items ?? []

  return (
    <div className="page">
      <header className="header">
        <h1>교사 일정 정리</h1>
        <p>쿨메신저 쪽지를 받아 일정을 정리합니다. 자동 실행은 확인 후에만 돌아갑니다.</p>
      </header>

      <main className="card">
        <section className="section">
          <h2>수동 일정 정리</h2>
          <p className="note">
            기간은 시작·끝 모두 8자리 년월일(YYYYMMDD)입니다. 잘못된 값이면 추출을 호출하지 않습니다.
          </p>
          <div className="period">
            <label>
              시작
              <input
                type="text"
                inputMode="numeric"
                maxLength={8}
                placeholder="YYYYMMDD"
                value={startDate}
                disabled={busy}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setManualError(null)
                }}
              />
            </label>
            <span className="tilde">~</span>
            <label>
              끝
              <input
                type="text"
                inputMode="numeric"
                maxLength={8}
                placeholder="YYYYMMDD"
                value={endDate}
                disabled={busy}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setManualError(null)
                }}
              />
            </label>
            <button type="button" className="btn-primary" disabled={busy} onClick={submitManual}>
              {loading === 'manual' ? '정리하는 중…' : '이 기간으로 정리'}
            </button>
          </div>
          {manualError ? <p className="error">{manualError}</p> : null}

          <div className="actions">
            <button
              type="button"
              className="btn-primary"
              disabled={busy}
              onClick={() => void runOrganize('ingest')}
            >
              {loading === 'ingest' ? '가져오는 중…' : '어제~오늘 메시지 가져오기'}
            </button>
            <button
              type="button"
              className="btn-ghost"
              disabled={busy}
              onClick={() => void runOrganize('latest')}
            >
              {loading === 'latest' ? '여는 중…' : '최근 받은 파일 열기'}
            </button>
          </div>
        </section>

        <section className="section">
          <h2>자동 일정 정리 시각</h2>
          <p className="note">
            행을 추가해 기본 시각을 등록합니다. 해당 시각이 되면 바로 돌리지 않고 실행 여부를 묻습니다.
            설정은 이 브라우저에 저장되어 다시 켜도 유지됩니다.
          </p>
          <div className="table-wrap settings-table">
            <table>
              <thead>
                <tr>
                  <th>사용</th>
                  <th>시각</th>
                  <th>요일</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {settings.rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty">
                      아직 등록한 시각이 없습니다. 행을 추가해 주세요.
                    </td>
                  </tr>
                ) : (
                  settings.rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={row.enabled}
                          onChange={(e) => updateRow(row.id, { enabled: e.target.checked })}
                          aria-label="이 시각 사용"
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          value={row.time}
                          onChange={(e) => updateRow(row.id, { time: e.target.value })}
                        />
                      </td>
                      <td>
                        <div className="weekdays">
                          {WEEKDAY_LABELS.map((label, i) => (
                            <label key={label} className={row.weekdays.includes(i) ? 'on' : ''}>
                              <input
                                type="checkbox"
                                checked={row.weekdays.includes(i)}
                                onChange={() => toggleWeekday(row, i)}
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                      </td>
                      <td>
                        <button type="button" className="btn-ghost btn-small" onClick={() => removeRow(row.id)}>
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="actions">
            <button type="button" className="btn-ghost" onClick={addRow}>
              시각 행 추가
            </button>
          </div>
        </section>

        {result?.steps && result.steps.length > 0 ? (
          <p className="steps">{result.steps.join(' → ')}</p>
        ) : null}

        {error ? <p className="error">{error}</p> : null}

        {result?.ok ? (
          <p className="ok">
            일정 후보 {result.extraction?.count ?? candidates.length}건
            {items.length > 0 ? ` · 로컬 AI ${items.length}건` : ''}
            {result.ai && result.ai.ok === false ? ` · AI 안내: ${result.ai.error ?? '로컬 AI를 쓰지 못했습니다.'}` : ''}
          </p>
        ) : null}

        {candidates.length > 0 ? (
          <section className="sheet">
            <h2>정리된 일정 후보</h2>
            <ul className="candidates">
              {candidates.map((c, i) => (
                <li key={i}>
                  <strong>{c.proposedTitle ?? '(제목 없음)'}</strong>
                  <span>
                    {[c.startAt, c.dueAt, c.confidenceBand].filter(Boolean).join(' · ')}
                    {c.autoRegisterEligible === false ? ' · 확인 필요' : ''}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {sheetNames.map((name) => {
          const rows = sheets[name] ?? []
          const headers = rows[0] ? Object.keys(rows[0]) : []
          return (
            <section key={name} className="sheet">
              <h2>{name}</h2>
              {rows.length === 0 ? (
                <p className="empty">행이 없습니다.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        {headers.map((h) => (
                          <th key={h} dangerouslySetInnerHTML={{ __html: escapeHtml(h) }} />
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i}>
                          {headers.map((h) => (
                            <td
                              key={h}
                              dangerouslySetInnerHTML={{
                                __html: escapeHtml(row[h] ?? ''),
                              }}
                            />
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )
        })}
      </main>

      {prompt ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-labelledby="auto-prompt-title" aria-modal="true">
            <h2 id="auto-prompt-title">지금 일정을 정리할까요?</h2>
            <p>
              설정한 시각({prompt.row.time})이 되었습니다. 쿨메신저에서 어제~오늘 쪽지를 받아 일정을
              정리합니다. 확인 없이 자동으로 시작하지 않습니다.
            </p>
            <div className="actions">
              <button type="button" className="btn-primary" onClick={() => closePrompt(true)}>
                지금 정리
              </button>
              <button type="button" className="btn-ghost" onClick={() => closePrompt(false)}>
                이번에는 건너뛰기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
