import React, { useEffect, useState } from 'react';
import { notificationService } from '../../services/notificationService';
import Select from '../../components/UI/Select';

const cardStyle = { background: 'white', padding: 16, borderRadius: 0, marginBottom: 10, border: '1px solid var(--color-separator)' };
const inputStyle = { padding: 10, border: '1px solid var(--color-separator)', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 14 };

const STATUS_COLORS = {
  FAILED: '#c62828',
  SENT: 'var(--color-success)',
  PENDING: '#e67e22',
  RETRYING: '#e67e22',
};

// Best-effort repair of UTF-8-read-as-Latin-1 mojibake (e.g. "â€"" -> "—").
const fixMojibake = (s) => {
  if (!s || !/[Ã¢â€]/.test(s)) return s || '';
  try { return decodeURIComponent(escape(s)); } catch { return s; }
};

const NotificationCard = ({ n, onRetry }) => {
  const [open, setOpen] = useState(false);
  const subject = fixMojibake(n.subject) || n.type || 'Notification';
  const body = n.body || '';
  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(body);

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'baseline' }}>
        <strong style={{ color: 'var(--color-heading-text)' }}>{subject}</strong>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.5px', color: STATUS_COLORS[n.status] || 'var(--color-body-text)' }}>
          {n.status || ''}
        </span>
      </div>

      <div style={{ fontSize: 12, color: 'var(--color-body-text)', marginTop: 4 }}>
        {[n.type, n.channel].filter(Boolean).join(' · ')}
        {n.recipient ? ` · to ${n.recipient}` : ''}
        {n.createdAt ? ` · ${new Date(n.createdAt).toLocaleString()}` : ''}
        {n.retryCount ? ` · ${n.retryCount} retr${n.retryCount === 1 ? 'y' : 'ies'}` : ''}
      </div>

      {n.referenceType && (
        <div style={{ fontSize: 12, color: 'var(--color-body-text)', marginTop: 2 }}>
          ref: {n.referenceType} / {n.referenceId}
        </div>
      )}

      {n.failureReason && (
        <div style={{
          marginTop: 10, padding: '8px 10px', borderRadius: 0, fontSize: 13,
          background: '#ffebee', color: '#c62828', whiteSpace: 'pre-wrap',
        }}>
          {n.failureReason}
        </div>
      )}

      {body && (
        <div style={{ marginTop: 10 }}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-accent)', fontSize: 13 }}
          >
            {open ? 'Hide email content ▲' : 'View email content ▼'}
          </button>
          {open && (looksHtml ? (
            <iframe
              title={`email-${n.id}`}
              sandbox=""
              srcDoc={body}
              style={{ width: '100%', height: 360, border: '1px solid var(--color-separator)', borderRadius: 0, marginTop: 8, background: 'white' }}
            />
          ) : (
            <pre style={{
              marginTop: 8, padding: 12, background: 'var(--color-light-bg)', borderRadius: 0,
              fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 360, overflow: 'auto',
            }}>
              {body}
            </pre>
          ))}
        </div>
      )}

      {onRetry && (
        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => onRetry(n.id)}>
          Retry
        </button>
      )}
    </div>
  );
};

const AdminNotificationsPage = () => {
  const [failed, setFailed] = useState([]);
  const [loadingFailed, setLoadingFailed] = useState(true);
  const [retryingId, setRetryingId] = useState(null);

  const [mode, setMode] = useState('user');
  const [userId, setUserId] = useState('');
  const [referenceType, setReferenceType] = useState('ORDER');
  const [referenceId, setReferenceId] = useState('');
  const [results, setResults] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [searching, setSearching] = useState(false);

  const loadFailed = async () => {
    setLoadingFailed(true);
    try {
      setFailed(await notificationService.getFailed());
    } finally {
      setLoadingFailed(false);
    }
  };

  useEffect(() => { loadFailed(); }, []);

  const retry = async (id) => {
    setRetryingId(id);
    try {
      await notificationService.retry(id);
      await loadFailed();
    } catch (err) {
      alert(err.response?.data?.message || 'Retry failed');
    } finally {
      setRetryingId(null);
    }
  };

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

      <h3 style={{ marginTop: 36, marginBottom: 12 }}>Failed Notifications</h3>
      {loadingFailed ? (
        <p style={{ marginBottom: 30 }}>Loading…</p>
      ) : failed.length === 0 ? (
        <p style={{ marginBottom: 30, color: '#888' }}>No failed notifications.</p>
      ) : (
        <div style={{ marginBottom: 30 }}>
          {failed.map((n) => (
            <NotificationCard
              key={n.id}
              n={retryingId === n.id ? { ...n, status: 'RETRYING' } : n}
              onRetry={retry}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNotificationsPage;
