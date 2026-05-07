import { useState, useEffect } from 'react'
import adminApi from '../../services/adminApi'
import './AdminDashboardPage.css'

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.get('/admin/analytics/')
      .then(res => {
        setData(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load admin analytics', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="admin-dashboard" style={{ padding: '48px', textAlign: 'center' }}>Loading analytics...</div>
  }

  if (!data) {
    return <div className="admin-dashboard" style={{ padding: '48px', textAlign: 'center' }}>Failed to load data.</div>
  }

  // Fallback for trends (we didn't implement time series in backend yet, using mock for visual)
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
  const trendHeights = [55, 70, 60, 80, 65, 90, 75, 95, 85]

  return (
    <div className="admin-dashboard">
      <h2>Dashboard</h2>

      {/* Stats */}
      <div className="admin-stats">
        {data.stats.map((s: any) => (
          <div className="admin-stat-card" key={s.label}>
            <div className={`stat-icon ${s.cls}`}>
              <span className="material-icons-outlined" style={{ fontSize: 20 }}>{s.icon}</span>
            </div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="admin-charts">
        {/* Category bar chart */}
        <div className="chart-card">
          <h4>Grievances by Category</h4>
          <div className="bar-chart">
            {data.categoryData.length === 0 && <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No category data</p>}
            {data.categoryData.map((c: any) => (
              <div className="bar-row" key={c.label}>
                <span className="bar-label">{c.label}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${c.pct}%`, background: c.color }}
                  />
                </div>
                <span className="bar-value">{c.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status donut */}
        <div className="chart-card">
          <h4>Status Distribution</h4>
          <div className="donut-chart">
            {data.statusDistribution.length > 0 && (
              <>
                <div
                  className="donut-visual"
                  style={{
                    background: `conic-gradient(
                      ${data.statusDistribution[0].color} 0% ${data.statusDistribution[0].pct}%,
                      ${data.statusDistribution[1].color} ${data.statusDistribution[0].pct}% ${data.statusDistribution[0].pct + data.statusDistribution[1].pct}%,
                      ${data.statusDistribution[2].color} ${data.statusDistribution[0].pct + data.statusDistribution[1].pct}% ${data.statusDistribution[0].pct + data.statusDistribution[1].pct + data.statusDistribution[2].pct}%,
                      ${data.statusDistribution[3].color} ${100 - data.statusDistribution[3].pct}% 100%
                    )`,
                  }}
                >
                  <div className="donut-center">{data.stats.find((s:any) => s.label === 'Total')?.value || 0}</div>
                </div>
                <div className="donut-legend">
                  {data.statusDistribution.map((s: any) => (
                    <div className="legend-item" key={s.label}>
                      <span className="legend-dot" style={{ background: s.color }} />
                      {s.label} ({s.pct}%)
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Trends */}
      <div className="trends-card">
        <h4>Submission Trends</h4>
        <p>Monthly grievance volume over time (Sample)</p>
        <div className="trend-bars">
          {trendHeights.map((h, i) => (
            <div key={i} className="trend-bar" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="trend-labels">
          {months.map(m => <span key={m}>{m}</span>)}
        </div>
      </div>

      {/* Activity */}
      <div className="activity-card">
        <h4>Recent Activity</h4>
        <div className="activity-list">
          {data.activities.length === 0 && <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No recent activity</p>}
          {data.activities.map((a: any, i: number) => (
            <div className="activity-item" key={i}>
              <div className="activity-dot" />
              <div className="activity-content">
                <p>{a.text}</p>
                <span>{a.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
