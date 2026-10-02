import React from 'react';
import { FileText, Cpu, BarChart3, Database, GitMerge, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'extractor', label: 'Document Extractor', icon: FileText },
    { id: 'finetune', label: 'Fine-Tuning Studio', icon: Cpu },
    { id: 'metrics', label: 'Evaluation Metrics', icon: BarChart3 },
    { id: 'dataset', label: 'Dataset Explorer', icon: Database },
    { id: 'architecture', label: 'System Architecture', icon: GitMerge },
  ];

  return (
    <header className="glass-panel" style={{ margin: '16px 24px', padding: '16px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Project Branding Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
          }}>
            <Sparkles size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Document / Receipt Extractor
              </h1>
              <span className="pulse-badge">
                <span className="dot"></span>
                LayoutLMv3 Multimodal
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Deep Learning Token Classification & Spatial Understanding Pipeline | Team: Kabir, Sankalp, Prajot, Qusai
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.6)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="glass-button"
                style={{
                  background: isActive ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'transparent',
                  border: isActive ? 'none' : '1px solid transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '0.875rem',
                  padding: '8px 16px',
                  borderRadius: '8px'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
