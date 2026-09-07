import React, { useEffect, useState } from 'react';
import { platformService } from '../../services/platformService';
import { useAuth } from '../../context/AuthContext';

const cardStyle = {
  background: 'white',
  borderRadius: 8,
  padding: 20,
  border: '1px solid var(--color-separator)',
  maxWidth: 560,
};

const AdminConfigPage = () => {
  const { user } = useAuth();
  const allowed = user?.role === 'PLATFORM_ADMIN';

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [flagsText, setFlagsText] = useState('{}');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const applyConfig = (cfg) => {
    setMaintenanceMode(Boolean(cfg?.maintenanceMode));
    setFlagsText(JSON.stringify(cfg?.featureFlags ?? {}, null, 2));
    setUpdatedAt(cfg?.updatedAt || null);
  };

  useEffect(() => {
    if (!allowed) {
      setLoading(false);
      return;
    }
    platformService
      .getConfig()
      .then(applyConfig)
      .catch(() => setError('Unable to load configuration.'))
      .finally(() => setLoading(false));
  }, [allowed]);

  const save = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    let featureFlags;
    try {
      featureFlags = flagsText.trim() ? JSON.parse(flagsText) : {};
    } catch {
      setError('Feature flags must be valid JSON.');
      return;
    }

    setSaving(true);
    try {
      const cfg = await platformService.updateConfig({ maintenanceMode, featureFlags });
      applyConfig(cfg);
      setMessage('Configuration saved.');
    } catch {
      setError('Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (!allowed) {
    return (
      <div>
        <h1 style={{ marginBottom: 20 }}>Admin Config</h1>
        <div style={cardStyle}>
          <p>
            Runtime configuration flags are editable by <strong>PLATFORM_ADMIN</strong> only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Admin Config</h1>
      {message && <p style={{ color: '#2e7d32', marginBottom: 15 }}>{message}</p>}
      {error && <p style={{ color: '#c62828', marginBottom: 15 }}>{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <form onSubmit={save} style={cardStyle}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <input
              type="checkbox"
              className="shop-filter-control"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
            />
            <span>Maintenance mode</span>
          </label>

          <label style={{ display: 'block', marginBottom: 6 }}>Feature flags (JSON)</label>
          <textarea
            value={flagsText}
            onChange={(e) => setFlagsText(e.target.value)}
            rows={10}
            spellCheck={false}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid var(--color-separator)',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 13,
              resize: 'vertical',
              outline: 'none',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginTop: 16 }}>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save Config'}
            </button>
            {updatedAt && (
              <span style={{ fontSize: 12, color: 'var(--color-body-text)' }}>
                Last updated {new Date(updatedAt).toLocaleString()}
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminConfigPage;
