import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockTransactions } from '../data/mockData';
import TransactionTable from '../components/TransactionTable';

const filters = ['All', 'Low', 'Medium', 'High'];

export default function HistoryPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const transactions = useMemo(() => (
    filter === 'All'
      ? mockTransactions
      : mockTransactions.filter((transaction) => transaction.risk === filter.toUpperCase())
  ), [filter]);

  return (
    <div className="page">
      <div className="section-header page-header">
        <div>
          <div className="kicker">Audit trail</div>
          <h2>Payment History</h2>
        </div>
        <div className="history-count">{transactions.length} records</div>
      </div>
      <div className="filter-row">
        {filters.map((item) => (
          <button key={item} type="button" className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>
        ))}
      </div>
      <TransactionTable
        transactions={transactions}
        onSelect={(transaction) => navigate('/investigation', { state: { transactionId: transaction.id } })}
      />
    </div>
  );
}