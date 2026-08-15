import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { clearHistory } from '../../services/api.js';
import './ProfilePanel.css';

function ProfilePanel({ isOpen, onClose }) {
  const { userProfile, logout } = useAuth();
  const { clearSessions } = useChat();
  const [settings, setSettings] = useState({
    marketFocus: 'India',
    devilsAdvocate: true,
    customMarket: '',
  });
  const [confirmClear, setConfirmClear] = useState(false);
  const confirmTimerRef = useRef(null);

  useEffect(() => {
    if (userProfile?.settings) {
      setSettings({
        marketFocus: userProfile.settings.marketFocus || 'India',
        devilsAdvocate: userProfile.settings.devilsAdvocate !== false,
        customMarket: userProfile.settings.customMarket || '',
      });
    }
  }, [userProfile]);

  useEffect(() => () => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
  }, []);

  const displayName = userProfile?.displayName || 'User';
  const email = userProfile?.email || '';
  const initial = displayName.charAt(0).toUpperCase();

  const handleClearHistory = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      confirmTimerRef.current = setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    await clearHistory();
    clearSessions();
    setConfirmClear(false);
    onClose();
  };

  return (
    <aside className={`profile-panel ${isOpen ? 'profile-panel--open' : ''}`}>
      <div className="profile-panel-header">
        <h2 className="profile-panel-title">Profile & Settings</h2>
        <button type="button" className="profile-panel-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className="profile-panel-content">
        <div className="profile-section">
          <div className="profile-avatar-large">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt={displayName} />
            ) : (
              initial
            )}
          </div>
          <div className="profile-name">{displayName}</div>
          <div className="profile-email">{email}</div>
        </div>

        <hr className="profile-divider" />

        <div className="profile-section">
          <div className="profile-section-label">Settings</div>

          <div className="profile-setting-label">Market Focus</div>
          <div className="profile-option-row">
            {['India', 'Global', 'Custom'].map((option) => (
              <button
                key={option}
                type="button"
                className={`profile-option-btn ${
                  settings.marketFocus === option ? 'profile-option-btn--active' : ''
                }`}
                onClick={() => setSettings((prev) => ({ ...prev, marketFocus: option }))}
              >
                {option}
              </button>
            ))}
          </div>
          {settings.marketFocus === 'Custom' && (
            <input
              type="text"
              className="profile-custom-input"
              placeholder="Enter your target market..."
              value={settings.customMarket}
              onChange={(event) =>
                setSettings((prev) => ({ ...prev, customMarket: event.target.value }))
              }
            />
          )}

          <div className="profile-toggle-row">
            <span className="profile-setting-label">Show Counter-Arguments</span>
            <div className="profile-toggle">
              <input
                id="devils-toggle"
                type="checkbox"
                className="profile-toggle-input"
                checked={settings.devilsAdvocate}
                onChange={(event) =>
                  setSettings((prev) => ({ ...prev, devilsAdvocate: event.target.checked }))
                }
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
          <button type="button" className="profile-danger-btn" onClick={handleClearHistory}>
            {confirmClear ? 'Tap again to confirm' : 'Clear All History'}
          </button>
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
