import React, { useEffect, useState } from 'react'
import notificationService from '../services/notificationService'
import socketService from '../services/socketService'

const getData = (response) => response?.data?.data || response?.data || []

export default function Notifications(){
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [markingId, setMarkingId] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    notificationService.list()
      .then(res => setNotifications(getData(res)))
      .catch(err => setError(err?.response?.data?.error || 'Unable to load notifications'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    socketService.connect()
    const handleNewNotification = (notification) => {
      setNotifications(current => {
        const id = notification.id || notification._id
        if(current.some(item => (item.id || item._id) === id)) return current
        return [notification, ...current]
      })
    }

    socketService.on('newNotification', handleNewNotification)
    return () => socketService.off('newNotification', handleNewNotification)
  }, [])

  const markRead = async (id) => {
    setMarkingId(id)
    try {
      await notificationService.markAsRead(id)
      setNotifications((current) => current.map(item => item.id === id ? { ...item, is_read: true, status: 'read' } : item))
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to mark as read')
    } finally {
      setMarkingId(null)
    }
  }

  return (
    <div className="container">
      <h2>Notifications</h2>
      {loading && <div>Loading notifications...</div>}
      {error && <div style={{ color: 'salmon', marginBottom: 16 }}>{error}</div>}
      {notifications.some(item => !item.is_read && item.status !== 'read') && (
        <button
          onClick={async () => {
            await notificationService.markAllAsRead()
            setNotifications(current => current.map(item => ({ ...item, is_read: true, status: 'read' })))
          }}
          style={{ marginBottom: 16 }}
        >
          Mark all as read
        </button>
      )}
      {!loading && notifications.length === 0 && <div className="card">No notifications available.</div>}
      <div style={{ display: 'grid', gap: 16 }}>
        {notifications.map(notification => (
          <div key={notification.id || notification._id} className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: '0 0 8px' }}>{notification.title || 'Notification'}</h3>
                <div style={{ color: '#94a3b8', marginBottom: 6 }}>{notification.type || 'general'}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ padding: '4px 10px', borderRadius: 999, background: notification.is_read || notification.status === 'read' ? '#334155' : '#0ea5a4', color: '#fff', fontSize: 12 }}>
                  {notification.is_read || notification.status === 'read' ? 'Read' : 'New'}
                </span>
                <span style={{ color: '#94a3b8', fontSize: 12 }}>
                  {notification.created_at ? new Date(notification.created_at).toLocaleString() : 'Unknown date'}
                </span>
              </div>
            </div>
            <p style={{ margin: '12px 0 0', lineHeight: 1.6, color: '#e2e8f0' }}>{notification.message || 'No details provided.'}</p>
            {!(notification.is_read || notification.status === 'read') && (
              <button
                onClick={() => markRead(notification.id)}
                disabled={markingId === notification.id}
                style={{ marginTop: 14, padding: '10px 16px', borderRadius: 8, border: 'none', background: '#06b6d4', color: '#001', cursor: 'pointer' }}
              >
                {markingId === notification.id ? 'Marking...' : 'Mark as read'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
