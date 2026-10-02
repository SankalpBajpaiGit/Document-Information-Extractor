import React, { useRef } from 'react';
import { UploadCloud, FileCheck, Layers, Image as ImageIcon } from 'lucide-react';

export default function UploadZone({ onUpload, onSelectSample, isLoading }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Upload Box */}
      <div
        className="glass-panel"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        style={{
          padding: '36px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          border: '2px dashed rgba(59, 130, 246, 0.4)',
          background: 'rgba(15, 23, 42, 0.4)',
          transition: 'all 0.3s ease'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,.pdf"
          style={{ display: 'none' }}
        />

        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 16px',
          borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          <UploadCloud size={32} color="#3b82f6" />
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
          Upload Invoice or Receipt Image
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Drag & drop your document here, or <span style={{ color: '#3b82f6', textDecoration: 'underline' }}>browse file</span>
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          <span>Formats: PNG, JPG, WEBP, PDF</span>
          <span>•</span>
          <span>Resolution: Up to 4K</span>
          <span>•</span>
          <span>Max Size: 25MB</span>
        </div>
      </div>

      {/* Preset Sample Selector */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#8b5cf6" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Quick Demo Preset Samples</h4>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Pre-annotated CORD/FUNSD dataset examples</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          {[1, 2, 3, 4, 5].map((id) => (
            <button
              key={id}
              onClick={() => onSelectSample(`invoice_${id < 10 ? '00' + id : id}`)}
              disabled={isLoading}
              className="glass-button"
              style={{
                padding: '10px 12px',
                fontSize: '0.8rem',
                justifyContent: 'center',
                background: 'rgba(30, 41, 59, 0.5)'
              }}
            >
              <ImageIcon size={14} color="#38bdf8" />
              Invoice #{id < 10 ? '0' + id : id}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
