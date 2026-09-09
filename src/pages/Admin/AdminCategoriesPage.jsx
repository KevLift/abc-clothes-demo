import React, { useEffect, useState } from 'react';
import { productService } from '../../services/productService';
import Select from '../../components/UI/Select';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', description: '', parentId: '' });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [attrForm, setAttrForm] = useState({ key: '', label: '', type: 'TEXT', required: false, filterable: true, variantAttribute: false, displayOrder: 0 });

  const load = async () => {
    setLoading(true);
    try {
      setCategories(await productService.getCategories());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createCategory = async (e) => {
    e.preventDefault();
    if (editingId) {
      await productService.updateCategory(editingId, {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
        description: form.description,
        parentId: form.parentId || null,
      });
      setEditingId(null);
    } else {
      await productService.createCategory({
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
        description: form.description,
        parentId: form.parentId || null,
        sortOrder: 0,
      });
    }
    setForm({ name: '', slug: '', description: '', parentId: '' });
    load();
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      parentId: category.parentId || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', slug: '', description: '', parentId: '' });
  };

  const loadAttributes = async (categoryId) => {
    setSelected(categoryId);
    setAttributes(await productService.getCategoryAttributes(categoryId));
  };

  const addAttribute = async (e) => {
    e.preventDefault();
    await productService.createCategoryAttribute(selected, {
      key: attrForm.key,
      label: attrForm.label,
      type: attrForm.type,
      required: !!attrForm.required,
      filterable: !!attrForm.filterable,
      variantAttribute: !!attrForm.variantAttribute,
      displayOrder: Number(attrForm.displayOrder) || 0,
    });
    setAttrForm({ key: '', label: '', type: 'TEXT', required: false, filterable: true, variantAttribute: false, displayOrder: 0 });
    loadAttributes(selected);
  };

  return (
    <div>
      <h1 style={{ marginBottom: '10px' }}>Clothing Categories</h1>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
        No categories are preloaded. Add roots (e.g. Men, Women, Kids) and optional subcategories
        (e.g. Suits, Dresses). The storefront shows whatever you create here.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: 8 }}>
          <h3>{editingId ? 'Edit Category' : 'Create Category'}</h3>
          <form onSubmit={createCategory}>
            <input placeholder="Name (e.g. Men, Women, Suits)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ width: '100%', marginBottom: 8, padding: 8 }} />
            <input placeholder="Slug (optional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
            <Select
              fullWidth
              value={form.parentId}
              onChange={(v) => setForm({ ...form, parentId: v })}
              style={{ marginBottom: 8 }}
              placeholder="Root category (no parent)"
              options={[
                { value: '', label: 'Root category (no parent)' },
                ...categories.filter((c) => c.id !== editingId).map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" type="submit">{editingId ? 'Save Changes' : 'Create'}</button>
              {editingId && (
                <button type="button" className="btn btn-outline" onClick={cancelEdit}>Cancel</button>
              )}
            </div>
          </form>
          <h3 style={{ marginTop: 20 }}>All Categories</h3>
          {loading ? <p>Loading...</p> : categories.length === 0 ? (
            <p style={{ color: '#888', fontSize: 14 }}>No categories yet — create your first clothing category above.</p>
          ) : categories.map((c) => {
            const parent = categories.find((p) => p.id === c.parentId);
            return (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span>
                  {parent ? `${parent.name} › ` : ''}{c.name}{' '}
                  <small>({c.slug})</small>
                </span>
                <span>
                  <button onClick={() => startEdit(c)} style={{ marginRight: 8 }}>Edit</button>
                  <button onClick={() => loadAttributes(c.id)} style={{ marginRight: 8 }}>Attributes</button>
                  <button onClick={async () => { await productService.deleteCategory(c.id); load(); }} style={{ color: 'red' }}>Delete</button>
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: 8 }}>
          <h3>Attributes {selected ? '' : '(select a category)'}</h3>
          {selected && (
            <>
              <form onSubmit={addAttribute} style={{ marginBottom: 15 }}>
                <input placeholder="Key" value={attrForm.key} onChange={(e) => setAttrForm({ ...attrForm, key: e.target.value })} required style={{ width: '100%', marginBottom: 8, padding: 8 }} />
                <input placeholder="Label" value={attrForm.label} onChange={(e) => setAttrForm({ ...attrForm, label: e.target.value })} required style={{ width: '100%', marginBottom: 8, padding: 8 }} />
                <Select
                  fullWidth
                  value={attrForm.type}
                  onChange={(v) => setAttrForm({ ...attrForm, type: v })}
                  style={{ marginBottom: 8 }}
                  options={[
                    { value: 'TEXT', label: 'Text' },
                    { value: 'NUMBER', label: 'Number' },
                    { value: 'SELECT', label: 'Select' },
                    { value: 'BOOLEAN', label: 'Boolean' },
                  ]}
                />
                <button className="btn btn-primary" type="submit">Add Attribute</button>
              </form>
              {attributes.map((a) => (
                <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  {a.label || a.name} ({a.key || a.code}) — {a.type}
                  <button style={{ marginLeft: 10, color: 'red' }} onClick={async () => {
                    await productService.deleteCategoryAttribute(a.id);
                    loadAttributes(selected);
                  }}>Delete</button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
