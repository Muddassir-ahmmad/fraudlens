import RiskBadge from './RiskBadge';
import StatusBadge from './StatusBadge';

export default function AlertTable({ alerts = [], onInvestigate }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Amount</th>
            <th>Risk Score</th>
            <th>Risk Level</th>
            <th>Reasons</th>
            <th>Status</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id}>
              <td>{alert.customer}</td>
              <td>₹{Number(alert.amount).toLocaleString('en-IN')}</td>
              <td>{alert.riskScore}/100</td>
              <td><RiskBadge level={alert.riskLevel} /></td>
              <td>{alert.reasons?.join(', ')}</td>
              <td><StatusBadge status={alert.status} /></td>
              <td>{new Date(alert.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
              <td><button className="btn btn-primary" type="button" onClick={() => onInvestigate?.(alert)}>Investigate</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
