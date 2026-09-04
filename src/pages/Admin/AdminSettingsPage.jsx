import React, { useEffect, useState } from 'react';
import { settingsService } from '../../services/settingsService';

const AdminSettingsPage = () => {
  const [form, setForm] = useState({
    storeName: '',
    storeEmail: '',
    supportPhone: '',
    logoUrl: '',
    currency: 'LKR',
    lowStockThreshold: 5,
  });
  const [message, setMessage] = useState('');

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
    }).catch(() => {});
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      await settingsService.updateSettings(form);
      setMessage('Settings saved');
    } catch {
      setMessage('Failed to save settings');
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Store Settings</h1>
      {message && <p>{message}</p>}
      <form onSubmit={save} style={{ background: 'white', padding: 20, borderRadius: 8, maxWidth: 520 }}>
        {Object.keys(form).map((key) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, textTransform: 'capitalize' }}>{key}</label>
            <input
              type={key === 'lowStockThreshold' ? 'number' : 'text'}
              value={form[key]}
              onChange={(e) => setForm({
                ...form,
                [key]: key === 'lowStockThreshold' ? Number(e.target.value) : e.target.value,
              })}
              style={{ width: '100%', padding: 10 }}
            />
          </div>
        ))}
        <button className="btn btn-primary" type="submit">Save Settings</button>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
