import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles,
  Zap,
  Image as ImageIcon,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { runOcrOnReceipt, generateReceiptImage, SAMPLE_RECEIPTS } from '../utils/ocrService';

export default function ReceiptScanner({ onOcrComplete, initialImage = null }) {
  const [imagePreview, setImagePreview] = useState(initialImage);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ progress: 0, message: '' });
  const [extractedData, setExtractedData] = useState(null);
  const [showRawText, setShowRawText] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  // Handle local file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setImagePreview(dataUrl);
      executeOcrScan(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Run OCR on an image
  const executeOcrScan = async (source) => {
    setScanning(true);
    setErrorMsg('');
    setExtractedData(null);

    try {
      const result = await runOcrOnReceipt(source, (prog) => {
        setScanProgress(prog);
      });

      setExtractedData(result);
      if (onOcrComplete) {
        onOcrComplete(result, source);
      }
    } catch (err) {
      setErrorMsg('Failed to read receipt: ' + err.message);
    } finally {
      setScanning(false);
    }
  };

  // Run one of the pre-set sample receipts
  const handleSampleSelect = (sample) => {
    const dataUrl = generateReceiptImage(sample);
    setImagePreview(dataUrl);
    executeOcrScan(dataUrl);
  };

  return (
    <div className="receipt-scanner-container" style={{
      backgroundColor: '#111827',
      border: '1px solid #374151',
      borderRadius: 10,
      padding: '1.25rem',
      marginBottom: '1.25rem'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            color: '#818cf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={16} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f3f4f6' }}>
              Optical Character Recognition (OCR) Scanner
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              Upload any paper receipt or pick a sample to auto-extract merchant, total & taxes
            </span>
          </div>
        </div>

        {extractedData && (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Check size={12} /> {extractedData.confidence_score}% Confidence
          </span>
        )}
      </div>

      {/* Preset Quick-Test Buttons */}
      <div style={{ marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', marginBottom: 6 }}>
          Quick Demo: Click a sample receipt to test live OCR:
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {SAMPLE_RECEIPTS.map((s) => (
            <button
              key={s.id}
              type="button"
              className="btn btn-sm btn-secondary"
              disabled={scanning}
              onClick={() => handleSampleSelect(s)}
              style={{
                fontSize: '0.75rem',
                borderColor: '#4f46e5',
                color: '#c7d2fe',
                backgroundColor: 'rgba(79, 70, 229, 0.1)'
              }}
            >
              <Zap size={12} style={{ color: '#fbbf24' }} /> {s.title} (${s.total.toFixed(2)})
            </button>
          ))}
        </div>
      </div>

      {/* Upload Dropzone & Live Preview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: imagePreview ? '140px 1fr' : '1fr',
        gap: '1rem',
        alignItems: 'center',
        border: '2px dashed #4b5563',
        borderRadius: 8,
        padding: '1rem',
        backgroundColor: '#0f172a',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {imagePreview ? (
          <>
            <div style={{ position: 'relative', height: 160, borderRadius: 6, overflow: 'hidden', border: '1px solid #334155' }}>
              <img
                src={imagePreview}
                alt="Receipt Scan"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {scanning && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(99, 102, 241, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(2px)'
                }}>
                  <RefreshCw size={24} className="animate-spin" style={{ color: '#fff' }} />
                </div>
              )}
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f3f4f6' }}>
                  Receipt Image Loaded
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  disabled={scanning}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                >
                  Change File
                </button>
              </div>

              {scanning ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#818cf8', marginBottom: 4 }}>
                    <span>{scanProgress.message || 'Scanning...'}</span>
                    <span>{Math.round((scanProgress.progress || 0) * 100)}%</span>
                  </div>
                  <div style={{ height: 6, backgroundColor: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.round((scanProgress.progress || 0) * 100)}%`,
                      backgroundColor: '#6366f1',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              ) : extractedData ? (
                <div style={{
                  backgroundColor: '#1e293b',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 6,
                  border: '1px solid #334155',
                  fontSize: '0.78rem'
                }}>
                  <div style={{ color: '#34d399', fontWeight: 600, marginBottom: 4 }}>
                    ✓ Optical Extraction Successful
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', color: '#9ca3af' }}>
                    <div>Merchant: <strong style={{ color: '#f3f4f6' }}>{extractedData.merchant_name}</strong></div>
                    <div>Total: <strong style={{ color: '#34d399' }}>${extractedData.total_amount?.toFixed(2)}</strong></div>
                    <div>VAT/Tax: <strong style={{ color: '#f3f4f6' }}>${extractedData.tax_amount?.toFixed(2)}</strong></div>
                    <div>Date: <strong style={{ color: '#f3f4f6' }}>{extractedData.transaction_date}</strong></div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  Click "Run Scan" or select another image to read.
                </div>
              )}
            </div>
          </>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: 'pointer', padding: '1rem 0' }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: '#1e293b',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem'
            }}>
              <Upload size={22} />
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f3f4f6', marginBottom: 2 }}>
              Upload Receipt Image
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              Drag & drop or click to upload PNG, JPG, or PDF
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {errorMsg && (
        <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertCircle size={14} /> {errorMsg}
        </div>
      )}

      {/* Raw Extracted Text Drawer */}
      {extractedData?.raw_text && (
        <div style={{ marginTop: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setShowRawText(!showRawText)}
            style={{
              background: 'none',
              border: 'none',
              color: '#818cf8',
              fontSize: '0.72rem',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              padding: 0
            }}
          >
            {showRawText ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showRawText ? 'Hide Raw Optical OCR Text' : 'View Raw Optical OCR Text'}
          </button>

          {showRawText && (
            <pre style={{
              marginTop: 6,
              padding: '0.65rem',
              backgroundColor: '#0a0f1d',
              border: '1px solid #1e293b',
              borderRadius: 6,
              fontSize: '0.7rem',
              color: '#cbd5e1',
              maxHeight: 120,
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace'
            }}>
              {extractedData.raw_text}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
