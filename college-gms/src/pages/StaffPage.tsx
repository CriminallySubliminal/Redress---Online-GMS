import { useState, useEffect } from 'react'
import { Users, Mail, Building2, Briefcase, Search, Loader2, UserX } from 'lucide-react'
import api from '../services/api'
import type { User } from '../types'
import './StaffPage.css'

export default function StaffPage() {
  const [staff, setStaff] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await api.get('/users/?role=staff')
        const staffData = response.data.results || response.data
        setStaff(Array.isArray(staffData) ? staffData : [])
      } catch (error) {
        console.error('Failed to fetch staff members', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStaff()
  }, [])

  const filteredStaff = staff.filter((member) => {
    const query = searchQuery.toLowerCase()
    return (
      member.username.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      (member.profile?.department || '').toLowerCase().includes(query)
    )
  })

  const getInitials = (name: string) => {
    const parts = name.split(/[\s._-]+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const avatarColors = [
    'linear-gradient(135deg, #f59209 0%, #fbbf24 100%)',
    'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
    'linear-gradient(135deg, #d97706 0%, #fde68a 100%)',
    'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
    'linear-gradient(135deg, #92400e 0%, #fbbf24 100%)',
    'linear-gradient(135deg, #c2410c 0%, #fb923c 100%)',
  ]

  const getAvatarColor = (id: string) => {
    let hash = 0
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
    return avatarColors[Math.abs(hash) % avatarColors.length]
  }

  return (
    <div className="sp-page container">
      {/* Header */}
      <div className="sp-header">
        <div className="sp-header-text">
          <div className="sp-header-badge">
            <Users size={14} />
            <span>Staff Directory</span>
          </div>
          <h1 className="sp-title">Available Staff</h1>
          <p className="sp-subtitle">
            Browse our administrative and academic staff members ready to assist with your grievances.
          </p>
        </div>

        <div className="sp-search-bar">
          <Search size={18} className="sp-search-icon" />
          <input
            type="text"
            className="sp-search-input"
            placeholder="Search by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="sp-stats-row">
          <div className="sp-stat">
            <span className="sp-stat-value">{staff.length}</span>
            <span className="sp-stat-label">Total Staff</span>
          </div>
          <div className="sp-stat-sep" />
          <div className="sp-stat">
            <span className="sp-stat-value">{staff.filter(s => s.staff_profile?.is_assigned).length}</span>
            <span className="sp-stat-label">Currently Assigned</span>
          </div>
          <div className="sp-stat-sep" />
          <div className="sp-stat">
            <span className="sp-stat-value">{staff.filter(s => !s.staff_profile?.is_assigned).length}</span>
            <span className="sp-stat-label">Available</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="sp-loading">
          <Loader2 size={32} className="sp-spinner" />
          <p>Loading staff profiles...</p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="sp-empty">
          <UserX size={48} />
          <h3>No staff members found</h3>
          <p>{searchQuery ? 'Try adjusting your search terms.' : 'No staff have registered yet.'}</p>
        </div>
      ) : (
        <div className="sp-grid">
          {filteredStaff.map((member) => (
            <div className="sp-card" key={member.id}>
              <div className="sp-card-top">
                <div
                  className="sp-avatar"
                  style={{ background: getAvatarColor(member.id) }}
                >
                  {getInitials(member.username)}
                </div>
                <div className="sp-card-identity">
                  <h3 className="sp-card-name">{member.profile?.full_name || member.username}</h3>
                  <span className="sp-card-badge">
                    <Briefcase size={12} />
                    Staff Member
                  </span>
                </div>
              </div>

              <div className="sp-card-details">
                {member.profile?.department && (
                  <div className="sp-detail-row">
                    <Building2 size={15} />
                    <span>{member.profile.department}</span>
                  </div>
                )}
                <div className="sp-detail-row">
                  <Mail size={15} />
                  <span>{member.email}</span>
                </div>
              </div>

              <div className="sp-card-footer">
                <span className={`sp-availability ${member.staff_profile?.is_assigned ? 'assigned' : 'available'}`}>
                  <span className="sp-availability-dot" />
                  {member.staff_profile?.is_assigned ? 'Assigned' : 'Available'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
