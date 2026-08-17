import { useAuth } from '../../context/AuthContext';
import './messages.css';

export default function UserTextMessage({ content }) {
  const { currentUser } = useAuth();
  const initial = (currentUser?.email?.[0] || 'U').toUpperCase();

  return (
    <div className="message-row user">
      <div className="user-bubble">{content}</div>
      <div className="user-avatar">{initial}</div>
    </div>
  );
}
