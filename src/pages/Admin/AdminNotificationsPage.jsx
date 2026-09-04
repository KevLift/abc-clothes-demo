import React, { useEffect, useState } from 'react';
import { notificationService } from '../../services/notificationService';

const AdminNotificationsPage = () => {
  const [failed, setFailed] = useState([]);

  const load = async () => {
    setFailed(await notificationService.getFailed());
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Failed Notifications</h1>
      {failed.length === 0 ? <p>No failed notifications.</p> : failed.map((n) => (
        <div key={n.id} style={{ background: 'white', padding: 16, borderRadius: 8, marginBottom: 10 }}>
          <strong>{n.title || n.type}</strong>
          <p>{n.message || n.body}</p>
          <button className="btn btn-primary" onClick={async () => { await notificationService.retry(n.id); load(); }}>
            Retry
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminNotificationsPage;
