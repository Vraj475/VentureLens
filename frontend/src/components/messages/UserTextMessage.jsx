import './messages.css';

function UserTextMessage({ content }) {
  return (
    <div className="user-text-message">
      <div className="user-text-bubble">{content}</div>
    </div>
  );
}

export default UserTextMessage;
