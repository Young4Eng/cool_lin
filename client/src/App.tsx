import { useState } from 'react'
import './App.css'

type SheetRow = Record<string, string>
type Sheets = Record<string, SheetRow[]>

type IngestResult = {
  ok?: boolean
  error?: string
  steps?: string[]
  file?: string
  path?: string
  sheets?: Sheets
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function App() {
  const [loading, setLoading] = useState<'ingest' | 'latest' | null>(null)
  const [result, setResult] = useState<IngestResult | null>(null)

  async function call(mode: 'ingest' | 'latest') {
    setLoading(mode)
    setResult(null)
    try {
      const url = mode === 'ingest' ? '/api/ingest' : '/api/open-latest'
      const res = await fetch(url, { method: 'POST' })
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

  const sheets = result?.sheets ?? {}
  const sheetNames = Object.keys(sheets)
  const error = result && !result.ok ? result.error : result?.error
  const busy = loading !== null

  return (
    <div className="page">
      <header className="header">
        <h1>쿨메신저 메시지 가져오기</h1>
        <p>한 번 누르면 메시지 관리함에서 어제~오늘 텍스트를 xls로 받습니다.</p>
      </header>

      <main className="card">
        <p className="note">
          쿨메신저만 켜 두면 됩니다. 메인 창이든 관리함이 이미 열려 있든 상관 없어요.
        </p>

        <div className="actions">
          <button
            type="button"
            className="btn-primary"
            disabled={busy}
            onClick={() => void call('ingest')}
          >
            {loading === 'ingest' ? '가져오는 중…' : '어제~오늘 메시지 가져오기'}
          </button>
          <button
            type="button"
            className="btn-ghost"
            disabled={busy}
            onClick={() => void call('latest')}
          >
            {loading === 'latest' ? '여는 중…' : '최근 받은 파일 열기'}
          </button>
        </div>

        {result?.steps && result.steps.length > 0 ? (
          <p className="steps">{result.steps.join(' → ')}</p>
        ) : null}

        {error ? <p className="error">{error}</p> : null}

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
                          <th
                            key={h}
                            dangerouslySetInnerHTML={{ __html: escapeHtml(h) }}
                          />
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
    </div>
  )
}

export default App
