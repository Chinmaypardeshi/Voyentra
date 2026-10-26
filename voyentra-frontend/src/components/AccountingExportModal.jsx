import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  DollarSign,
  Check,
  Filter,
  CheckCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  exportStandardAuditCSV,
  exportQuickBooksCSV,
  exportXeroCSV
} from '../utils/accountingExporter';

export default function AccountingExportModal({ onClose, activeCurrency = 'USD' }) {
  const [format, setFormat] = useState('quickbooks'); // 'quickbooks' | 'xero' | 'standard'
  const [selectedCurrency, setSelectedCurrency] = useState(activeCurrency);
  const [selectedCostCenter, setSelectedCostCenter] = useState('all');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportedSuccess, setExportedSuccess] = useState(false);

  const fetchExportData = async (curr, cc) => {
    setLoading(true);
    try {
      let url = `/api/voyentra/accounting/export?currency=${curr}`;
      if (cc && cc !== 'all') {
        url += `&cost_center=${cc}`;
      }
      const res = await fetch(url, {
        headers: {
          'x-user-id': '44444444-aaaa-bbbb-cccc-000000000004',
          'x-user-role': 'finance'
        }
      });
      const json = await res.json();
      if (json.data?.records) {
        setRecords(json.data.records);
      }
    } catch (err) {
      console.error('Failed to load export records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExportData(selectedCurrency, selectedCostCenter);
  }, [selectedCurrency, selectedCostCenter]);

  const handleExecuteExport = () => {
    if (format === 'quickbooks') {
      exportQuickBooksCSV(records, selectedCurrency);
    } else if (format === 'xero') {
      exportXeroCSV(records, selectedCurrency);
    } else {
      exportStandardAuditCSV(records, selectedCurrency);
    }
    setExportedSuccess(true);
    setTimeout(() => setExportedSuccess(false), 3000);
  };

  const totalGross = records.reduce((sum, r) => sum + (r.converted_amount || 0), 0);
  const totalTax = records.reduce((sum, r) => sum + (r.tax_vat_amount || 0), 0);

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
        maxWidth: 860,
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
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#f9fafb' }}>
                Accounting & General Ledger (GL) Export
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#9ca3af' }}>
                SRS Section 13.6 & 19.4 • Export reconciled corporate spend to QuickBooks, Xero, or Audit CSV
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Configuration Controls */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: 8,
          border: '1px solid #334155',
          padding: '1rem',
          marginBottom: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {/* Format Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>
              Target Accounting Platform:
            </label>
            <select
              className="btn-secondary"
              style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #475569', fontSize: '0.85rem' }}
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="quickbooks">QuickBooks Journal CSV</option>
              <option value="xero">Xero Bills & Invoices CSV</option>
              <option value="standard">Standard Spend Audit CSV</option>
            </select>
          </div>

          {/* Currency Converter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>
              Reporting Currency:
            </label>
            <select
              className="btn-secondary"
              style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #475569', fontSize: '0.85rem' }}
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              <option value="USD">USD ($) - Base Currency</option>
              <option value="EUR">EUR (€) - Exchange Rate 0.92</option>
              <option value="GBP">GBP (£) - Exchange Rate 0.79</option>
              <option value="INR">INR (₹) - Exchange Rate 84.50</option>
              <option value="SGD">SGD (S$) - Exchange Rate 1.34</option>
              <option value="CAD">CAD (C$) - Exchange Rate 1.39</option>
            </select>
          </div>

          {/* Cost Center Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>
              Cost Center Scope:
            </label>
            <select
              className="btn-secondary"
              style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #475569', fontSize: '0.85rem' }}
              value={selectedCostCenter}
              onChange={(e) => setSelectedCostCenter(e.target.value)}
            >
              <option value="all">All Departmental Cost Centers</option>
              <option value="CC-ENG-101">CC-ENG-101 (Engineering)</option>
              <option value="CC-SALES-202">CC-SALES-202 (Sales)</option>
            </select>
          </div>
        </div>

        {/* Live Export Preview Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: 8,
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          fontSize: '0.82rem'
        }}>
          <div>
            <span style={{ color: '#9ca3af' }}>Ready to Export: </span>
            <strong style={{ color: '#f3f4f6' }}>{records.length} Reconciled Records</strong>
          </div>
          <div>
            <span style={{ color: '#9ca3af' }}>Total Net Gross: </span>
            <strong style={{ color: '#34d399', fontSize: '0.95rem' }}>
              {selectedCurrency} ${totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </div>
          <div>
            <span style={{ color: '#9ca3af' }}>VAT / Tax Total: </span>
            <strong style={{ color: '#fde047' }}>
              {selectedCurrency} ${totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

        {/* Live Ledger Preview Table */}
        <div style={{
          border: '1px solid #374151',
          borderRadius: 8,
          overflow: 'hidden',
          marginBottom: '1.5rem',
          maxHeight: 240,
          overflowY: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af', backgroundColor: '#1f2937' }}>
                <th style={{ padding: '0.6rem 0.85rem' }}>Ref / Date</th>
                <th style={{ padding: '0.6rem 0.85rem' }}>GL Account Code</th>
                <th style={{ padding: '0.6rem 0.85rem' }}>Payee / Merchant</th>
                <th style={{ padding: '0.6rem 0.85rem' }}>Amount ({selectedCurrency})</th>
                <th style={{ padding: '0.6rem 0.85rem' }}>Tax</th>
                <th style={{ padding: '0.6rem 0.85rem' }}>Cost Center</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '0.6rem 0.85rem' }}>
                    <div style={{ fontFamily: 'monospace', color: '#fde047', fontWeight: 600 }}>{r.transaction_id}</div>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{r.date}</div>
                  </td>
                  <td style={{ padding: '0.6rem 0.85rem' }}>
                    <strong style={{ color: '#818cf8' }}>{r.gl_account_code}</strong>
                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>{r.gl_account_name}</div>
                  </td>
                  <td style={{ padding: '0.6rem 0.85rem', color: '#f3f4f6' }}>
                    {r.payee_merchant}
                  </td>
                  <td style={{ padding: '0.6rem 0.85rem' }}>
                    <strong style={{ color: '#34d399' }}>${r.converted_amount.toFixed(2)}</strong>
                  </td>
                  <td style={{ padding: '0.6rem 0.85rem', color: '#9ca3af' }}>
                    ${r.tax_vat_amount.toFixed(2)}
                  </td>
                  <td style={{ padding: '0.6rem 0.85rem' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{r.cost_center}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {exportedSuccess && (
              <span style={{ color: '#34d399', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={16} /> File downloaded successfully to your computer!
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleExecuteExport}
              disabled={loading || records.length === 0}
              style={{ backgroundColor: '#059669', borderColor: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={16} /> Download {format.toUpperCase()} Export (.csv)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
