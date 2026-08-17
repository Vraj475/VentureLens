import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './ProfilePanel.css';

function ProfilePanel({ isOpen, onClose }) {
  const { currentUser, userProfile, logout } = useAuth();
  const [devilOn, setDevilOn] = useState(() => {
    const saved = localStorage.getItem('venturelens_devils_advocate');
    return saved === null ? true : saved === 'true';
  });

  function handleToggleDevil() {
    const newValue = !devilOn;
    setDevilOn(newValue);
    localStorage.setItem('venturelens_devils_advocate', String(newValue));
  }

  const displayEmail = currentUser?.email || userProfile?.email || 'No email';
  const initial = (currentUser?.email?.[0] || userProfile?.email?.[0] || 'U').toUpperCase();

  return (
    <aside className={`profile-panel ${isOpen ? 'profile-panel--open' : ''}`}>
      <div className="profile-panel-header">
        <h2 className="profile-panel-title">Profile &amp; Settings</h2>
        <button type="button" className="profile-panel-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className="profile-panel-content">
        <div className="profile-section">
          <div className="profile-avatar-large">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt={displayEmail} />
            ) : (
              initial
            )}
          </div>
          <div className="profile-name">{displayEmail}</div>
        </div>

        <hr className="profile-divider" />

        <div className="profile-section">
          <div className="profile-section-label">Settings</div>

          <div className="profile-toggle-row">
            <span className="profile-setting-label">Show Counter-Arguments</span>
            <div className="profile-toggle" onClick={handleToggleDevil}>
              <input
                id="devils-toggle"
                type="checkbox"
                className="profile-toggle-input"
                checked={devilOn}
                onChange={handleToggleDevil}
              />
              <label htmlFor="devils-toggle" className="profile-toggle-label">
                <span className="profile-toggle-knob" />
              </label>
            </div>
          </div>
        </div>

        <hr className="profile-divider" />

        <div className="profile-section">
          <div className="profile-section-label">Account</div>
          <button
            type="button"
            className="profile-danger-btn"
            onClick={() => {
              logout();
              onClose();
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}

export default ProfilePanel;
