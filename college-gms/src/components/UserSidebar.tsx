
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UserSidebar.css';

export default function UserSidebar() {
  const { user } = useAuth();
  const isStaff = user?.roles?.some(r => r.role_name === 'staff' || r.role_name === 'admin');

  return (
    <aside className="user-sidebar">
      <div className="sidebar-header">
        <h2>{isStaff ? 'Staff Portal' : 'Student Portal'}</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {isStaff ? (
            <>
              <li>
                <NavLink to="/staff-dashboard">
                  <span className="material-icons-outlined">dashboard</span>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/report-issue">
                  <span className="material-icons-outlined">bug_report</span>
                  Report A Problem
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/dashboard" end>
                  <span className="material-icons-outlined">dashboard</span>
                  My Grievances
                </NavLink>
              </li>
              <li>
                <NavLink to="/submit">
                  <span className="material-icons-outlined">add_circle_outline</span>
                  Post Grievance
                </NavLink>
              </li>
              <li>
                <NavLink to="/staff">
                  <span className="material-icons-outlined">people_alt</span>
                  Available Staff
                </NavLink>
              </li>
              <li>
                <NavLink to="/report-issue">
                  <span className="material-icons-outlined">bug_report</span>
                  Report Problem
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
}
