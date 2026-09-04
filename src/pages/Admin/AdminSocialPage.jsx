import React, { useEffect, useState } from 'react';
import { socialService } from '../../services/socialService';

const AdminSocialPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [authUrl, setAuthUrl] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      setAccounts(await socialService.listAccounts());
    } catch {
      setAccounts([]);
    }
  };

  useEffect(() => { load(); }, []);

  const startFacebook = async () => {
    try {
      const res = await socialService.getFacebookAuthUrl(window.location.origin + '/admin/social');
      setAuthUrl(res.authorizationUrl || res.url || '');
      if (res.authorizationUrl || res.url) {
        window.open(res.authorizationUrl || res.url, '_blank');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Facebook OAuth not configured');
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Social Publishing</h1>
      {message && <p style={{ color: '#c62828' }}>{message}</p>}
      <button className="btn btn-primary" onClick={startFacebook} style={{ marginBottom: 20 }}>
        Connect Facebook
      </button>
      {authUrl && <p style={{ fontSize: 12, wordBreak: 'break-all' }}>Auth URL: {authUrl}</p>}
      <div style={{ background: 'white', borderRadius: 8, padding: 16 }}>
        <h3>Connected Accounts</h3>
        {accounts.length === 0 ? <p>No accounts connected.</p> : accounts.map((a) => (
          <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            {a.platform} — {a.accountName || a.externalPageId} ({a.status})
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSocialPage;
