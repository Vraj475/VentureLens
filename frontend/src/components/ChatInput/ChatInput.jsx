import { useState } from 'react';
import './ChatInput.css';

function ChatInput({ onSend, disabled, placeholder = 'Describe your business idea...' }) {
  const [value, setValue] = useState('');

  const lineCount = value.split('\n').length;
  const rows = Math.min(Math.max(lineCount, 1), 6);

  const handleSend = () => {
    const trimmed = value.trim();
    if (trimmed.length === 0 || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="chat-input-area">
      <div className="chat-input-inner">
        <textarea
          className="chat-input-field"
          rows={rows}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className="chat-input-send"
          disabled={!canSend}
          onClick={handleSend}
          aria-label="Send message"
        >
          ↑
        </button>
      </div>
      {value.length > 0 && (
        <div className="chat-input-counter">{value.length} characters</div>
      )}
    </div>
  );
}

export default ChatInput;
