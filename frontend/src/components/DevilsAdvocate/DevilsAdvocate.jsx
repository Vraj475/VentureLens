import './DevilsAdvocate.css';

function DevilsAdvocate({ content }) {
  const paragraphs = content.split('\n\n').filter(Boolean);

  return (
    <div className="devils-advocate">
      <div className="devils-advocate-header">
        <span className="devils-advocate-icon">⚠</span>
        <h3 className="devils-advocate-title">Devil&apos;s Advocate</h3>
        <span className="devils-advocate-sublabel">Critical counter-analysis</span>
      </div>
      <div className="devils-advocate-content">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <div className="devils-advocate-footer">
        Independent analysis by Mistral 7B via OpenRouter
      </div>
    </div>
  );
}

export default DevilsAdvocate;
