import React, { useState } from 'react'
import adminDataService from '../services/adminDataService'

const exportResources = ['bookings', 'users', 'tickets', 'matches', 'payments']
const importResources = ['bookings', 'users', 'tickets', 'matches', 'payments']

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(header => header.trim())
  return lines.slice(1).map(line => {
    const values = line.split(',').map(value => value.trim())
    return headers.reduce((record, header, index) => ({ ...record, [header]: values[index] }), {})
  })
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function ExportImport() {
  const [importResource, setImportResource] = useState('bookings')
  const [message, setMessage] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function exportData(resource, format) {
    setBusy(true)
    setError(null)
    setMessage('')
    try {
      const response = await adminDataService.export(resource, format)
      const extension = format === 'xlsx' ? 'xls' : format
      downloadBlob(response.data, `${resource}.${extension}`)
      setMessage(`Exported ${resource} as ${extension.toUpperCase()}.`)
    } catch (err) {
      setError(err?.response?.data?.error || 'Export failed')
    } finally {
      setBusy(false)
    }
  }

  async function importFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError(null)
    setMessage('')

    try {
      const text = await file.text()
      const records = file.name.toLowerCase().endsWith('.json') ? JSON.parse(text) : parseCsv(text)
      const result = await adminDataService.import(importResource, Array.isArray(records) ? records : records.records)
      setMessage(`Imported ${result.inserted || 0} ${importResource} record(s).`)
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Import failed')
    } finally {
      event.target.value = ''
      setBusy(false)
    }
  }

  return (
    <div className="container">
      <h2>Export and Import</h2>
      {message && <div className="card success">{message}</div>}
      {error && <div className="card danger">{error}</div>}

      <div className="card">
        <h3>Export Data</h3>
        <div className="export-grid">
          {exportResources.map(resource => (
            <div key={resource} className="export-row">
              <strong>{resource}</strong>
              <div>
                <button disabled={busy} onClick={() => exportData(resource, 'csv')}>CSV</button>
                <button disabled={busy} onClick={() => exportData(resource, 'json')}>JSON</button>
                <button disabled={busy} onClick={() => exportData(resource, 'xlsx')}>Excel</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Import Data</h3>
        <div className="filter-grid">
          <select value={importResource} onChange={e => setImportResource(e.target.value)}>
            {importResources.map(resource => <option key={resource} value={resource}>{resource}</option>)}
          </select>
          <input disabled={busy} type="file" accept=".json,.csv" onChange={importFile} />
        </div>
      </div>
    </div>
  )
}
