import React, { useState } from 'react';
import { Cpu, Play, CheckCircle, TrendingDown, Award, Zap } from 'lucide-react';

export default function FineTuneDashboard() {
  const [epochs, setEpochs] = useState(5);
  const [learningRate, setLearningRate] = useState('2e-5');
  const [batchSize, setBatchSize] = useState(4);
  const [optimizer, setOptimizer] = useState('AdamW');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [trainingComplete, setTrainingComplete] = useState(false);

  const startTraining = async () => {
    setIsTraining(true);
    setTrainingLogs([]);
    setTrainingComplete(false);

    try {
      const response = await fetch('/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ epochs, learningRate, batchSize, optimizer })
      });
      const data = await response.json();

      if (data.history) {
        const logs = data.history.epochs.map((ep, i) => ({
          epoch: ep,
          trainLoss: data.history.train_loss[i],
          valLoss: data.history.val_loss[i],
          f1: data.history.f1_score[i],
          accuracy: data.history.field_accuracy[i]
        }));
        setTrainingLogs(logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTraining(false);
      setTrainingComplete(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Hyperparameters Config Header */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={22} color="#3b82f6" />
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>LayoutLMv3 Fine-Tuning Studio</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Section 17.2 Hyperparameter Configuration & PyTorch Backpropagation Loop
              </p>
            </div>
          </div>

          <button
            onClick={startTraining}
            disabled={isTraining}
            className="glass-button primary"
            style={{ padding: '10px 22px', fontSize: '0.9rem' }}
          >
            {isTraining ? <Zap size={16} className="animate-spin" /> : <Play size={16} />}
            {isTraining ? 'Fine-Tuning Model...' : 'Start Model Fine-Tuning'}
          </button>
        </div>

        {/* Hyperparameter Settings Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Learning Rate</label>
            <input
              type="text"
              value={learningRate}
              onChange={(e) => setLearningRate(e.target.value)}
              style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Batch Size</label>
            <input
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value))}
              style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Epochs</label>
            <input
              type="number"
              value={epochs}
              onChange={(e) => setEpochs(parseInt(e.target.value))}
              style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Optimizer</label>
            <select
              value={optimizer}
              onChange={(e) => setOptimizer(e.target.value)}
              style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.875rem' }}
            >
              <option value="AdamW">AdamW (Recommended)</option>
              <option value="Adam">Adam</option>
              <option value="SGD">SGD with Momentum</option>
            </select>
          </div>
        </div>
      </div>

      {/* Training Loss & F1 Score Metrics Progress */}
      {trainingLogs.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingDown size={18} color="#10b981" />
            Loss Convergence & Accuracy Progression
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {trainingLogs.map((log) => (
              <div key={log.epoch} style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Epoch {log.epoch}</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#60a5fa', marginTop: '4px' }}>Loss: {log.trainLoss}</div>
                <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '2px' }}>F1: {log.f1} ({log.accuracy}%)</div>
              </div>
            ))}
          </div>

          {trainingComplete && (
            <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.12)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award size={20} color="#34d399" />
              <span style={{ fontSize: '0.9rem', color: '#34d399', fontWeight: 600 }}>
                Fine-tuning successfully completed! Model weights updated in output directory.
              </span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
