import React, { useRef, useEffect, useState } from 'react';
import { Eye, EyeOff, Tag, ZoomIn, ZoomOut } from 'lucide-react';

const LABEL_COLORS = {
  'VENDOR_NAME': '#a855f7',
  'VENDOR_ADDRESS': '#c084fc',
  'VENDOR_PHONE': '#e879f9',
  'VENDOR_EMAIL': '#f0abfc',
  'INVOICE_NUMBER': '#3b82f6',
  'DATE': '#0284c7',
  'CUSTOMER_NAME': '#f59e0b',
  'CUSTOMER_ADDRESS': '#fbbf24',
  'SUBTOTAL': '#10b981',
  'TAX': '#14b8a6',
  'TOTAL': '#22c55e',
  'PAYMENT_METHOD': '#6366f1',
  'ITEM_DESCRIPTION': '#ec4899',
  'ITEM_QTY': '#f43f5e',
  'ITEM_PRICE': '#fb7185',
  'ITEM_AMOUNT': '#fda4af',
  'DEFAULT': '#94a3b8'
};

export default function BoundingBoxViewer({ imageSrc, tokens, dimensions }) {
  const canvasRef = useRef(null);
  const [showBoxes, setShowBoxes] = useState(true);
  const [selectedLabel, setSelectedLabel] = useState('ALL');
  const [hoveredToken, setHoveredToken] = useState(null);

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 1100;

      // Draw background document image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (!showBoxes || !tokens) return;

      // Draw bounding boxes over canvas
      tokens.forEach((t) => {
        const label = t.predicted_label || t.label || 'O';
        if (label === 'O') return;

        const cleanLabel = label.replace(/^[BI]-/, '');
        if (selectedLabel !== 'ALL' && cleanLabel !== selectedLabel) return;

        const color = LABEL_COLORS[cleanLabel] || LABEL_COLORS.DEFAULT;
        const box = t.original_box || [
          (t.box[0] / 1000) * canvas.width,
          (t.box[1] / 1000) * canvas.height,
          (t.box[2] / 1000) * canvas.width,
          (t.box[3] / 1000) * canvas.height
        ];

        const [x0, y0, x1, y1] = box;
        const w = Math.max(1, x1 - x0);
        const h = Math.max(1, y1 - y0);

        // Bounding box fill & outline
        ctx.fillStyle = `${color}22`;
        ctx.fillRect(x0, y0, w, h);

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x0, y0, w, h);

        // Small entity label tag
        ctx.fillStyle = color;
        ctx.font = 'bold 11px sans-serif';
        const tagText = `${cleanLabel}`;
        const textWidth = ctx.measureText(tagText).width;

        ctx.fillRect(x0, Math.max(0, y0 - 16), textWidth + 8, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(tagText, x0 + 4, Math.max(12, y0 - 4));
      });
    };
  }, [imageSrc, tokens, showBoxes, selectedLabel]);

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Viewer Toolbar Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tag size={18} color="#3b82f6" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Document ROI Bounding Box Layer</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              color: '#ffffff',
              border: '1px solid var(--border-color)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              outline: 'none'
            }}
          >
            <option value="ALL">Filter: All Entity Tags</option>
            <option value="VENDOR_NAME">Vendor Name</option>
            <option value="INVOICE_NUMBER">Invoice Number</option>
            <option value="DATE">Date</option>
            <option value="CUSTOMER_NAME">Customer Name</option>
            <option value="TOTAL">Total Amount</option>
          </select>

          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className="glass-button"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            {showBoxes ? <EyeOff size={14} /> : <Eye size={14} />}
            {showBoxes ? 'Hide BBoxes' : 'Show BBoxes'}
          </button>
        </div>
      </div>

      {/* Interactive Canvas Container */}
      <div style={{
        position: 'relative',
        maxHeight: '650px',
        overflow: 'auto',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        background: '#090d16',
        display: 'flex',
        justifyContent: 'center',
        padding: '12px'
      }}>
        <canvas
          ref={canvasRef}
          style={{
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
          }}
        />
      </div>

      {/* Entity Color Legend Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.75rem', marginTop: '4px' }}>
        {[
          { label: 'Vendor', color: '#a855f7' },
          { label: 'Invoice #', color: '#3b82f6' },
          { label: 'Date', color: '#0284c7' },
          { label: 'Customer', color: '#f59e0b' },
          { label: 'Subtotal/Tax', color: '#10b981' },
          { label: 'Total', color: '#22c55e' },
          { label: 'Line Item', color: '#ec4899' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }}></span>
            <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
