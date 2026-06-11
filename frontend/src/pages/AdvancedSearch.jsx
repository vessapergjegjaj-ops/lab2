import React, { useEffect, useMemo, useState } from 'react'
import adminDataService from '../services/adminDataService'

const resources = ['matches', 'teams', 'bookings', 'users', 'tickets', 'payments', 'stadiums']

function formatValue(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T|\d{4}-\d{2}-\d{2} /.test(value)) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date.toLocaleString()
  }
  return String(value)
}

export default function AdvancedSearch() {
  const [resource, setResource] = useState('matches')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const columns = useMemo(() => {
    const keys = new Set()
    rows.slice(0, 10).forEach(row => Object.keys(row).forEach(key => keys.add(key)))
    return Array.from(keys).slice(0, 10)
  }, [rows])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)

    adminDataService.search(resource, { search, status, dateFrom, dateTo })
      .then(data => {
        if (alive) setRows(Array.isArray(data) ? data : [])
      })
      .catch(err => {
        if (alive) {
          setRows([])
          setError(err?.response?.data?.error || 'Unable to load search results')
        }
      })
      .finally(() => alive && setLoading(false))

    return () => {
      alive = false
    }
  }, [resource, search, status, dateFrom, dateTo])

  return (
    <div className="container">
      <h2>Advanced Search</h2>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="tabs">
          {resources.map(item => (
            <button
              key={item}
              className={resource === item ? 'active' : ''}
              onClick={() => setResource(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="filter-grid">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search text" />
          <input value={status} onChange={e => setStatus(e.target.value)} placeholder="Status" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          <button type="button" onClick={() => { setSearch(''); setStatus(''); setDateFrom(''); setDateTo('') }}>
            Reset
          </button>
        </div>
      </div>

      {loading && <div>Loading results...</div>}
      {error && <div style={{ color: 'salmon', marginBottom: 16 }}>{error}</div>}
      {!loading && !error && rows.length === 0 && <div className="card">No results found.</div>}

      {rows.length > 0 && (
        <div className="card table-card">
          <div style={{ marginBottom: 12 }}>{rows.length} result(s)</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {columns.map(column => <th key={column}>{column}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id || index}>
                    {columns.map(column => <td key={column}>{formatValue(row[column])}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
