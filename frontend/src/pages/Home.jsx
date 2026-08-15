import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IdeaInput from '../components/IdeaInput/IdeaInput';
import { createSession, submitIdea } from '../services/api.js';
import './Home.css';

const FEATURES = [
  { icon: '🎙', label: 'AI Interview' },
  { icon: '🔍', label: 'RAG + Web Research' },
  { icon: '📊', label: 'Explainable Score' },
];

function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (ideaText) => {
    setLoading(true);
    try {
      await createSession();
      const result = await submitIdea('mock-session-123', ideaText);
      navigate('/analysis/mock-session-123', {
        state: {
          firstQuestion: result.nextQuestion,
          structuredIdea: result.structuredIdea,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="home-hero">
      <div className="home-content">
        <div className={`home-badge ${loading ? 'home-badge--loading' : ''}`}>
          {loading && <span className="home-spinner" />}
          {loading ? 'Starting session...' : 'AI-Powered Validation'}
        </div>

        <h1 className="home-title">
          Validate your startup idea with{' '}
          <span className="home-title-gradient">evidence</span>
        </h1>

        <p className="home-subtext">
          VentureLens runs a structured interview, researches your market with RAG and live
          web data, then scores your idea across six dimensions with full explainability.
        </p>

        <IdeaInput onSubmit={handleSubmit} />

        <div className="home-features">
          {FEATURES.map((feature) => (
            <div key={feature.label} className="home-feature-card">
              <div className="home-feature-icon">{feature.icon}</div>
              <div className="home-feature-label">{feature.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Home;
