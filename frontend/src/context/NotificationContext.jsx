import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuth } from './AuthContext'
import api from '../services/api'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const stompClientRef = useRef(null)

  const fetchNotifications = useCallback(async (pageNum = 0, append = false) => {
    if (!user) return
    setLoading(true)
    try {
      const r = await api.get(`/notifications?page=${pageNum}&size=20`)
      const content = r.data.data?.content ?? []
      const totalPages = r.data.data?.totalPages ?? 1
      setNotifications(prev => append ? [...prev, ...content] : content)
      setHasMore(pageNum < totalPages - 1)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [user])

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return
    try {
      const r = await api.get('/notifications/unread-count')
      setUnreadCount(r.data.data?.count ?? 0)
    } catch {}
  }, [user])

  useEffect(() => {
    if (!user) { setNotifications([]); setUnreadCount(0); setPage(0); return }
    fetchNotifications(0, false)
    fetchUnreadCount()
  }, [user, fetchNotifications, fetchUnreadCount])

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

  const loadMore = useCallback(() => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchNotifications(nextPage, true)
  }, [page, fetchNotifications])

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

  const deleteNotification = async (id) => {
    const wasUnread = notifications.find(n => n.id === id)?.isRead === false
    await api.delete(`/notifications/${id}`)
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (wasUnread) setUnreadCount(c => Math.max(0, c - 1))
  }

  const deleteAllRead = async () => {
    await api.delete('/notifications/read')
    setNotifications(prev => prev.filter(n => !n.isRead))
  }

  const refresh = () => {
    setPage(0)
    fetchNotifications(0, false)
    fetchUnreadCount()
  }

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading, hasMore,
      markAsRead, markAllAsRead, deleteNotification, deleteAllRead,
      loadMore, refresh
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
