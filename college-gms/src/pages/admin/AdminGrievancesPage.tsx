import { useState, useEffect } from 'react'
import adminApi from '../../services/adminApi'
import './AdminGrievancesPage.css'

export default function AdminGrievancesPage() {
  const [grievances, setGrievances] = useState<any[]>([])
  const [staffList, setStaffList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [gRes, sRes] = await Promise.all([
        adminApi.get('/admin/grievances/'),
        adminApi.get('/admin/users/?role=staff')
      ])
      setGrievances(gRes.data.results || gRes.data)
      setStaffList(sRes.data.results || sRes.data)
    } catch (err) {
      console.error('Failed to load admin grievances', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignStaff = async (grievanceId: string, staffId: string) => {
    try {
      await adminApi.post(`/admin/grievances/${grievanceId}/assign_staff/`, { staff_id: staffId })
      fetchData() // refresh to get new status and history
    } catch (err) {
      console.error('Failed to assign staff', err)
      alert('Failed to assign staff.')
    }
  }

  if (loading) {
    return <div className="admin-grievances" style={{ padding: '48px', textAlign: 'center' }}>Loading grievances...</div>
  }

  const filteredGrievances = grievances.filter((g: any) => {
    if (statusFilter !== 'All Status' && g.status.replace('_', ' ').toLowerCase() !== statusFilter.toLowerCase()) return false
    if (categoryFilter !== 'All Categories' && g.category?.name !== categoryFilter) return false
    if (search && !g.title.toLowerCase().includes(search.toLowerCase()) && !g.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="admin-grievances">
      <h2>Grievance Management</h2>
      <p>All Grievances ({grievances.length}) &middot; Showing {filteredGrievances.length} grievances</p>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="search-box">
          <span className="material-icons-outlined">search</span>
          <input 
            placeholder="Search by title or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" style={{ width: 'auto', minWidth: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>All Status</option>
          <option value="open">Pending (Open)</option>
          <option value="in progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select className="form-select" style={{ width: 'auto', minWidth: 140 }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option>All Categories</option>
          {Array.from(new Set(grievances.map((g:any) => g.category?.name).filter(Boolean))).map((cat:any) => (
             <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="grievance-table-wrapper">
        <table className="grievance-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrievances.length === 0 && (
              <tr><td colSpan={8} style={{textAlign: 'center', padding: '32px'}}>No grievances found.</td></tr>
            )}
            {filteredGrievances.map((g: any) => (
              <tr key={g.id}>
                <td className="table-id" title={g.id}>{g.id.slice(0, 8)}...</td>
                <td className="table-title">{g.title}</td>
                <td>{g.category?.name || 'General'}</td>
                <td>
                  <span className={`priority-dot ${g.priority}`} />
                  {g.priority.charAt(0).toUpperCase() + g.priority.slice(1)}
                </td>
                <td>
                  <span className={`badge badge-${g.status === 'in_progress' ? 'progress' : g.status === 'open' ? 'pending' : g.status}`}>
                    {g.status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <select 
                    className="form-select" 
                    style={{ padding: '4px 8px', fontSize: '0.8rem', width: '130px' }}
                    value={g.assigned_staff?.id || ''}
                    onChange={(e) => handleAssignStaff(g.id, e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {staffList.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.profile?.full_name || s.email}</option>
                    ))}
                  </select>
                </td>
                <td>{new Date(g.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="table-actions">
                    <button title="View">
                      <span className="material-icons-outlined" style={{ fontSize: 16 }}>visibility</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
