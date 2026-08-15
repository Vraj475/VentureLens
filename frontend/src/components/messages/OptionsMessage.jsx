import { useState } from 'react';
import BotTextMessage from './BotTextMessage';
import './OptionsMessage.css';

function OptionsMessage({ content, onSelect, disabled }) {
  const [selected, setSelected] = useState(null);
  const isDisabled = disabled || selected !== null;

  const handleSelect = (option) => {
    if (isDisabled) return;
    setSelected(option);
    onSelect?.(option);
  };

  return (
    <div className="options-message">
      <div className="options-message-inner">
        <BotTextMessage content={content.question} />
        <div className="options-chips">
          {content.options.map((option) => (
            <button
              key={option}
              type="button"
              className={`options-chip ${selected === option ? 'options-chip--selected' : ''}`}
              disabled={isDisabled}
              onClick={() => handleSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OptionsMessage;
