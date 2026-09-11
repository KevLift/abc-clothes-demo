import React, { useEffect, useState } from 'react';
import { platformService } from '../../services/platformService';
import { useAuth } from '../../context/AuthContext';

const PLATFORM_ROLES = ['PLATFORM_ADMIN', 'PLATFORM_SUPPORT'];

const cardStyle = {
  background: 'white',
  borderRadius: 0,
  padding: 20,
  border: '1px solid var(--color-separator)',
};

const humanize = (key) =>
  key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());

const StatGrid = ({ data }) => {
  const entries = Object.entries(data || {});
  if (!entries.length) return <p style={{ padding: 20 }}>No data.</p>;
  return (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      }}
    >
      {entries.map(([key, value]) => (
        <div key={key} style={cardStyle}>
          <div
            style={{
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: 'var(--color-body-text)',
              marginBottom: 8,
            }}
          >
            {humanize(key)}
          </div>
          <div style={{ fontSize: 22, color: 'var(--color-heading-text)' }}>
            {value !== null && typeof value === 'object'
              ? JSON.stringify(value)
              : String(value)}
          </div>
        </div>
      ))}
    </div>
  );
};

const AdminPlatformPage = () => {
  const { user } = useAuth();
  const allowed = PLATFORM_ROLES.includes(user?.role);

  const [reports, setReports] = useState(null);
  const [debug, setDebug] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [r, d] = await Promise.all([
        platformService.getReports(),
        platformService.getDebug().catch(() => null),
      ]);
      setReports(r);
      setDebug(d);
    } catch {
      setError('Unable to load platform reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allowed) load();
    else setLoading(false);
  }, [allowed]);

  if (!allowed) {
    return (
      <div>
        <h1 style={{ marginBottom: 20 }}>Platform</h1>
        <div style={cardStyle}>
          <p>
            This area is available to platform operators
            (<strong>PLATFORM_ADMIN</strong> / <strong>PLATFORM_SUPPORT</strong>) only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Platform Reports</h1>
        <button className="btn btn-outline" onClick={load} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && <p style={{ color: '#c62828', marginBottom: 15 }}>{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <StatGrid data={reports} />

          <div style={{ marginTop: 30 }}>
            <button className="btn btn-outline" onClick={() => setShowDebug((v) => !v)}>
              {showDebug ? 'Hide' : 'Show'} debug snapshot
            </button>
            {showDebug && (
              <pre
                style={{
                  ...cardStyle,
                  marginTop: 12,
                  overflowX: 'auto',
                  fontSize: 12,
                  lineHeight: 1.5,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                {JSON.stringify(debug ?? { info: 'No debug data' }, null, 2)}
              </pre>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPlatformPage;
