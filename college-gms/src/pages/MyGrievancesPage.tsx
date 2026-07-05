import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Inbox, 
  X,
  GraduationCap,
  Building2,
  Hotel,
  Utensils,
  ShieldAlert,
  MoreHorizontal
} from 'lucide-react'
import { grievanceService } from '../services/grievanceService'
import type { Grievance } from '../types'
import { DatePicker } from '@/components/ui/date-picker'
import './MyGrievancesPage.css'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
]

const SORT_OPTIONS = [
  { value: '-priority_weight', label: 'Priority (High → Low)' },
  { value: 'priority_weight', label: 'Priority (Low → High)' },
  { value: '-created_at', label: 'Newest First' },
  { value: 'created_at', label: 'Oldest First' },
]

export default function MyGrievancesPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [loading, setLoading] = useState(true)

  // Filter & sort state
  const [statusFilter, setStatusFilter] = useState('')
  const [ordering, setOrdering] = useState('-priority_weight')
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchGrievances = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, any> = { ordering, view_filter: 'mine' }
      if (statusFilter) params.status = statusFilter
      if (searchQuery) params.search = searchQuery
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate

      const data = await grievanceService.getGrievances(params)
      setGrievances(data)
    } catch (error) {
      console.error('Failed to fetch grievances', error)
    } finally {
      setLoading(false)
    }
  }, [ordering, statusFilter, searchQuery, startDate, endDate])

  useEffect(() => {
    fetchGrievances()
  }, [fetchGrievances])

  // Debounced search
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Calculate stats from the full dataset (unfiltered fetch)
  const total = grievances.length
  const pending = grievances.filter(g => g.status === 'open' || g.status === 'in_progress').length
  const resolved = grievances.filter(g => g.status === 'resolved').length
  const rejected = grievances.filter(g => g.status === 'rejected').length

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open'
      case 'in_progress': return 'In Progress'
      case 'resolved': return 'Resolved'
      case 'rejected': return 'Rejected'
      default: return status
    }
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

  const getPriorityClass = (priority: string) => {
    return `priority-pill priority-${priority}`
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })

  const clearFilters = () => {
    setStatusFilter('')
    setOrdering('-priority_weight')
    setSearchInput('')
    setSearchQuery('')
    setStartDate('')
    setEndDate('')
  }

  const hasActiveFilters = statusFilter || searchQuery || startDate || endDate || ordering !== '-priority_weight'

  return (
    <div className="grievances-page">
      <h1>My Grievances</h1>
      <p>Track and manage your submitted issues and academic concerns</p>

      {/* Stats */}
      <div className="grievance-stats">
        <div className="gstat-card">
          <div className="gstat-icon total">
            <ClipboardList size={24} />
          </div>
          <div className="gstat-info">
            <h3>{total}</h3>
            <p>Total</p>
          </div>
        </div>
        <div className="gstat-card">
          <div className="gstat-icon pending">
            <Clock size={24} />
          </div>
          <div className="gstat-info">
            <h3>{pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="gstat-card">
          <div className="gstat-icon resolved">
            <CheckCircle2 size={24} />
          </div>
          <div className="gstat-info">
            <h3>{resolved}</h3>
            <p>Resolved</p>
          </div>
        </div>
        <div className="gstat-card">
          <div className="gstat-icon avg">
            <XCircle size={24} />
          </div>
          <div className="gstat-info">
            <h3>{rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {/* Toolbar: Search + Sort + Filters */}
      <div className="grievances-toolbar">
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
          value={ordering}
          onChange={e => setOrdering(e.target.value)}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Date Range Row */}
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
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={clearFilters}>
            <X size={16} />
            Clear Filters
          </button>
        )}
      </div>

      {/* List */}
      <div className="grievance-list">
        {loading ? (
          <p className="empty-state">Loading your grievances...</p>
        ) : grievances.length === 0 ? (
          <div className="empty-state">
            <Inbox size={48} color="var(--color-text-muted)" />
            <p>No grievances found.</p>
            {hasActiveFilters && <p style={{ fontSize: '0.8rem' }}>Try adjusting your filters.</p>}
          </div>
        ) : (
          grievances.map(g => (
            <Link to={`/grievance/${g.id}`} className="grievance-item" key={g.id}>
              <div className="grievance-item-icon">
                {getCategoryIcon(g.category_name)}
              </div>
              <div className="grievance-item-content">
                <h4>{g.title}</h4>
                <p className="grievance-item-desc">{g.description.substring(0, 100)}{g.description.length > 100 ? '…' : ''}</p>
                <div className="grievance-item-meta">
                  <span>{g.category_name || 'Uncategorized'}</span>
                  <span>•</span>
                  <span>GRV-{g.id.substring(0, 6)}</span>
                </div>
              </div>
              <div className="grievance-item-right">
                <span className={`badge badge-${g.status.replace('_', '-')}`}>{getStatusLabel(g.status)}</span>
                <span className={getPriorityClass(g.priority)}>{g.priority}</span>
                <span className="grievance-item-date">{formatDate(g.created_at)}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
