import React, { useEffect, useState } from 'react';
import { inquiryService } from '../../services/inquiryService';
import Select from '../../components/UI/Select';

const AdminInquiriesPage = () => {
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const page = await inquiryService.list({ type: type || undefined, page: 0, size: 100 });
      setItems(page.content || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [type]);

  const visibleItems = status
    ? items.filter((item) => (item.status || 'NEW') === status)
    : items;

  const openItem = (item) => {
    setSelected(item);
    setReplyText('');
    setError('');
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!selected || !replyText.trim()) return;
    setSending(true);
    setError('');
    try {
      const updated = await inquiryService.respond(selected.id, replyText.trim());
      setSelected(updated);
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setReplyText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, gap: 10, flexWrap: 'wrap' }}>
        <h1>Inquiries</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Select
            value={status}
            onChange={setStatus}
            aria-label="Filter inquiries by status"
            options={[
              { value: '', label: 'All statuses' },
              { value: 'NEW', label: 'New' },
              { value: 'ANSWERED', label: 'Answered' },
            ]}
          />
          <Select
            value={type}
            onChange={setType}
            aria-label="Filter inquiries by type"
            options={[
              { value: '', label: 'All types' },
              { value: 'CONTACT', label: 'Contact' },
              { value: 'NEWSLETTER', label: 'Newsletter' },
            ]}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1.1fr 1fr' : '1fr', gap: 20 }}>
        <div style={{ background: 'white', borderRadius: 8, overflow: 'hidden' }}>
          {loading ? (
            <p style={{ padding: 20 }}>Loading...</p>
          ) : visibleItems.length === 0 ? (
            <p style={{ padding: 20 }}>No inquiries.</p>
          ) : visibleItems.map((item) => (
            <div
              key={item.id}
              onClick={() => openItem(item)}
              style={{
                padding: 16,
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                background: selected?.id === item.id ? '#f5f8ff' : 'white',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <strong>{item.type}</strong>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 10,
                  background: item.status === 'ANSWERED' ? '#e8f5e9' : '#fff3e0',
                  color: item.status === 'ANSWERED' ? '#2e7d32' : '#e65100',
                }}
                >
                  {item.status === 'ANSWERED' ? 'Answered' : 'New'}
                </span>
              </div>
              <div>{item.email}</div>
              {item.name && <div style={{ fontSize: 13, color: '#666' }}>{item.name}</div>}
              {item.subject && <div style={{ fontStyle: 'italic', marginTop: 4 }}>{item.subject}</div>}
              {item.message && (
                <p style={{ marginTop: 8, fontSize: 13, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.message}
                </p>
              )}
              <small style={{ color: '#999' }}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</small>
            </div>
          ))}
        </div>

        {selected && (
          <div style={{ background: 'white', padding: 20, borderRadius: 8, alignSelf: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>{selected.subject || selected.type}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
            </div>
            <p style={{ fontSize: 13, color: '#666' }}>{selected.name ? `${selected.name} · ` : ''}{selected.email}</p>
            <p style={{ background: '#f8f9fa', padding: 12, borderRadius: 4, marginTop: 10 }}>{selected.message}</p>

            {selected.status === 'ANSWERED' && (
              <div style={{ marginTop: 15 }}>
                <h4 style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>Your reply</h4>
                <p style={{ background: '#e8f5e9', padding: 12, borderRadius: 4 }}>{selected.response}</p>
                <small style={{ color: '#999' }}>
                  {selected.respondedAt ? `Sent ${new Date(selected.respondedAt).toLocaleString()}` : ''}
                </small>
              </div>
            )}

            {selected.type === 'CONTACT' && (
              <form onSubmit={sendReply} style={{ marginTop: 15 }}>
                <h4 style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>
                  {selected.status === 'ANSWERED' ? 'Send another reply' : 'Reply'}
                </h4>
                {error && <p style={{ color: '#c62828', fontSize: 13 }}>{error}</p>}
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={5}
                  placeholder="Type your reply — it will be emailed to the customer"
                  style={{ width: '100%', padding: 10, marginBottom: 10 }}
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={sending}>
                  {sending ? 'Sending...' : 'Send Reply'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInquiriesPage;
