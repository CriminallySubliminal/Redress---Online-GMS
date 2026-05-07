import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { grievanceService } from '../services/grievanceService'
import { interactionService } from '../services/interactionService'
import { useAuth } from '../context/AuthContext'
import type { Grievance } from '../types'
import './GrievanceDetailPage.css'

export default function GrievanceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [grievance, setGrievance] = useState<Grievance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [commentText, setCommentText] = useState('')
  const [isAnonymousComment, setIsAnonymousComment] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [takingUp, setTakingUp] = useState(false)

  useEffect(() => {
    const fetchGrievance = async () => {
      if (!id) return;
      try {
        const data = await grievanceService.getGrievance(id)
        setGrievance(data)
      } catch (err) {
        console.error('Failed to fetch grievance details', err)
        setError('Could not load grievance details.')
      } finally {
        setLoading(false)
      }
    }
    fetchGrievance()
  }, [id])

  if (loading) {
    return <div className="detail-page"><p>Loading grievance details...</p></div>
  }

  if (error || !grievance) {
    return <div className="detail-page"><p>{error || 'Grievance not found.'}</p></div>
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open'
      case 'in_progress': return 'In Progress'
      case 'resolved': return 'Resolved'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !id) return;
    
    setSubmitting(true)
    try {
      await interactionService.submitComment({
        grievance: id,
        content: commentText,
        is_anonymous: isAnonymousComment
      })
      setCommentText('')
      setIsAnonymousComment(false)
      // Refresh data
      const data = await grievanceService.getGrievance(id)
      setGrievance(data)
    } catch (err) {
      console.error('Failed to submit comment', err)
      alert('Could not submit comment. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }
  const isStaff = user?.roles?.some(r => r.role_name === 'staff' || r.role_name === 'admin')

  const handleTakeUp = async () => {
    if (!id) return;
    setTakingUp(true)
    try {
      const data = await grievanceService.takeUpGrievance(id)
      setGrievance(data)
    } catch (err) {
      console.error('Failed to take up grievance', err)
      alert('Could not take up grievance. Please try again.')
    } finally {
      setTakingUp(false)
    }
  }

  return (
    <div className="detail-page">
      <Link to={isStaff ? "/staff-dashboard" : "/"} className="detail-back">
        <span className="material-icons-outlined" style={{ fontSize: 18 }}>arrow_back</span>
        {isStaff ? 'Back to Dashboard' : 'Back to Home'}
      </Link>

      <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>{grievance.title}</h1>
          <div className="detail-header-meta">
            <span className={`badge badge-${grievance.status.replace('_', '-')}`}>
              {getStatusLabel(grievance.status)}
            </span>
            <span>GRV-{grievance.id.substring(0, 6)}</span>
            <span>•</span>
            <span>{grievance.category_name || 'Uncategorized'}</span>
            <span>•</span>
            <span style={{ textTransform: 'capitalize' }}>{grievance.priority} Priority</span>
            <span>•</span>
            <span>Filed on {formatDate(grievance.created_at)}</span>
          </div>
        </div>
        
        {isStaff && !grievance.assigned_staff && (
          <button 
            className="btn btn-primary" 
            onClick={handleTakeUp}
            disabled={takingUp}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span className="material-icons-outlined" style={{ fontSize: 20 }}>
              {takingUp ? 'sync' : 'handshake'}
            </span>
            {takingUp ? 'Processing...' : 'Take Up Issue'}
          </button>
        )}
      </div>

      <div className="detail-layout">
        {/* Main Content */}
        <div className="detail-main">
          {/* Description */}
          <div className="detail-section">
            <div className="detail-section-title">
              <span className="material-icons-outlined">description</span>
              Description
            </div>
            <p className="detail-description">
              {grievance.description}
            </p>
            {grievance.location && (
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                <span className="material-icons-outlined" style={{ fontSize: 20, color: 'var(--color-primary)' }}>location_on</span>
                <strong>Location:</strong> {grievance.location}
              </div>
            )}
          </div>

          {/* Attachments */}
          {grievance.attachments && grievance.attachments.length > 0 && (
            <div className="detail-section">
              <div className="detail-section-title">
                <span className="material-icons-outlined">attach_file</span>
                Attachments
              </div>
              <div className="attachment-list">
                {grievance.attachments.map(att => {
                  const isImage = att.file.match(/\.(jpeg|jpg|gif|png)$/) != null;
                  return (
                    <a href={att.file} target="_blank" rel="noopener noreferrer" className="attachment-item" key={att.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="attachment-icon">
                        <span className="material-icons-outlined" style={{ fontSize: 20 }}>
                          {isImage ? 'image' : 'insert_drive_file'}
                        </span>
                      </div>
                      <div className="attachment-info">
                        <h5>{att.file.split('/').pop()}</h5>
                      </div>
                      <span className="material-icons-outlined" style={{ fontSize: 18, color: 'var(--color-text-muted)' }}>open_in_new</span>
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* Comments List */}
          {grievance.comments && grievance.comments.length > 0 && (
            <div className="detail-section">
              <div className="detail-section-title">
                <span className="material-icons-outlined">forum</span>
                Discussion ({grievance.comments.length})
              </div>
              <div className="comments-list">
                {grievance.comments.map(comment => (
                  <div className="comment-item" key={comment.id}>
                    <div className="comment-header">
                      <span className="comment-author" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {comment.is_anonymous ? 'Anonymous' : (comment.created_by_info.name || comment.created_by_info.email)}
                        {comment.created_by_info.is_staff && !comment.is_anonymous && (
                          <span className="material-icons-outlined" style={{ fontSize: 14, color: 'var(--color-primary)' }} title="Staff Member">
                            verified
                          </span>
                        )}
                      </span>
                      <span className="comment-date">{formatDateTime(comment.created_at)}</span>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comment */}
          <div className="detail-section">
            <div className="detail-section-title">
              <span className="material-icons-outlined">add_comment</span>
              Add Follow-up Comment
            </div>
            <div className="comment-box">
              <textarea 
                placeholder="Type your follow-up comment..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  id="anonymous-comment"
                  checked={isAnonymousComment}
                  onChange={(e) => setIsAnonymousComment(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="anonymous-comment" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Post anonymously
                </label>
              </div>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={handleCommentSubmit}
                disabled={submitting || !commentText.trim()}
              >
                <span className="material-icons-outlined" style={{ fontSize: 16 }}>
                  {submitting ? 'sync' : 'send'}
                </span>
                {submitting ? 'Submitting...' : 'Submit Comment'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="detail-sidebar">
          {/* Poster Details (Staff Only) */}
          {isStaff && !grievance.is_anonymous && (
            <div className="sidebar-card">
              <h4>Poster Details</h4>
              <div className="assigned-staff" style={{ alignItems: 'flex-start' }}>
                <div className="staff-avatar" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-primary)' }}>
                  <span className="material-icons-outlined">account_circle</span>
                </div>
                <div className="staff-info">
                  <h5 style={{ marginBottom: 4 }}>{grievance.created_by_info.full_name || grievance.created_by_info.name}</h5>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="material-icons-outlined" style={{ fontSize: 14 }}>email</span>
                    {grievance.created_by_info.email}
                  </p>
                  {grievance.created_by_info.department && (
                    <p style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span className="material-icons-outlined" style={{ fontSize: 14 }}>domain</span>
                      {grievance.created_by_info.department}
                    </p>
                  )}
                  {grievance.created_by_info.institutional_id && (
                    <p style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span className="material-icons-outlined" style={{ fontSize: 14 }}>badge</span>
                      {grievance.created_by_info.institutional_id}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Assigned Staff */}
          <div className="sidebar-card">
            <h4>Assigned Staff</h4>
            {grievance.assigned_staff_info ? (
              <div className="assigned-staff">
                <div className="staff-avatar" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-primary)' }}>
                  <span className="material-icons-outlined">verified_user</span>
                </div>
                <div className="staff-info">
                  <h5 style={{ marginBottom: 4 }}>{grievance.assigned_staff_info.name}</h5>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <span className="material-icons-outlined" style={{ fontSize: 14 }}>domain</span>
                    {grievance.assigned_staff_info.department}
                  </p>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>This issue is currently awaiting assignment.</p>
            )}
          </div>

          {/* Lifecycle */}
          <div className="sidebar-card">
            <h4>Grievance Lifecycle</h4>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot-wrapper">
                  <div className="timeline-dot" />
                  {grievance.status_history && grievance.status_history.length > 0 && <div className="timeline-line" />}
                </div>
                <div className="timeline-content">
                  <p>Grievance successfully filed.</p>
                  <span className="timeline-date">{formatDateTime(grievance.created_at)}</span>
                </div>
              </div>
              
              {grievance.status_history && grievance.status_history.map((history, idx) => (
                <div className="timeline-item" key={history.id}>
                  <div className="timeline-dot-wrapper">
                    <div className="timeline-dot" />
                    {idx < grievance.status_history.length - 1 && <div className="timeline-line" />}
                  </div>
                  <div className="timeline-content">
                    <p>Status changed to <strong>{getStatusLabel(history.new_status)}</strong></p>
                    {history.note && <p style={{ fontSize: '0.8rem', fontStyle: 'italic', marginTop: 4 }}>"{history.note}"</p>}
                    <span className="timeline-date">{formatDateTime(history.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
