import React from 'react';
import { GitMerge, Layers, Box, Cpu, ArrowDown, FileJson, CheckCircle } from 'lucide-react';

export default function ArchitectureDiagram() {
  const steps = [
    {
      title: '1. Document Image Input',
      desc: 'Invoice / Receipt PNG or JPG image uploaded into processing pipeline.',
      icon: Layers,
      color: '#3b82f6'
    },
    {
      title: '2. Preprocessing & OCR 2D Spatial Box Extraction',
      desc: 'Tokenization + word bounding boxes normalized to [0, 1000] LayoutLMv3 coordinate system.',
      icon: Box,
      color: '#8b5cf6'
    },
    {
      title: '3. LayoutLMv3 Multimodal Transformer',
      desc: 'Fuses Text Embeddings + 2D Positional Layout Embeddings + Image Patch Visual Features.',
      icon: Cpu,
      color: '#10b981'
    },
    {
      title: '4. Token Classification Head',
      desc: 'Linear Classifier + Softmax mapping contextual token vectors to BIO entity labels.',
      icon: GitMerge,
      color: '#f59e0b'
    },
    {
      title: '5. Post-Processing & Entity Aggregation',
      desc: 'Merges consecutive B/I tokens, normalizes dates/currency, and groups line items.',
      icon: CheckCircle,
      color: '#ec4899'
    },
    {
      title: '6. Structured JSON Generation',
      desc: 'Serializes extracted fields into predictable schema for ERP/database integration.',
      icon: FileJson,
      color: '#06b6d4'
    },
  ];

  return (
    <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>LayoutLMv3 System Architecture Pipeline</h2>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Section 12 & 16 Multimodal Deep Learning Information Extraction Pipeline
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '12px',
                border: `1px solid ${step.color}44`,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: `${step.color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${step.color}`
                }}>
                  <Icon size={20} color={step.color} />
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{step.title}</h3>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
