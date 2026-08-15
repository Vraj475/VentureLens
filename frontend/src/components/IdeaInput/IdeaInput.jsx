import { useState } from 'react';
import './IdeaInput.css';

function IdeaInput({ onSubmit }) {
  const [text, setText] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleChange = (event) => {
    const value = event.target.value;
    setText(value);
    setCharCount(value.length);
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed.length >= 30) {
      onSubmit(trimmed);
    }
  };

  const isDisabled = text.trim().length < 30;

  return (
    <div className="idea-input-card">
      <textarea
        className="idea-input-textarea"
        placeholder="Describe your business idea in detail — target customer, problem, solution, and how you make money..."
        maxLength={1000}
        value={text}
        onChange={handleChange}
      />
      <div className="idea-input-counter">
        {charCount}/1000
      </div>
      <button
        type="button"
        className="idea-input-submit"
        disabled={isDisabled}
        onClick={handleSubmit}
      >
        Validate My Idea →
      </button>
    </div>
  );
}

export default IdeaInput;
