import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  GraduationCap, 
  Building2, 
  Hotel, 
  Utensils, 
  ShieldAlert, 
  MoreHorizontal 
} from 'lucide-react'
import { grievanceService } from '../services/grievanceService'
import type { Grievance } from '../types'
import './MyGrievancesPage.css' // We can reuse the same styles

export default function FeedPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPublicGrievances = async () => {
      try {
        // Fetch only public grievances
        const data = await grievanceService.getGrievances({ is_public: true })
        setGrievances(data)
      } catch (error) {
        console.error('Failed to fetch public feed', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPublicGrievances()
  }, [])

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
    const size = 24;
    if (!name) return <MoreHorizontal size={size} />;
    const n = name.toLowerCase();
    if (n.includes('academic')) return <GraduationCap size={size} />;
    if (n.includes('infrastructure')) return <Building2 size={size} />;
    if (n.includes('hostel')) return <Hotel size={size} />;
    if (n.includes('cafeteria')) return <Utensils size={size} />;
    if (n.includes('admin')) return <ShieldAlert size={size} />;
    return <MoreHorizontal size={size} />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="grievances-page">
        <h1>Campus Public Feed</h1>
        <p>Stay informed about ongoing issues and resolutions within the campus community.</p>

        <div className="grievance-list" style={{ marginTop: '2rem' }}>
          {loading ? (
            <p>Loading feed...</p>
          ) : grievances.length === 0 ? (
            <p>No public grievances at the moment.</p>
          ) : (
            grievances.map(g => (
              <Link to={`/grievance/${g.id}`} className="grievance-item" key={g.id}>
                <div className="grievance-item-icon">
                  {getCategoryIcon(g.category_name)}
                </div>
                <div className="grievance-item-content">
                  <h4>{g.title}</h4>
                  <p className="grievance-item-desc">
                    {g.description.substring(0, 150)}{g.description.length > 150 ? '...' : ''}
                  </p>
                  <div className="grievance-item-meta">
                    <span>{g.category_name || 'Uncategorized'}</span>
                    <span>•</span>
                    <span>Posted by: {g.created_by_info.name || g.created_by_info.email || 'Anonymous'}</span>
                  </div>
                </div>
                <div className="grievance-item-right">
                  <span className={`badge badge-${g.status.replace('_', '-')}`}>{getStatusLabel(g.status)}</span>
                  <span className="grievance-item-date">{formatDate(g.created_at)}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
