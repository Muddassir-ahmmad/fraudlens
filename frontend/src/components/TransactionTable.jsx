import RiskBadge from './RiskBadge';
import StatusBadge from './StatusBadge';

export default function TransactionTable({ transactions = [], onSelect }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Date/Time</th>
            <th>Sender</th>
            <th>Receiver</th>
            <th>Risk</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn.id} onClick={() => onSelect?.(txn)} style={{ cursor: 'pointer' }}>
              <td><button className="link-btn" type="button">{txn.id}</button></td>
              <td>{txn.customer}</td>
              <td>₹{Number(txn.amount).toLocaleString('en-IN')}</td>
              <td>{new Date(txn.dateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
              <td>{txn.sender}</td>
              <td>{txn.receiver}</td>
              <td><RiskBadge level={txn.risk} /></td>
              <td><StatusBadge status={txn.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
