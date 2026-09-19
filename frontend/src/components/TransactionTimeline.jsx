export default function TransactionTimeline({ timeline = [] }) {
  return (
    <div className="timeline">
      {timeline.map((item, index) => (
        <div key={`${item.date}-${index}`} className={`timeline-item ${item.high ? 'high' : item.risk === 'LOW' ? 'low' : ''}`}>
          <div className="time">{item.date}</div>
          <div className="amount">₹{Number(item.amount).toLocaleString('en-IN')}</div>
          <div><span className={`risk-badge ${item.risk === 'HIGH' ? 'risk-high' : item.risk === 'MEDIUM' ? 'risk-medium' : 'risk-low'}`}>{item.risk}</span></div>
        </div>
      ))}
    </div>
  );
}
