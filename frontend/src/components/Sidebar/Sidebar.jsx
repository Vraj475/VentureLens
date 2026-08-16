import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import './Sidebar.css';

function getScoreClass(score) {
  if (score == null) return '';
  if (score > 70) return 'high';
  if (score >= 50) return 'mid';
  return 'low';
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

function Sidebar({ onNewAnalysis }) {
  const { currentUser, userProfile } = useAuth();
  const { sessions, activeSessionId, startNewSession, loadSession, toggleProfile } = useChat();

  const displayEmail = currentUser?.email || userProfile?.email || 'User';
  const initial = (currentUser?.email?.[0] || userProfile?.email?.[0] || 'U').toUpperCase();

  return (
    <aside className="sidebar">
      <button
        type="button"
        className="sidebar-new-btn"
        onClick={onNewAnalysis || startNewSession}
      >
        + New Analysis
      </button>

      <div className="sidebar-sessions">
        <div className="sidebar-section-label">Recent Sessions</div>
        {sessions.map((session) => (
          <div
            key={session.sessionId}
            className={`sidebar-session-item ${
              activeSessionId === session.sessionId ? 'sidebar-session-item--active' : ''
            }`}
            onClick={() => loadSession(session.sessionId)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') loadSession(session.sessionId);
            }}
            role="button"
            tabIndex={0}
          >
            <div className="sidebar-session-title">{session.sessionTitle}</div>
            <div className="sidebar-session-meta">
              <span>{formatDate(session.createdAt)}</span>
              {session.feasibilityScore != null && (
                <span className={`sidebar-score-badge sidebar-score-badge--${getScoreClass(session.feasibilityScore)}`}>
                  {session.feasibilityScore}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div
        className="sidebar-bottom"
        onClick={toggleProfile}
        onKeyDown={(event) => {
          if (event.key === 'Enter') toggleProfile();
        }}
        role="button"
        tabIndex={0}
      >
        <div className="sidebar-avatar">
          {userProfile?.photoURL ? (
            <img src={userProfile.photoURL} alt={displayEmail} />
          ) : (
            initial
          )}
        </div>
        <div>
          <div className="sidebar-user-name">{displayEmail}</div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
