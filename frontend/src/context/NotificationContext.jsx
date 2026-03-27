import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuth } from './AuthContext'
import api from '../services/api'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const stompClientRef = useRef(null)

  // Fetch initial notifications
  useEffect(() => {
    if (!user) { setNotifications([]); setUnreadCount(0); return }
    api.get('/notifications?page=0&size=20')
      .then(r => { setNotifications(r.data.data?.content ?? []); })
      .catch(() => {})
    api.get('/notifications/unread-count')
      .then(r => setUnreadCount(r.data.data?.count ?? 0))
      .catch(() => {})
  }, [user])

  // WebSocket connection
  useEffect(() => {
    if (!user) return
    const token = localStorage.getItem('accessToken')
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        client.subscribe(`/user/${user.id}/queue/notifications`, msg => {
          const n = JSON.parse(msg.body)
          setNotifications(prev => [n, ...prev])
          setUnreadCount(c => c + 1)
        })
      },
      reconnectDelay: 5000,
    })
    client.activate()
    stompClientRef.current = client
    return () => { client.deactivate() }
  }, [user])

  const markAsRead = async (id) => {
    await api.put(`/notifications/${id}/read`)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnreadCount(c => Math.max(0, c - 1))
  }

  const markAllAsRead = async () => {
    await api.put('/notifications/read-all')
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
