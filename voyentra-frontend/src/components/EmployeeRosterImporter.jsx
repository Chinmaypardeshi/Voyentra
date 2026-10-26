import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Users,
  Send,
  Trash2,
  RefreshCw,
  Download
} from 'lucide-react';

const SAMPLE_ROSTER_DATA = [
  { first_name: 'Sophia', last_name: 'Taylor', email: 'sophia.taylor@voyentra.com', role: 'traveler', department: 'Engineering & Technology', cost_center: 'CC-ENG-101' },
  { first_name: 'Marcus', last_name: 'Chen', email: 'marcus.chen@voyentra.com', role: 'manager', department: 'Engineering & Technology', cost_center: 'CC-ENG-101' },
  { first_name: 'Rachel', last_name: 'Kim', email: 'rachel.kim@voyentra.com', role: 'finance_manager', department: 'Global Sales & Customer Success', cost_center: 'CC-SALES-201' },
  { first_name: 'Liam', last_name: 'O\'Connor', email: 'liam.oconnor@voyentra.com', role: 'traveler', department: 'Executive Operations', cost_center: 'CC-OPS-301' },
  { first_name: 'Zoe', last_name: 'Patel', email: 'zoe.patel@voyentra.com', role: 'traveler', department: 'Global Sales & Customer Success', cost_center: 'CC-SALES-201' }
];

export default function EmployeeRosterImporter({ onEmployeesInvited }) {
  const [parsedRows, setParsedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleLoadSample = () => {
    setParsedRows(SAMPLE_ROSTER_DATA);
    setStatusMessage({ type: 'info', text: 'Loaded sample enterprise roster (5 corporate employees). Ready to dispatch.' });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        setStatusMessage({ type: 'error', text: 'CSV file is empty or only contains headers.' });
        return;
      }

      const rows = [];
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
        if (parts.length >= 3) {
          rows.push({
            first_name: parts[0] || 'Team',
            last_name: parts[1] || 'Member',
            email: parts[2] || '',
            role: parts[3] || 'traveler',
            department: parts[4] || 'Engineering',
            cost_center: parts[5] || 'CC-ENG-101'
          });
        }
      }

      setParsedRows(rows);
      setStatusMessage({ type: 'info', text: `Parsed ${rows.length} employee records from ${file.name}.` });
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setParsedRows([]);
    setStatusMessage(null);
  };

  const handleDispatchInvites = async () => {
    if (parsedRows.length === 0) return;
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/voyentra/admin/employees/bulk-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '55555555-aaaa-bbbb-cccc-000000000005',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({ employees: parsedRows })
      });

      const json = await res.json();
      if (!res.ok || json.status === 'error') {
        throw new Error(json.message || 'Failed to dispatch employee invitations.');
      }

      setStatusMessage({
        type: 'success',
        text: `✓ Successfully provisioned ${json.data?.invited_count || parsedRows.length} corporate employee accounts and dispatched welcome emails!`
      });

      if (onEmployeesInvited) {
        onEmployeesInvited(json.data?.employees || []);
      }
      setParsedRows([]);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const downloadCSVTemplate = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      'first_name,last_name,email,role,department,cost_center\n' +
      'John,Doe,john.doe@company.com,traveler,Engineering,CC-ENG-101\n' +
      'Jane,Smith,jane.smith@company.com,manager,Sales,CC-SALES-201\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'voyentra_employee_roster_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: '#f9fafb', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} style={{ color: '#818cf8' }} />
            Bulk Employee Onboarding & CSV Roster Importer
          </h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af', marginTop: 2 }}>
            SRS Section 21 / FR-280 to FR-310 • Bulk invite employees, assign RBAC roles, and map cost centers in one click.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={downloadCSVTemplate}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}
          >
            <Download size={13} /> Download CSV Template
          </button>
          <button
            type="button"
            onClick={handleLoadSample}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}
          >
            <FileSpreadsheet size={13} /> Load Sample Roster (5 Employees)
          </button>
        </div>
      </div>

      {statusMessage && (
        <div style={{
          padding: '0.75rem',
          borderRadius: 8,
          marginBottom: '1rem',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' :
            (statusMessage.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)'),
          border: `1px solid ${statusMessage.type === 'success' ? '#10b981' : (statusMessage.type === 'error' ? '#ef4444' : '#6366f1')}`,
          color: statusMessage.type === 'success' ? '#34d399' : (statusMessage.type === 'error' ? '#fca5a5' : '#818cf8')
        }}>
          {statusMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Upload Zone */}
      {parsedRows.length === 0 ? (
        <div style={{
          border: '2px dashed #374151',
          borderRadius: 8,
          padding: '1.75rem',
          textAlign: 'center',
          backgroundColor: '#111827',
          cursor: 'pointer'
        }}>
          <input
            type="file"
            accept=".csv,text/csv"
            id="csv-file-input"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <label htmlFor="csv-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Upload size={32} style={{ color: '#818cf8' }} />
            <div style={{ fontWeight: 600, color: '#f3f4f6', fontSize: '0.95rem' }}>
              Drag & Drop Corporate Roster CSV or <span style={{ color: '#818cf8', textDecoration: 'underline' }}>Browse File</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              Columns required: <code>first_name, last_name, email, role, department, cost_center</code>
            </div>
          </label>
        </div>
      ) : (
        /* Parsed Preview Table */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
              Previewing <strong>{parsedRows.length}</strong> employee accounts to provision:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
              >
                <Trash2 size={13} /> Clear
              </button>
              <button
                type="button"
                onClick={handleDispatchInvites}
                disabled={loading}
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600 }}
              >
                <Send size={13} /> {loading ? 'Dispatching...' : `Dispatch ${parsedRows.length} Invitations`}
              </button>
            </div>
          </div>

          <div className="table-container" style={{ maxHeight: 280, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af', backgroundColor: '#1f2937' }}>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Full Name</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Corporate Email</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>RBAC Role</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Department & Cost Center</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Validation Status</th>
                </tr>
              </thead>
              <tbody>
                {parsedRows.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #283548' }}>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, color: '#f3f4f6' }}>
                      {row.first_name} {row.last_name}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                      {row.email}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                        {row.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#9ca3af' }}>
                      {row.department} • <strong style={{ color: '#818cf8' }}>{row.cost_center}</strong>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        ✓ Ready
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
