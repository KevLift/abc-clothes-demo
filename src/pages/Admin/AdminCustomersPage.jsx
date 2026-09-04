import React, { useEffect, useState } from 'react';
import { customerService } from '../../services/customerService';

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const page = await customerService.list({ query, page: 0, size: 50 });
    setCustomers(page.content || []);
  };

  useEffect(() => { load(); }, []);

  const act = async (id, action) => {
    if (action === 'ban') await customerService.ban(id);
    if (action === 'suspend') await customerService.suspend(id);
    if (action === 'reactivate') await customerService.reactivate(id);
    load();
    if (selected?.id === id) setSelected(await customerService.getById(id));
  };

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Customers</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 15 }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." style={{ padding: 8, flex: 1 }} />
        <button className="btn btn-primary" onClick={load}>Search</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1.2fr 1fr' : '1fr', gap: 20 }}>
        <div style={{ background: 'white', borderRadius: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: 12, textAlign: 'left' }}>Email</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Name</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 12 }}>{c.email}</td>
                  <td style={{ padding: 12 }}>{c.firstName} {c.lastName}</td>
                  <td style={{ padding: 12 }}>{c.status || c.accountStatus || 'ACTIVE'}</td>
                  <td style={{ padding: 12 }}>
                    <button onClick={async () => setSelected(await customerService.getById(c.id))} style={{ color: '#3498db', background: 'none', border: 'none', cursor: 'pointer' }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selected && (
          <div style={{ background: 'white', padding: 20, borderRadius: 8 }}>
            <h3>{selected.email}</h3>
            <p>{selected.firstName} {selected.lastName}</p>
            <p>Status: {selected.status || selected.accountStatus}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 15 }}>
              <button className="btn btn-outline" onClick={() => act(selected.id, 'suspend')}>Suspend</button>
              <button className="btn btn-outline" onClick={() => act(selected.id, 'ban')}>Ban</button>
              <button className="btn btn-outline" onClick={() => act(selected.id, 'reactivate')}>Reactivate</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomersPage;
