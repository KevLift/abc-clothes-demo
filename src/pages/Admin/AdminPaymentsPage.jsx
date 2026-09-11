import React, { useEffect, useState } from 'react';
import { paymentService } from '../../services/paymentService';
import { useCurrency } from '../../context/CurrencyContext';
import { isStoreOwner } from '../../utils/roles';
import { useAuth } from '../../context/AuthContext';

const REFUNDABLE = ['COMPLETED', 'PARTIALLY_REFUNDED'];

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [refundForm, setRefundForm] = useState({ paymentId: '', amount: '', reason: '' });
  const [message, setMessage] = useState(null); // { type: 'ok' | 'err', text }
  const [busy, setBusy] = useState(false);
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const owner = isStoreOwner(user);

  const load = async () => {
    try {
      const page = await paymentService.listPayments({ page: 0, size: 50 });
      setPayments(page.content || []);
    } catch {
      setPayments([]);
    }
  };

  useEffect(() => { load(); }, []);

  const remaining = (p) => Number(p.amount || 0) - Number(p.refundedAmount || 0);

  const startRefund = (p) => {
    setMessage(null);
    setRefundForm({ paymentId: p.id, amount: String(remaining(p)), reason: '' });
    document.getElementById('refund-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const refund = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const amt = Number(refundForm.amount);
      await paymentService.refund({
        paymentId: refundForm.paymentId.trim(),
        // Blank / 0 => full refund (send no amount so the server refunds the remainder).
        ...(amt > 0 ? { amount: amt } : {}),
        ...(refundForm.reason.trim() ? { reason: refundForm.reason.trim() } : {}),
      });
      setMessage({ type: 'ok', text: 'Refund processed.' });
      setRefundForm({ paymentId: '', amount: '', reason: '' });
      load();
    } catch (err) {
      setMessage({ type: 'err', text: err.response?.data?.message || 'Refund failed.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Payments</h1>
      {message && (
        <p style={{
          padding: '10px 14px', borderRadius: 0, marginBottom: 16, fontSize: 14,
          background: message.type === 'ok' ? '#e8f5e9' : '#ffebee',
          color: message.type === 'ok' ? '#1b5e20' : '#c62828',
        }}>
          {message.text}
        </p>
      )}

      <div style={{ background: 'white', borderRadius: 0, overflowX: 'auto', marginBottom: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8f9fa' }}>
            <tr>
              <th style={{ padding: 12, textAlign: 'left' }}>Payment ID</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Order</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Amount</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Refunded</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
              {owner && <th style={{ padding: 12, textAlign: 'left' }} />}
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr><td colSpan={owner ? 6 : 5} style={{ padding: 16, color: '#888' }}>No payments yet.</td></tr>
            )}
            {payments.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 12, fontFamily: 'monospace', fontSize: 12 }}>{p.id}</td>
                <td style={{ padding: 12, fontFamily: 'monospace', fontSize: 12 }}>
                  {p.orderNumber || p.orderId}
                </td>
                <td style={{ padding: 12 }}>{formatPrice(p.amount, p.currency)}</td>
                <td style={{ padding: 12 }}>
                  {Number(p.refundedAmount) > 0 ? formatPrice(p.refundedAmount, p.currency) : '—'}
                </td>
                <td style={{ padding: 12 }}>{p.status}</td>
                {owner && (
                  <td style={{ padding: 12 }}>
                    {REFUNDABLE.includes(p.status) && remaining(p) > 0 ? (
                      <button
                        type="button"
                        onClick={() => startRefund(p)}
                        style={{ color: '#3498db', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Refund
                      </button>
                    ) : null}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {owner && (
        <form id="refund-form" onSubmit={refund} style={{ background: 'white', padding: 20, borderRadius: 0, maxWidth: 460 }}>
          <h3 style={{ marginBottom: 4 }}>Refund (owner only)</h3>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
            Use the <strong>Refund</strong> link on a row to fill this in. Leave the amount blank for a full refund.
          </p>
          <input
            placeholder="Payment ID"
            value={refundForm.paymentId}
            onChange={(e) => setRefundForm({ ...refundForm, paymentId: e.target.value })}
            required
            style={{ width: '100%', padding: 8, marginBottom: 8, fontFamily: 'monospace' }}
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Amount (blank = full refund)"
            value={refundForm.amount}
            onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
            style={{ width: '100%', padding: 8, marginBottom: 8 }}
          />
          <input
            placeholder="Reason (optional)"
            value={refundForm.reason}
            onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
            style={{ width: '100%', padding: 8, marginBottom: 8 }}
          />
          <button className="btn btn-primary" type="submit" disabled={busy || !refundForm.paymentId.trim()}>
            {busy ? 'Processing…' : 'Refund'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
