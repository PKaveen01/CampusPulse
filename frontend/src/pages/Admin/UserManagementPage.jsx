import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Users, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import { userManagementService } from '../../services/userManagementService'
import UserStatsBar from './components/UserStatsBar'
import UserFilters from './components/UserFilters'
import UserTable from './components/UserTable'
import UserDetailModal from './components/UserDetailModal'
import ConfirmDialog from './components/ConfirmDialog'

const PAGE_SIZE = 10

export default function UserManagementPage() {
  const [users, setUsers]               = useState([])
  const [stats, setStats]               = useState(null)
  const [loading, setLoading]           = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError]               = useState(null)
  const [toast, setToast]               = useState(null)
  const [page, setPage]                 = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [confirm, setConfirm]           = useState(null) // { userId, userName, isActive }
  const [filters, setFilters]           = useState({ query: '', role: '', isActive: null })
  const toastTimer = useRef(null)

  const showToast = (msg, type = 'success') => {
    clearTimeout(toastTimer.current)
    setToast({ msg, type })
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }

  const loadStats = async () => {
    setStatsLoading(true)
    try {
      const s = await userManagementService.getStats()
      setStats(s)
    } catch { /* non-critical */ }
    finally { setStatsLoading(false) }
  }

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await userManagementService.searchUsers(filters)
      setUsers(data)
      setPage(1)
    } catch (e) {
      setError(e.message ?? 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { loadUsers() }, [loadUsers])
  useEffect(() => { loadStats() }, [])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE))
  const paged = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleChangeRole = async (userId, role) => {
    const prev = users.find(u => u.id === userId)
    if (!prev || prev.role === role) return
    try {
      const updated = await userManagementService.updateRole(userId, role)
      setUsers(us => us.map(u => u.id === userId ? { ...u, ...updated } : u))
      if (selectedUser?.id === userId) setSelectedUser(s => ({ ...s, ...updated }))
      showToast(`${prev.name}'s role updated to ${role}`)
      loadStats()
    } catch {
      showToast('Failed to update role', 'error')
    }
  }

  const requestToggleStatus = (userId) => {
    const u = users.find(x => x.id === userId)
    if (!u) return
    setConfirm({ userId, userName: u.name, isActive: u.isActive })
  }

  const confirmToggle = async () => {
    const { userId, userName, isActive } = confirm
    setConfirm(null)
    try {
      const updated = await userManagementService.toggleStatus(userId)
      setUsers(us => us.map(u => u.id === userId ? { ...u, ...updated } : u))
      if (selectedUser?.id === userId) setSelectedUser(s => ({ ...s, ...updated }))
      showToast(`${userName} has been ${isActive ? 'deactivated' : 'activated'}`)
      loadStats()
    } catch {
      showToast('Failed to update status', 'error')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* Page header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 28, flexWrap: 'wrap', gap: 12,
          animation: 'fadeIn 0.4s ease',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(124,99,247,0.15)', border: '1px solid rgba(124,99,247,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Users size={18} style={{ color: 'var(--accent-2)' }} />
              </div>
              <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 700 }}>
                User Management
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              Manage roles, activate or deactivate accounts, and review user activity.
            </p>
          </div>

          <button
            onClick={() => { loadUsers(); loadStats() }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 16px', borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-focus)' }}
            onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <UserStatsBar stats={stats} loading={statsLoading} />

        {/* Filters */}
        <UserFilters filters={filters} onChange={f => setFilters(f)} />

        {/* Table card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', overflow: 'hidden',
          animation: 'fadeIn 0.45s ease 0.1s both',
        }}>
          {/* Table header bar */}
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {loading ? 'Loading…' : `${users.length} user${users.length !== 1 ? 's' : ''} found`}
            </span>
            {!loading && users.length > 0 && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Click a name to view profile · click role badge to change it
              </span>
            )}
          </div>

          {error ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--danger)', fontSize: 13 }}>
              {error}
            </div>
          ) : (
            <UserTable
              users={paged}
              onChangeRole={handleChangeRole}
              onToggleStatus={requestToggleStatus}
              onViewDetail={u => setSelectedUser(u)}
              loading={loading}
            />
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div style={{
              padding: '12px 20px', borderTop: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 8,
            }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Page {page} of {totalPages} · {users.length} total
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                    background: 'transparent', border: '1px solid var(--border)',
                    color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                    cursor: page === 1 ? 'default' : 'pointer',
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    style={{
                      padding: '5px 10px', borderRadius: 'var(--radius-sm)', minWidth: 32,
                      background: n === page ? 'var(--accent-2)' : 'transparent',
                      border: `1px solid ${n === page ? 'var(--accent-2)' : 'var(--border)'}`,
                      color: n === page ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer', fontSize: 12, fontWeight: n === page ? 700 : 400,
                    }}
                  >{n}</button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                    background: 'transparent', border: '1px solid var(--border)',
                    color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                    cursor: page === totalPages ? 'default' : 'pointer',
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* User detail modal */}
      <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />

      {/* Confirm toggle dialog */}
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.isActive ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${confirm?.isActive ? 'deactivate' : 'activate'} ${confirm?.userName}? ${confirm?.isActive ? 'They will no longer be able to log in.' : 'They will regain access to the system.'}`}
        confirmLabel={confirm?.isActive ? 'Deactivate' : 'Activate'}
        confirmColor={confirm?.isActive ? 'var(--danger)' : 'var(--success)'}
        onConfirm={confirmToggle}
        onCancel={() => setConfirm(null)}
      />

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 400,
          padding: '12px 20px', borderRadius: 'var(--radius)',
          background: toast.type === 'error' ? 'rgba(248,113,113,0.15)' : 'rgba(52,211,153,0.15)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(248,113,113,0.4)' : 'rgba(52,211,153,0.4)'}`,
          color: toast.type === 'error' ? 'var(--danger)' : 'var(--success)',
          fontSize: 13, fontWeight: 600,
          boxShadow: 'var(--shadow)',
          animation: 'fadeIn 0.3s ease',
          backdropFilter: 'blur(8px)',
          maxWidth: 360,
        }}>
          {toast.type === 'error' ? '✕ ' : '✓ '}{toast.msg}
        </div>
      )}
    </div>
  )
}
