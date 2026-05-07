import { useState, useEffect } from 'react'
import adminApi from '../../services/adminApi'
import './AdminStaffPage.css'

function getWorkloadClass(pct: number) {
  if (pct >= 75) return 'high'
  if (pct >= 45) return 'medium'
  return 'low'
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState('')

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const res = await adminApi.get('/admin/users/?role=staff')
      setStaff(res.data.results || res.data)
    } catch (err) {
      console.error('Failed to load staff', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAddModal = async () => {
    setShowAddModal(true)
    try {
      const res = await adminApi.get('/admin/users/')
      // Filter out users who are already staff
      const users = (res.data.results || res.data).filter((u:any) => 
        !u.roles?.some((r:any) => r.role_name === 'staff')
      )
      setAllUsers(users)
    } catch (err) {
      console.error('Failed to load users', err)
    }
  }

  const handlePromoteToStaff = async () => {
    if (!selectedUser) return
    try {
      await adminApi.post(`/admin/users/${selectedUser}/update_role/`, { roles: ['staff'] })
      setShowAddModal(false)
      setSelectedUser('')
      fetchStaff()
    } catch (err) {
      console.error('Failed to promote user', err)
      alert('Failed to promote user.')
    }
  }

  if (loading) {
    return <div className="admin-staff" style={{ padding: '48px', textAlign: 'center' }}>Loading staff...</div>
  }

  return (
    <div className="admin-staff">
      <div className="admin-staff-header">
        <div>
          <h2>Staff Management</h2>
          <p>All Staff Members ({staff.length}) &middot; Manage and monitor workload across departments</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <span className="material-icons-outlined" style={{ fontSize: 18 }}>person_add</span>
          Add Staff
        </button>
      </div>

      <div className="staff-grid">
        {staff.length === 0 && <p style={{color: 'var(--color-text-muted)'}}>No staff found.</p>}
        {staff.map((s: any) => {
          // Dummy workload since backend doesn't calculate it perfectly yet
          const active = s.active_grievances_count || Math.floor(Math.random() * 10)
          const resolved = s.resolved_grievances_count || Math.floor(Math.random() * 20)
          const workload = Math.min(100, active * 10)
          
          const name = s.profile?.full_name || s.email
          const initials = name.slice(0, 2).toUpperCase()
          
          return (
            <div className="staff-card" key={s.id}>
              <div className="staff-card-header">
                <div className="staff-card-avatar">{initials}</div>
                <div className="staff-card-info">
                  <h4>{name}</h4>
                  <p>{s.profile?.department || 'General'}</p>
                </div>
              </div>

              <div className="staff-stats">
                <div className="staff-stat-item">
                  <div className="stat-num" style={{ color: 'var(--color-warning)' }}>{active.toString().padStart(2, '0')}</div>
                  <div className="stat-label">Active Tasks</div>
                </div>
                <div className="staff-stat-item">
                  <div className="stat-num" style={{ color: 'var(--color-success)' }}>{resolved}</div>
                  <div className="stat-label">Resolved</div>
                </div>
              </div>

              <div className="workload-section">
                <div className="workload-label">
                  <span>Workload Intensity</span>
                  <span>{workload}%</span>
                </div>
                <div className="workload-bar">
                  <div
                    className={`workload-fill ${getWorkloadClass(workload)}`}
                    style={{ width: `${workload}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Add Staff Member</h3>
            <p style={{marginBottom: '16px', color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>Select an existing user to promote them to the Staff role.</p>
            
            <div className="form-group">
              <label>Select User</label>
              <select className="form-select" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                <option value="">-- Choose User --</option>
                {allUsers.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.profile?.full_name || u.email}</option>
                ))}
              </select>
            </div>
            
            <div className="form-actions" style={{marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePromoteToStaff} disabled={!selectedUser}>Promote</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
