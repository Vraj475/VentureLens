import './AssumptionsChecker.css';

function AssumptionsChecker({ assumptions }) {
  return (
    <div className="assumptions-checker">
      {assumptions.map((item, index) => (
        <div key={index} className="assumption-row">
          <div
            className={`assumption-icon ${
              item.isSupported ? 'assumption-icon--supported' : 'assumption-icon--unsupported'
            }`}
          >
            {item.isSupported ? '✓' : '✗'}
          </div>
          <div>
            <div className="assumption-text">{item.assumption}</div>
            <div className="assumption-evidence">{item.evidence}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AssumptionsChecker;
