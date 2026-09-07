import React, { useEffect, useState } from 'react';
import { notificationService } from '../../services/notificationService';
import Select from '../../components/UI/Select';

const cardStyle = { background: 'white', padding: 16, borderRadius: 8, marginBottom: 10, border: '1px solid var(--color-separator)' };
const inputStyle = { padding: 10, border: '1px solid var(--color-separator)', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 14 };

const NotificationCard = ({ n }) => (
  <div style={cardStyle}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
      <strong>{n.title || n.type}</strong>
      <small style={{ color: 'var(--color-body-text)' }}>
        {n.status || ''} {n.createdAt ? `· ${new Date(n.createdAt).toLocaleString()}` : ''}
      </small>
    </div>
    <p style={{ marginTop: 6 }}>{n.message || n.body}</p>
    {(n.channel || n.referenceType) && (
      <small style={{ color: 'var(--color-body-text)' }}>
        {n.channel ? `channel: ${n.channel}` : ''}
        {n.referenceType ? `  ref: ${n.referenceType}/${n.referenceId}` : ''}
      </small>
    )}
  </div>
);

const AdminNotificationsPage = () => {
  const [failed, setFailed] = useState([]);

  const [mode, setMode] = useState('user');
  const [userId, setUserId] = useState('');
  const [referenceType, setReferenceType] = useState('ORDER');
  const [referenceId, setReferenceId] = useState('');
  const [results, setResults] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [searching, setSearching] = useState(false);

  const loadFailed = async () => {
    setFailed(await notificationService.getFailed());
  };

  useEffect(() => { loadFailed(); }, []);

  const runLookup = async (e) => {
    e.preventDefault();
    setLookupError('');
    setResults(null);
    setSearching(true);
    try {
      const data = mode === 'user'
        ? await notificationService.getByUser(userId.trim())
        : await notificationService.getByReference(referenceType.trim(), referenceId.trim());
      setResults(data);
    } catch {
      setLookupError('Lookup failed. Check the identifier and your permissions.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Notifications</h1>

      <h3 style={{ marginBottom: 12 }}>Failed Notifications</h3>
      {failed.length === 0 ? (
        <p style={{ marginBottom: 30 }}>No failed notifications.</p>
      ) : (
        <div style={{ marginBottom: 30 }}>
          {failed.map((n) => (
            <div key={n.id} style={cardStyle}>
              <strong>{n.title || n.type}</strong>
              <p style={{ margin: '6px 0' }}>{n.message || n.body}</p>
              <button
                className="btn btn-primary"
                onClick={async () => { await notificationService.retry(n.id); loadFailed(); }}
              >
                Retry
              </button>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ marginBottom: 12 }}>Look Up Notifications</h3>
      <form
        onSubmit={runLookup}
        style={{ ...cardStyle, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}
      >
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Search by</label>
          <Select
            value={mode}
            onChange={setMode}
            aria-label="Notification lookup mode"
            options={[
              { value: 'user', label: 'User ID' },
              { value: 'reference', label: 'Reference' },
            ]}
          />
        </div>

        {mode === 'user' ? (
          <div style={{ flex: '1 1 260px' }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>User ID</label>
            <input
              style={{ ...inputStyle, width: '100%' }}
              placeholder="e.g. 3f1c…"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>
        ) : (
          <>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Reference type</label>
              <input
                style={inputStyle}
                placeholder="ORDER"
                value={referenceType}
                onChange={(e) => setReferenceType(e.target.value)}
                required
              />
            </div>
            <div style={{ flex: '1 1 220px' }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Reference ID</label>
              <input
                style={{ ...inputStyle, width: '100%' }}
                placeholder="e.g. order id"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <button className="btn btn-primary" type="submit" disabled={searching}>
          {searching ? 'Searching…' : 'Search'}
        </button>
      </form>

      {lookupError && <p style={{ color: '#c62828' }}>{lookupError}</p>}

      {results && (
        <div style={{ marginTop: 10 }}>
          <p style={{ fontSize: 13, color: 'var(--color-body-text)', marginBottom: 10 }}>
            {results.length} notification{results.length === 1 ? '' : 's'} found
          </p>
          {results.map((n) => <NotificationCard key={n.id} n={n} />)}
        </div>
      )}
    </div>
  );
};

export default AdminNotificationsPage;
