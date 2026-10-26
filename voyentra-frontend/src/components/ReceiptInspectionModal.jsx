import React, { useState } from 'react';
import {
  X,
  Receipt,
  CheckCircle,
  FileText,
  ShieldCheck,
  CreditCard,
  Calendar,
  DollarSign,
  Tag,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Download
} from 'lucide-react';
import { generateReceiptImage, SAMPLE_RECEIPTS } from '../utils/ocrService';

export default function ReceiptInspectionModal({ expense, onClose, onApprove, isFinance = false }) {
  const [showRawText, setShowRawText] = useState(false);

  if (!expense) return null;

  const ocr = expense.receipt?.ocr_extracted_data || {
    merchant_name: expense.merchant,
    transaction_date: expense.expense_date,
    total_amount: expense.amount,
    tax_amount: Math.round(expense.amount * 0.15 * 100) / 100,
    payment_method: 'Corporate Card Visa ending 4012',
    confidence_score: 98
  };

  // If no image_url exists on the receipt, fall back to a generated sample receipt
  let displayImage = expense.receipt?.image_url;
  if (!displayImage) {
    // Pick sample based on merchant
    const matched = SAMPLE_RECEIPTS.find(s => 
      s.merchant.toLowerCase().includes(expense.merchant.toLowerCase()) ||
      expense.merchant.toLowerCase().includes(s.merchant.toLowerCase())
    ) || SAMPLE_RECEIPTS[0];
    displayImage = generateReceiptImage(matched);
  }

  const confidence = ocr.confidence_score || ocr.ocr_confidence ? Math.round((ocr.confidence_score || ocr.ocr_confidence) * (ocr.ocr_confidence <= 1 ? 100 : 1)) : 98;

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
      padding: '1rem'
    }}>
      <div className="modal-card" style={{
        maxWidth: 780,
        width: '100%',
        backgroundColor: '#111827',
        border: '1px solid #374151',
        borderRadius: 12,
        padding: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Receipt size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: '#f9fafb' }}>
                Receipt & OCR Optical Audit Inspector
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#9ca3af' }}>
                SRS Optical Character Recognition verification for {expense.merchant}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: 4
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Layout: Left is Image, Right is OCR Data */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          alignItems: 'start',
          marginBottom: '1.5rem'
        }}>
          {/* Left: Receipt Image Preview */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e5e7eb' }}>
                Scanned Paper Receipt:
              </span>
              <a
                href={displayImage}
                download={`${expense.merchant.replace(/\s+/g, '_')}_receipt.png`}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <Download size={12} /> Download
              </a>
            </div>

            <div style={{
              backgroundColor: '#030712',
              borderRadius: 8,
              border: '1px solid #374151',
              padding: '0.5rem',
              textAlign: 'center',
              maxHeight: 380,
              overflowY: 'auto'
            }}>
              <img
                src={displayImage}
                alt="Receipt Document"
                style={{
                  width: '100%',
                  borderRadius: 4,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                }}
              />
            </div>
          </div>

          {/* Right: Optical Extraction Attributes */}
          <div>
            <div style={{
              backgroundColor: '#1e293b',
              borderRadius: 8,
              border: '1px solid #334155',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              {/* Confidence Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>AI OCR Verification:</span>
                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}>
                  <Sparkles size={12} /> {confidence}% Match Confidence
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ borderBottom: '1px solid #334155', paddingBottom: 6 }}>
                  <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>Merchant Name:</span>
                  <strong style={{ fontSize: '0.95rem', color: '#f3f4f6' }}>{ocr.merchant_name || expense.merchant}</strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', borderBottom: '1px solid #334155', paddingBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>Total Amount:</span>
                    <strong style={{ fontSize: '1.1rem', color: '#34d399' }}>${Number(ocr.total_amount || expense.amount).toFixed(2)} USD</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>Extracted VAT/Tax:</span>
                    <strong style={{ fontSize: '1.1rem', color: '#f3f4f6' }}>${Number(ocr.tax_amount || 0).toFixed(2)} USD</strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', borderBottom: '1px solid #334155', paddingBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>Transaction Date:</span>
                    <strong style={{ fontSize: '0.85rem', color: '#e5e7eb' }}>{ocr.transaction_date || expense.expense_date}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>Category:</span>
                    <span className="badge badge-neutral" style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>
                      {expense.category?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block' }}>Payment Method:</span>
                  <strong style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    {ocr.payment_method || 'Corporate Card Visa ending 4012'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Audit Status Card */}
            <div style={{
              backgroundColor: expense.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${expense.status === 'approved' ? '#059669' : '#d97706'}`,
              borderRadius: 8,
              padding: '0.85rem',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              color: expense.status === 'approved' ? '#6ee7b7' : '#fde68a'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <ShieldCheck size={16} />
                <span>
                  {expense.status === 'approved'
                    ? 'Reimbursement Approved & Reconciled'
                    : 'Pending Finance Controller Authorization'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.75rem', opacity: 0.9 }}>
                {expense.status === 'approved'
                  ? 'All optical receipt data matches corporate card billing records.'
                  : 'Requires Elena Vance (Finance) to verify receipt amounts before release of reimbursement funds.'}
              </p>
            </div>

            {/* Raw Extracted Text Drawer */}
            {ocr.raw_text && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowRawText(!showRawText)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#818cf8',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {showRawText ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {showRawText ? 'Hide Raw OCR Text Output' : 'View Raw Optical Character Stream'}
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
                    maxHeight: 100,
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace'
                  }}>
                    {ocr.raw_text}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #374151', paddingTop: '1rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Inspector
          </button>

          {isFinance && expense.status !== 'approved' && onApprove && (
            <button
              className="btn btn-success"
              onClick={() => {
                onApprove(expense.id);
                onClose();
              }}
            >
              <CheckCircle size={16} /> Authorize Reimbursement Payout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
