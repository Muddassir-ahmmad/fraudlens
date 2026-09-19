export default function RiskFactorList({ reasons = [] }) {
  return (
    <ul className="reason-list">
      {reasons.map((reason, index) => (
        <li key={`${reason}-${index}`}>
          <span>⚠</span>
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  );
}
