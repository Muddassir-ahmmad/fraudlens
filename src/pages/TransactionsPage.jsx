import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransactions } from '../services/api';
import { mockTransactions } from '../data/mockData';
import TransactionTable from '../components/TransactionTable';

const filters = ['All', 'Low', 'Medium', 'High'];

export default function TransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(data || mockTransactions);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'All') return transactions;
    return transactions.filter((item) => item.risk === filter.toUpperCase());
  }, [transactions, filter]);

  if (loading) {
    return <div className="page"><div className="empty-state">Loading transactions…</div></div>;
  }

  return (
    <div className="page">
      <div className="section-header page-header">
        <div>
          <div className="kicker">Payment Activity</div>
          <h2>Transactions</h2>
        </div>
      </div>

      <div className="filter-row">
        {filters.map((item) => (
          <button key={item} type="button" className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No transactions found for this filter.</div>
      ) : (
        <TransactionTable transactions={filtered} onSelect={(txn) => navigate('/investigation', { state: { transactionId: txn.id } })} />
      )}
    </div>
  );
}
