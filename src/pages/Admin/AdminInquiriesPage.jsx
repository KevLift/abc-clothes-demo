import React, { useEffect, useState } from 'react';
import { inquiryService } from '../../services/inquiryService';
import Select from '../../components/UI/Select';

const AdminInquiriesPage = () => {
  const [type, setType] = useState('');
  const [items, setItems] = useState([]);

  const load = async () => {
    const page = await inquiryService.list({ type: type || undefined, page: 0, size: 50 });
    setItems(page.content || []);
  };

  useEffect(() => { load(); }, [type]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1>Inquiries</h1>
        <Select
          value={type}
          onChange={setType}
          aria-label="Filter inquiries by type"
          options={[
            { value: '', label: 'All' },
            { value: 'CONTACT', label: 'Contact' },
            { value: 'NEWSLETTER', label: 'Newsletter' },
          ]}
        />
      </div>
      <div style={{ background: 'white', borderRadius: 8 }}>
        {items.length === 0 ? (
          <p style={{ padding: 20 }}>No inquiries.</p>
        ) : items.map((item) => (
          <div key={item.id} style={{ padding: 16, borderBottom: '1px solid #eee' }}>
            <strong>{item.type}</strong> — {item.email}
            {item.name && <div>{item.name}</div>}
            {item.subject && <div><em>{item.subject}</em></div>}
            {item.message && <p style={{ marginTop: 8 }}>{item.message}</p>}
            <small>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminInquiriesPage;
