import React, { useState } from 'react';
import { Copy, Check, Download, Code, CheckCircle2, ShoppingBag } from 'lucide-react';

export default function JsonOutputViewer({ data }) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'raw'

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extraction_${data?.invoice_number || 'result'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Header Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code size={18} color="#10b981" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Extracted Structured Information</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setViewMode('summary')}
            className="glass-button"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              background: viewMode === 'summary' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              borderColor: viewMode === 'summary' ? '#10b981' : 'transparent'
            }}
          >
            Structured Summary
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className="glass-button"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              background: viewMode === 'raw' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              borderColor: viewMode === 'raw' ? '#10b981' : 'transparent'
            }}
          >
            JSON Schema
          </button>

          <button onClick={handleCopy} className="glass-button" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={handleDownload} className="glass-button primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <Download size={14} />
            Export JSON
          </button>
        </div>
      </div>

      {/* View Mode: Structured Summary */}
      {viewMode === 'summary' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Key Fields Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vendor Name</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px', color: '#c084fc' }}>
                {data?.vendor_name || 'N/A'}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{data?.vendor_email || data?.vendor_phone || ''}</span>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Invoice Number</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px', color: '#60a5fa' }}>
                {data?.invoice_number || 'N/A'}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Date: {data?.date || 'N/A'}</span>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Billed Customer</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px', color: '#fbbf24' }}>
                {data?.customer_name || 'N/A'}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{data?.customer_address || ''}</span>
            </div>

            <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <span style={{ fontSize: '0.75rem', color: '#86efac' }}>Total Amount</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px', color: '#4ade80' }}>
                ${data?.total?.toFixed(2) || '0.00'}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Subtotal: ${data?.subtotal?.toFixed(2)} | Tax: ${data?.tax?.toFixed(2)}</span>
            </div>
          </div>

          {/* Line Items Table */}
          {data?.items && data.items.length > 0 && (
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: 'rgba(30, 41, 59, 0.6)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <ShoppingBag size={16} color="#ec4899" />
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Line Items Array</h4>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(30, 41, 59, 0.3)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 16px' }}>Description</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right' }}>Price ($)</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right' }}>Amount ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: '#f8fafc' }}>{item.description}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>{item.quantity}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', color: 'var(--text-muted)' }}>${item.price?.toFixed(2)}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 700, color: '#34d399' }}>${item.amount?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      ) : (
        /* View Mode: Raw JSON Code Editor */
        <pre style={{
          background: '#040711',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: '#38bdf8',
          maxHeight: '450px',
          overflow: 'auto'
        }}>
          {jsonString}
        </pre>
      )}

    </div>
  );
}
