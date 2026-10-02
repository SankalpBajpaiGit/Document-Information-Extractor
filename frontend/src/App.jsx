import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UploadZone from './components/UploadZone';
import BoundingBoxViewer from './components/BoundingBoxViewer';
import JsonOutputViewer from './components/JsonOutputViewer';
import FieldEditor from './components/FieldEditor';
import FineTuneDashboard from './components/FineTuneDashboard';
import MetricsReport from './components/MetricsReport';
import DatasetExplorer from './components/DatasetExplorer';
import ArchitectureDiagram from './components/ArchitectureDiagram';

export default function App() {
  const [activeTab, setActiveTab] = useState('extractor');
  const [isLoading, setIsLoading] = useState(false);

  // Extraction results state
  const [imageSrc, setImageSrc] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [extractedData, setExtractedData] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 1100 });

  // Initial load: Fetch preset sample invoice_001
  useEffect(() => {
    loadPresetSample('invoice_001');
  }, []);

  const loadPresetSample = async (sampleId) => {
    setIsLoading(true);
    try {
      // First get sample file info from backend
      const response = await fetch(`/api/samples`);
      const data = await response.json();
      const match = data.samples?.find((s) => s.id === sampleId) || data.samples?.[0];

      if (match) {
        // Trigger extraction on backend
        const extractRes = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sample_id: match.id })
        });
        const extData = await extractRes.json();

        if (extData.success) {
          setImageSrc(extData.image_base64);
          setTokens(extData.tokens || []);
          setExtractedData(extData.extracted_data);
          setDimensions(extData.image_dimensions || { width: 800, height: 1100 });
        }
      }
    } catch (e) {
      console.error('Sample load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (data.success) {
        setImageSrc(data.image_base64);
        setTokens(data.tokens || []);
        setExtractedData(data.extracted_data);
        setDimensions(data.image_dimensions || { width: 800, height: 1100 });
      }
    } catch (e) {
      console.error('File upload extraction error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1, padding: '0 24px 32px 24px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        
        {/* Tab 1: Extractor Pipeline Main View */}
        {activeTab === 'extractor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <UploadZone
              onUpload={handleFileUpload}
              onSelectSample={loadPresetSample}
              isLoading={isLoading}
            />

            {isLoading && (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid rgba(59, 130, 246, 0.3)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Running LayoutLMv3 OCR & Multimodal Token Classification Pipeline...
                </p>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {!isLoading && extractedData && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px' }}>
                <BoundingBoxViewer
                  imageSrc={imageSrc}
                  tokens={tokens}
                  dimensions={dimensions}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <JsonOutputViewer data={extractedData} />
                  <FieldEditor initialData={extractedData} onSave={(updated) => setExtractedData(updated)} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Fine-Tuning Studio */}
        {activeTab === 'finetune' && <FineTuneDashboard />}

        {/* Tab 3: Evaluation Metrics Report */}
        {activeTab === 'metrics' && <MetricsReport />}

        {/* Tab 4: CORD Dataset Explorer */}
        {activeTab === 'dataset' && <DatasetExplorer />}

        {/* Tab 5: System Architecture Diagram */}
        {activeTab === 'architecture' && <ArchitectureDiagram />}

      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '20px 24px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        Document / Receipt Information Extractor Using LayoutLMv3 and Vision Transformers • Manipal Institute of Technology
      </footer>
    </div>
  );
}
