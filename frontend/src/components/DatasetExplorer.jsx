import React, { useState, useEffect } from 'react';
import { Database, Image as ImageIcon, FileText, Download } from 'lucide-react';

export default function DatasetExplorer() {
  const [samples, setSamples] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);

  useEffect(() => {
    fetch('/api/samples')
      .then((res) => res.json())
      .then((data) => {
        if (data.samples && data.samples.length > 0) {
          setSamples(data.samples);
          setSelectedSample(data.samples[0]);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
      
      {/* Sample Sidebar List */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Database size={18} color="#38bdf8" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>CORD/FUNSD Dataset</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {samples.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSample(s)}
              className="glass-button"
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                padding: '10px 14px',
                background: selectedSample?.id === s.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.4)',
                borderColor: selectedSample?.id === s.id ? '#38bdf8' : 'transparent',
                fontSize: '0.85rem'
              }}
            >
              <ImageIcon size={14} color="#38bdf8" />
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Detail Inspector View */}
      {selectedSample && (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{selectedSample.title}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>ID: {selectedSample.id}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Image Preview */}
            <div style={{ borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', background: '#000' }}>
              <img
                src={selectedSample.image_url}
                alt={selectedSample.title}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            {/* Ground Truth JSON View */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>Ground Truth Annotations</h4>
              <pre style={{
                background: '#040711',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                color: '#34d399',
                height: '450px',
                overflow: 'auto'
              }}>
                {JSON.stringify(selectedSample.ground_truth, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
