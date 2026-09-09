import React, { useEffect, useState } from 'react';
import { paymentService } from '../../services/paymentService';
import { useCurrency } from '../../context/CurrencyContext';
import { isStoreOwner } from '../../utils/roles';
import { useAuth } from '../../context/AuthContext';

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [refundForm, setRefundForm] = useState({ paymentId: '', amount: '', reason: '' });
  const [message, setMessage] = useState('');
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  const load = async () => {
    const page = await paymentService.listPayments({ page: 0, size: 50 });
    setPayments(page.content || []);
  };

  useEffect(() => { load(); }, []);

  const refund = async (e) => {
    e.preventDefault();
    try {
      await paymentService.refund({
        paymentId: refundForm.paymentId,
        amount: Number(refundForm.amount),
        reason: refundForm.reason,
      });
      setMessage('Refund processed');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Refund failed');
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Payments</h1>
      {message && <p>{message}</p>}
      <div style={{ background: 'white', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8f9fa' }}>
            <tr>
              <th style={{ padding: 12, textAlign: 'left' }}>ID</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Order</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Amount</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 12 }}>{String(p.id).substring(0, 8)}</td>
                <td style={{ padding: 12 }}>{p.orderId}</td>
                <td style={{ padding: 12 }}>{formatPrice(p.amount, p.currency)}</td>
                <td style={{ padding: 12 }}>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isStoreOwner(user) && (
        <form onSubmit={refund} style={{ background: 'white', padding: 20, borderRadius: 8, maxWidth: 420 }}>
          <h3>Refund (owner only)</h3>
          <input placeholder="Payment ID" value={refundForm.paymentId} onChange={(e) => setRefundForm({ ...refundForm, paymentId: e.target.value })} required style={{ width: '100%', padding: 8, marginBottom: 8 }} />
          <input type="number" step="0.01" placeholder="Amount" value={refundForm.amount} onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })} required style={{ width: '100%', padding: 8, marginBottom: 8 }} />
          <input placeholder="Reason" value={refundForm.reason} onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
          <button className="btn btn-primary" type="submit">Refund</button>
        </form>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
