import React, { useEffect, useState } from 'react';
import { settingsService } from '../../services/settingsService';
import { useCurrency } from '../../context/CurrencyContext';
import { getApiErrorMessage } from '../../utils/errors';

/** "storeName" -> "Store Name", "lowStockThreshold" -> "Low Stock Threshold" */
const humanize = (key) =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();

const FIELDS = [
  { key: 'storeName', type: 'text' },
  { key: 'storeEmail', type: 'email' },
  { key: 'supportPhone', type: 'text' },
  { key: 'logoUrl', type: 'text' },
  { key: 'currency', type: 'select' },
  { key: 'lowStockThreshold', type: 'number' },
];

const AdminSettingsPage = () => {
  const { availableCurrencies } = useCurrency();
  const [form, setForm] = useState({
    storeName: '',
    storeEmail: '',
    supportPhone: '',
    logoUrl: '',
    currency: 'LKR',
    lowStockThreshold: 5,
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    settingsService.getSettings().then((s) => {
      if (!s) return;
      setForm({
        storeName: s.storeName || '',
        storeEmail: s.storeEmail || '',
        supportPhone: s.supportPhone || '',
        logoUrl: s.logoUrl || '',
        currency: s.currency || 'LKR',
        lowStockThreshold: s.lowStockThreshold ?? 5,
      });
    }).catch((err) => {
      setMessage({ type: 'error', text: getApiErrorMessage(err, 'Could not load settings.') });
    });
  }, []);

  // Auto-dismiss the status banner so it doesn't linger on the page.
  useEffect(() => {
    if (!message.text) return undefined;
    const timer = setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const updateField = (key, rawValue) => {
    setMessage({ type: '', text: '' });
    setForm((prev) => ({
      ...prev,
      [key]: key === 'lowStockThreshold' ? Number(rawValue) : rawValue,
    }));
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      await settingsService.updateSettings(form);
      setMessage({ type: 'success', text: 'Settings saved' });
    } catch (err) {
      setMessage({ type: 'error', text: getApiErrorMessage(err, 'Failed to save settings.') });
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Store Settings</h1>
      {message.text && (
        <p style={{ color: message.type === 'error' ? '#c0392b' : '#1e8449', marginBottom: 16 }}>
          {message.text}
        </p>
      )}
      <form onSubmit={save} style={{ background: 'white', padding: 20, borderRadius: 8, maxWidth: 520 }}>
        {FIELDS.map(({ key, type }) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label htmlFor={`setting-${key}`} style={{ display: 'block', marginBottom: 4 }}>
              {humanize(key)}
            </label>
            {type === 'select' ? (
              <select
                id={`setting-${key}`}
                value={form[key]}
                onChange={(e) => updateField(key, e.target.value)}
                style={{ width: '100%', padding: 10 }}
              >
                {availableCurrencies.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            ) : (
              <input
                id={`setting-${key}`}
                type={type}
                value={form[key]}
                min={type === 'number' ? 0 : undefined}
                onChange={(e) => updateField(key, e.target.value)}
                style={{ width: '100%', padding: 10 }}
              />
            )}
          </div>
        ))}
        <button className="btn btn-primary" type="submit">Save Settings</button>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
