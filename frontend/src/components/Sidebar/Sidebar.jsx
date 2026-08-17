import { useState } from 'react';
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
  const { sessions, activeSessionId, startNewSession, switchToSession, deleteSession, toggleProfile } = useChat();
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const displayEmail = currentUser?.email || userProfile?.email || 'User';
  const initial = (currentUser?.email?.[0] || userProfile?.email?.[0] || 'U').toUpperCase();

  function handleDeleteClick(e, sessionId) {
    e.stopPropagation();
    e.preventDefault();
    if (confirmDeleteId === sessionId) {
      deleteSession(sessionId);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(sessionId);
      setTimeout(() => {
        setConfirmDeleteId(current => (current === sessionId ? null : current));
      }, 3000);
    }
  }

  return (
    <aside className="sidebar">
      <button
        type="button"
        className="sidebar-new-btn"
        onClick={startNewSession}
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
            onClick={() => switchToSession(session.sessionId)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') switchToSession(session.sessionId);
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
            <button
              type="button"
              className={`session-delete-btn ${confirmDeleteId === session.sessionId ? 'confirming' : ''}`}
              onClick={(e) => handleDeleteClick(e, session.sessionId)}
              title={confirmDeleteId === session.sessionId ? 'Click again to confirm delete' : 'Delete this analysis'}
            >
              {confirmDeleteId === session.sessionId ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                  <path d="M10 11v6"></path>
                  <path d="M14 11v6"></path>
                  <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
                </svg>
              )}
            </button>
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
