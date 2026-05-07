import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { 
  ClipboardList, 
  Circle, 
  Hourglass, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  User, 
  Search, 
  Inbox, 
  RefreshCw,
  UserCircle,
  GraduationCap,
  Building2,
  Hotel,
  Utensils,
  ShieldAlert,
  MoreHorizontal
} from 'lucide-react'
import { grievanceService } from '../services/grievanceService'
import { useAuth } from '../context/AuthContext'
import type { Grievance } from '../types'
import { DatePicker } from '@/components/ui/date-picker'
import './StaffDashboardPage.css'

const STAFF_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
]

const UPDATE_STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'Pending' },
  { value: 'resolved', label: 'Addressed' },
  { value: 'rejected', label: 'Closed' },
]

export default function StaffDashboardPage() {
  const { user } = useAuth()
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState('')
  const [ordering, setOrdering] = useState('-created_at')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [viewTab, setViewTab] = useState<'my_tasks' | 'unassigned'>('my_tasks')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchGrievances = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, any> = { ordering }
      if (statusFilter) params.status = statusFilter
      if (searchQuery) params.search = searchQuery
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate
      params.view_filter = viewTab

      const data = await grievanceService.getGrievances(params)
      setGrievances(data)
    } catch (err) {
      console.error('Failed to fetch grievances', err)
    } finally {
      setLoading(false)
    }
  }, [ordering, statusFilter, searchQuery, viewTab, startDate, endDate])

  useEffect(() => {
    fetchGrievances()
  }, [fetchGrievances])

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleStatusUpdate = async (grievanceId: string, newStatus: string) => {
    setUpdatingId(grievanceId)
    setError(null)
    setSuccess(null)
    try {
      await grievanceService.updateGrievance(grievanceId, { status: newStatus })
      setSuccess('Status updated successfully')
      fetchGrievances()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to update status')
      console.error(err)
    } finally {
      setUpdatingId(null)
    }
  }

  const total = grievances.length
  const openCount = grievances.filter(g => g.status === 'open').length
  const inProgressCount = grievances.filter(g => g.status === 'in_progress').length
  const resolvedCount = grievances.filter(g => g.status === 'resolved').length
  const rejectedCount = grievances.filter(g => g.status === 'rejected').length

  const highPriorityCount = grievances.filter(g => g.priority === 'high' || g.priority === 'critical').length
  const addressedRate = total > 0 ? Math.round(((resolvedCount) / total) * 100) : 0

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: 'Open',
      in_progress: 'Pending',
      resolved: 'Addressed',
      rejected: 'Closed',
    }
    return labels[status] || status
  }

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      open: 'badge-open',
      in_progress: 'badge-in-progress',
      resolved: 'badge-resolved',
      rejected: 'badge-rejected',
    }
    return `badge ${classes[status] || ''}`
  }

  const getCategoryIcon = (name: string) => {
    const size = 22;
    if (!name) return <MoreHorizontal size={size} />;
    const n = name.toLowerCase();
    if (n.includes('academic')) return <GraduationCap size={size} />;
    if (n.includes('infrastructure')) return <Building2 size={size} />;
    if (n.includes('hostel')) return <Hotel size={size} />;
    if (n.includes('cafeteria')) return <Utensils size={size} />;
    if (n.includes('admin')) return <ShieldAlert size={size} />;
    return <MoreHorizontal size={size} />;
  }

  const getPriorityClass = (priority: string) => `priority-pill priority-${priority}`

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })

  const getDaysSince = (dateString: string) => {
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24))
    return days === 0 ? 'Today' : days === 1 ? '1 day ago' : `${days} days ago`
  }

  return (
    <div className="staff-dashboard-page">
      <div className="staff-header">
        <div>
          <h1>Staff Dashboard</h1>
          <p>Manage and resolve submitted grievances</p>
        </div>
        <div className="staff-user-info">
          <User className="staff-avatar-icon" size={24} />
          <div>
            <span className="staff-name">{user?.profile?.full_name || user?.email}</span>
            <span className="staff-role">Staff Member</span>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="staff-stats">
        <div className="staff-stat-card">
          <div className="staff-stat-icon total">
            <ClipboardList size={24} />
          </div>
          <div className="staff-stat-info">
            <h3>{total}</h3>
            <p>Total Issues</p>
          </div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-icon open">
            <Circle size={24} />
          </div>
          <div className="staff-stat-info">
            <h3>{openCount}</h3>
            <p>Open</p>
          </div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-icon pending">
            <Hourglass size={24} />
          </div>
          <div className="staff-stat-info">
            <h3>{inProgressCount}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-icon resolved">
            <CheckCircle2 size={24} />
          </div>
          <div className="staff-stat-info">
            <h3>{resolvedCount}</h3>
            <p>Addressed</p>
          </div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-icon closed">
            <XCircle size={24} />
          </div>
          <div className="staff-stat-info">
            <h3>{rejectedCount}</h3>
            <p>Closed</p>
          </div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-icon high-priority">
            <AlertCircle size={24} />
          </div>
          <div className="staff-stat-info">
            <h3>{highPriorityCount}</h3>
            <p>High Priority</p>
          </div>
        </div>
      </div>

      <div className="staff-progress-section">
        <div className="progress-card">
          <h3>Resolution Rate (Current View)</h3>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${addressedRate}%` }}></div>
          </div>
          <span className="progress-percentage">{addressedRate}%</span>
          <p>{resolvedCount} of {total} issues addressed</p>
        </div>
      </div>

      <div className="staff-tabs">
        <button 
          className={`staff-tab-btn ${viewTab === 'my_tasks' ? 'active' : ''}`}
          onClick={() => setViewTab('my_tasks')}
        >
          My Tasks
        </button>
        <button 
          className={`staff-tab-btn ${viewTab === 'unassigned' ? 'active' : ''}`}
          onClick={() => setViewTab('unassigned')}
        >
          Unassigned Issues
        </button>
      </div>

      <div className="staff-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search grievances..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          {STAFF_STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={ordering}
          onChange={e => setOrdering(e.target.value)}
        >
          <option value="-created_at">Newest First</option>
          <option value="created_at">Oldest First</option>
          <option value="-priority_weight">Priority (High → Low)</option>
          <option value="priority_weight">Priority (Low → High)</option>
        </select>
      </div>

      <div className="date-range-row">
        <div className="date-field">
          <label>From</label>
          <DatePicker 
            value={startDate} 
            onChange={setStartDate} 
            placeholder="Select start date" 
          />
        </div>
        <div className="date-field">
          <label>To</label>
          <DatePicker 
            value={endDate} 
            onChange={setEndDate} 
            placeholder="Select end date" 
          />
        </div>
        {(startDate || endDate || statusFilter || searchQuery) && (
          <button 
            className="clear-filters-btn" 
            onClick={() => {
              setStartDate('')
              setEndDate('')
              setStatusFilter('')
              setSearchInput('')
              setSearchQuery('')
            }}
          >
            <X size={16} />
            Clear Filters
          </button>
        )}
      </div>

      <div className="staff-grievance-list">
        {loading ? (
          <div className="empty-state">
            <Hourglass size={48} />
            <p>Loading grievances...</p>
          </div>
        ) : grievances.length === 0 ? (
          <div className="empty-state">
            <Inbox size={48} />
            <p>No grievances found</p>
          </div>
        ) : (
          grievances.map(g => (
            <div className="staff-grievance-card" key={g.id}>
              <div className="staff-grievance-main">
                <Link to={`/grievance/${g.id}`} className="staff-grievance-link">
                  <div className="staff-grievance-icon">
                    {getCategoryIcon(g.category_name)}
                  </div>
                  <div className="staff-grievance-content">
                    <h4>{g.title}</h4>
                    <p className="staff-grievance-desc">{g.description.substring(0, 120)}{g.description.length > 120 ? '…' : ''}</p>
                    <div className="staff-grievance-meta">
                      <span className="staff-grievance-id">GRV-{g.id.substring(0, 8).toUpperCase()}</span>
                      <span className="staff-grievance-category">{g.category_name || 'Uncategorized'}</span>
                      <span className="staff-grievance-time">{getDaysSince(g.created_at)}</span>
                    </div>
                  </div>
                </Link>
                <div className="staff-grievance-actions">
                  <span className={getPriorityClass(g.priority)}>{g.priority}</span>
                  <span className={getStatusBadgeClass(g.status)}>{getStatusLabel(g.status)}</span>
                  <select
                    className="status-update-select"
                    defaultValue=""
                    onChange={e => {
                      if (e.target.value) {
                        handleStatusUpdate(g.id, e.target.value)
                      }
                    }}
                    disabled={updatingId === g.id || g.assigned_staff !== user?.id}
                    title={g.assigned_staff !== user?.id ? "You must take up this issue to change its status" : "Update status"}
                  >
                    <option value="" disabled>Update Status</option>
                    {UPDATE_STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} disabled={g.status === opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {updatingId === g.id && (
                    <span className="updating-indicator">
                      <RefreshCw size={16} className="spinning" />
                    </span>
                  )}
                </div>
              </div>
              {g.assigned_staff_info && (
                <div className="staff-grievance-assignee">
                  <UserCircle size={16} />
                  <span>Assigned to: {g.assigned_staff_info.name}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
