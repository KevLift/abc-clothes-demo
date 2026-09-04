import React, { useEffect, useState } from 'react';
import { memberService } from '../../services/memberService';

const AdminTeamPage = () => {
  const [members, setMembers] = useState([]);
  const [delegatable, setDelegatable] = useState([]);
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', password: '' });
  const [selected, setSelected] = useState(null);
  const [perms, setPerms] = useState([]);

  const load = async () => {
    const [page, dels] = await Promise.all([
      memberService.list({ page: 0, size: 50 }),
      memberService.getDelegatable(),
    ]);
    setMembers(page.content || []);
    setDelegatable(Array.isArray(dels) ? dels : []);
  };

  useEffect(() => { load(); }, []);

  const addMember = async (e) => {
    e.preventDefault();
    await memberService.add(form);
    setForm({ email: '', firstName: '', lastName: '', password: '' });
    load();
  };

  const openMember = async (member) => {
    setSelected(member);
    const list = await memberService.getPermissions(member.id);
    setPerms(list.map((p) => (typeof p === 'string' ? p : p.permission || p.key)).filter(Boolean));
  };

  const togglePerm = async (permission) => {
    if (!selected) return;
    if (perms.includes(permission)) {
      await memberService.revokePermission(selected.id, permission);
    } else {
      await memberService.grantPermission(selected.id, permission);
    }
    openMember(selected);
  };

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Team Members</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: 'white', padding: 20, borderRadius: 8 }}>
          <h3>Add Member</h3>
          <form onSubmit={addMember}>
            {['email', 'firstName', 'lastName', 'password'].map((k) => (
              <input
                key={k}
                type={k === 'password' ? 'password' : 'text'}
                placeholder={k}
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                required
                style={{ width: '100%', padding: 8, marginBottom: 8 }}
              />
            ))}
            <button className="btn btn-primary" type="submit">Add</button>
          </form>
          <h3 style={{ marginTop: 20 }}>Members</h3>
          {members.map((m) => (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span>{m.email}</span>
              <span>
                <button onClick={() => openMember(m)}>Permissions</button>
                <button style={{ color: 'red', marginLeft: 8 }} onClick={async () => { await memberService.remove(m.id); load(); }}>Remove</button>
              </span>
            </div>
          ))}
        </div>
        <div style={{ background: 'white', padding: 20, borderRadius: 8 }}>
          <h3>Permissions {selected ? `for ${selected.email}` : ''}</h3>
          {!selected ? <p>Select a member</p> : delegatable.map((p) => (
            <label key={p} style={{ display: 'block', marginBottom: 8 }}>
              <input type="checkbox" checked={perms.includes(p)} onChange={() => togglePerm(p)} /> {p}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminTeamPage;
