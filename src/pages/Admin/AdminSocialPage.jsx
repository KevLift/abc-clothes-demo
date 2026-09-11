import React, { useEffect, useRef, useState } from 'react';
import { socialService } from '../../services/socialService';

const cardStyle = {
  background: 'white',
  borderRadius: 0,
  padding: 16,
  border: '1px solid var(--color-separator)',
};

const AdminSocialPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | starting | completing | choosePage
  const [pages, setPages] = useState([]);
  const [connectionId, setConnectionId] = useState('');
  const callbackHandled = useRef(false);

  const load = async () => {
    try {
      setAccounts(await socialService.listAccounts());
    } catch {
      setAccounts([]);
    }
  };

  useEffect(() => { load(); }, []);

  // Handle the return trip from Facebook: /admin/social?code=...&state=...
  useEffect(() => {
    if (callbackHandled.current) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const oauthError = params.get('error_description') || params.get('error');

    if (!code && !state && !oauthError) return;
    callbackHandled.current = true;

    // Strip the query string so a refresh doesn't replay the exchange.
    window.history.replaceState({}, '', window.location.pathname);

    if (oauthError) {
      setError(typeof oauthError === 'string' ? oauthError : 'Facebook authorization was cancelled.');
      return;
    }
    if (!code || !state) return;

    setPhase('completing');
    setError('');
    socialService.facebookCallback({ code, state })
      .then((res) => {
        setConnectionId(res.connectionId || '');
        setPages(res.pages || []);
        if (res.pages?.length) {
          setPhase('choosePage');
        } else {
          setPhase('idle');
          setError('This Facebook account has no Pages available to connect.');
        }
      })
      .catch((err) => {
        setPhase('idle');
        setError(err.response?.data?.message || 'Could not complete the Facebook connection.');
      });
  }, []);

  const startFacebook = async () => {
    setError('');
    setMessage('');
    setPhase('starting');
    try {
      const res = await socialService.getFacebookAuthUrl(window.location.origin + '/admin/social');
      const url = res.authorizationUrl || res.url;
      if (!url) throw new Error('no-url');
      window.location.assign(url);
    } catch (err) {
      setPhase('idle');
      setError(err.response?.data?.message || 'Facebook integration is not configured on this server.');
    }
  };

  const connectPage = async (pageId) => {
    setError('');
    try {
      await socialService.selectFacebookPage({ connectionId, pageId });
      setPhase('idle');
      setPages([]);
      setConnectionId('');
      setMessage('Facebook Page connected.');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not connect that Page.');
    }
  };

  const cancelChoose = () => {
    setPhase('idle');
    setPages([]);
    setConnectionId('');
  };

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Social Publishing</h1>
      {message && <p style={{ color: '#2e7d32', marginBottom: 15 }}>{message}</p>}
      {error && <p style={{ color: '#c62828', marginBottom: 15 }}>{error}</p>}

      {phase === 'choosePage' ? (
        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Choose a Page to connect</h3>
          {pages.map((pg) => (
            <div
              key={pg.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid var(--color-separator)',
              }}
            >
              <span>{pg.name}</span>
              <button className="btn btn-primary" onClick={() => connectPage(pg.id)}>Connect</button>
            </div>
          ))}
          <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={cancelChoose}>
            Cancel
          </button>
        </div>
      ) : (
        <button
          className="btn btn-primary"
          onClick={startFacebook}
          disabled={phase === 'starting' || phase === 'completing'}
          style={{ marginBottom: 20 }}
        >
          {phase === 'completing'
            ? 'Completing…'
            : phase === 'starting'
              ? 'Redirecting…'
              : 'Connect Facebook'}
        </button>
      )}

      <div style={cardStyle}>
        <h3 style={{ marginBottom: 8 }}>Connected Accounts</h3>
        {accounts.length === 0 ? (
          <p>No accounts connected.</p>
        ) : accounts.map((a) => (
          <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-separator)' }}>
            {a.platform} — {a.accountName || a.externalPageId} ({a.status})
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSocialPage;
