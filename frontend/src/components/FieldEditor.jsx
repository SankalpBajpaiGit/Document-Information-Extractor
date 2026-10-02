import React, { useState, useEffect } from 'react';
import { Edit3, Save, CheckCircle, RefreshCw } from 'lucide-react';

export default function FieldEditor({ initialData, onSave }) {
  const [formData, setFormData] = useState(initialData || {});

  useEffect(() => {
    setFormData(initialData || {});
  }, [initialData]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (onSave) onSave(formData);
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Edit3 size={18} color="#f59e0b" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Human-in-the-Loop Verification & Editor</h3>
        </div>

        <button onClick={handleSave} className="glass-button primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
          <Save size={14} />
          Save & Verify Schema
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
        {[
          { key: 'vendor_name', label: 'Vendor Name' },
          { key: 'invoice_number', label: 'Invoice Number' },
          { key: 'date', label: 'Date' },
          { key: 'customer_name', label: 'Customer Name' },
          { key: 'subtotal', label: 'Subtotal ($)', type: 'number' },
          { key: 'tax', label: 'Tax ($)', type: 'number' },
          { key: 'total', label: 'Total Amount ($)', type: 'number' },
          { key: 'payment_method', label: 'Payment Method' },
        ].map((field) => (
          <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {field.label}
            </label>
            <input
              type={field.type || 'text'}
              value={formData[field.key] !== undefined ? formData[field.key] : ''}
              onChange={(e) => handleChange(field.key, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid var(--border-color)',
                color: '#ffffff',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
