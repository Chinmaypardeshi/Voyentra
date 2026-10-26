import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  FileText,
  DollarSign,
  PieChart,
  Check,
  X,
  AlertTriangle,
  Clock,
  Briefcase,
  MapPin,
  Calendar,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import DutyOfCareCenter from './DutyOfCareCenter';

export default function ManagerDashboard({
  currentUser,
  approvals = [],
  trips = [],
  travelRequests = [],
  stats,
  onDecideApproval,
  loading
}) {
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals' | 'team_trips' | 'team_requests'
  const [approvalModalItem, setApprovalModalItem] = useState(null);
  const [approvalDecision, setApprovalDecision] = useState('approved');
  const [approvalReason, setApprovalReason] = useState('');

  const pendingApprovals = approvals.filter(a => a.decision === 'pending');
  const pendingCount = pendingApprovals.length;

  const handleOpenDecisionModal = (item, decision) => {
    setApprovalModalItem(item);
    setApprovalDecision(decision);
    setApprovalReason(
      decision === 'approved'
        ? 'Approved per Q4 client delivery commitments'
        : 'Exceeds budget cap; please select in-policy alternative'
    );
  };

  const handleConfirmDecision = () => {
    if (!approvalModalItem) return;
    onDecideApproval({
      approvalId: approvalModalItem.id,
      decision: approvalDecision,
      reason: approvalReason
    });
    setApprovalModalItem(null);
    setActiveTab('team_trips');
  };

  return (
    <>
      {/* Manager Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`nav-tab ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          <ShieldCheck size={16} /> Pending Travel Approvals
          {pendingCount > 0 && (
            <span className="badge badge-warning" style={{ marginLeft: 6, padding: '0.15rem 0.5rem' }}>
              {pendingCount} Action Needed
            </span>
          )}
        </button>
        <button
          className={`nav-tab ${activeTab === 'team_trips' ? 'active' : ''}`}
          onClick={() => setActiveTab('team_trips')}
        >
          <Users size={16} /> Team Travel & Duty of Care
        </button>
        <button
          className={`nav-tab ${activeTab === 'team_requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('team_requests')}
        >
          <FileText size={16} /> Request History Audit
        </button>
      </div>

      <main className="main-content">
        {/* Manager Command Metrics Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <ShieldCheck size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{pendingCount} Action Needed</div>
              <div className="stat-label">Pending Approval Requests</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Users size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{trips.length} Active</div>
              <div className="stat-label">Engineering Team Trips</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <DollarSign size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">${Number(stats?.cost_centers?.[0]?.spent || 15680).toLocaleString()}</div>
              <div className="stat-label">Engineering Spend YTD</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
              <PieChart size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">$34,320 Available</div>
              <div className="stat-label">Cost Center CC-ENG-101</div>
            </div>
          </div>
        </div>

        {/* TAB 1: PENDING APPROVALS QUEUE */}
        {activeTab === 'approvals' && (
          <div>
            <div className="page-header">
              <div>
                <h2 className="page-title">Engineering Travel Approval Queue</h2>
                <p className="page-subtitle">
                  Review out-of-policy travel requests requiring managerial authorization before corporate card checkout.
                </p>
              </div>
            </div>

            {pendingCount === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
                <h3>All caught up!</h3>
                <p style={{ color: '#9ca3af' }}>There are no pending travel requests awaiting your approval right now.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {pendingApprovals.map(req => (
                  <div key={req.id} className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div className="card-header-responsive" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 4, flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f9fafb' }}>
                            {req.destination}
                          </h3>
                          <span className="badge badge-warning">Awaiting Your Decision</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                          Requested by: <strong style={{ color: '#f3f4f6' }}>{req.traveler_name}</strong> ({req.traveler_email || 'alex.morgan@voyentra.com'})
                        </div>
                      </div>

                      <div className="req-amount-box">
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#34d399' }}>
                          ${req.estimated_budget} {req.currency}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Estimated Cost Center Charge</div>
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#111827',
                      padding: '0.85rem 1rem',
                      borderRadius: 8,
                      fontSize: '0.85rem',
                      color: '#d1d5db',
                      marginBottom: '1.25rem'
                    }}>
                      <div style={{ marginBottom: 4 }}>
                        <strong>Trip Purpose:</strong> {req.purpose || 'Q4 Client Product Review & Executive Strategy'}
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                        Dates: {req.start_date || '2026-11-10'} to {req.end_date || '2026-11-16'} • Department: Engineering (CC-ENG-101)
                      </div>
                    </div>

                    <div className="card-footer-responsive" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#fbbf24' }}>
                        <AlertTriangle size={14} />
                        <span>Approval triggers automated PNR generation & budget deduction</span>
                      </div>

                      <div className="card-actions-responsive" style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#ef4444', borderColor: '#ef4444' }}
                          onClick={() => handleOpenDecisionModal(req, 'rejected')}
                        >
                          <X size={14} /> Reject Request
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleOpenDecisionModal(req, 'approved')}
                        >
                          <Check size={14} /> Authorize & Book
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TEAM TRAVEL & DUTY OF CARE */}
        {activeTab === 'team_trips' && (
          <div>
            <div className="page-header">
              <div>
                <h2 className="page-title">Team Duty of Care & Active Itineraries</h2>
                <p className="page-subtitle">Real-time location and traveler safety tracking for all engineering personnel.</p>
              </div>
            </div>

            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af', backgroundColor: '#1f2937' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Team Member</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Destination</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Travel Dates</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Confirmed PNRs</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map(trip => (
                    <tr key={trip.id} style={{ borderBottom: '1px solid #283548' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600, color: '#f3f4f6' }}>{trip.traveler_name || 'Alex Morgan'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Engineering</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MapPin size={14} style={{ color: '#818cf8' }} />
                          <strong style={{ color: '#f3f4f6' }}>{trip.destination}</strong>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#9ca3af' }}>
                        {trip.start_date} to {trip.end_date}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className="badge badge-success">{trip.status?.toUpperCase() || 'UPCOMING'}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {trip.bookings?.length > 0 ? (
                          <span style={{ color: '#fde047', fontFamily: 'monospace', fontWeight: 600 }}>
                            {trip.bookings.map(b => b.supplier_reference).join(', ')}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>In review</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: REQUEST HISTORY AUDIT */}
        {activeTab === 'team_requests' && (
          <div>
            <div className="page-header">
              <div>
                <h2 className="page-title">Travel Request History & Audit Log</h2>
                <p className="page-subtitle">Full compliance audit trail of all travel requests received by David Miller.</p>
              </div>
            </div>

            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af', backgroundColor: '#1f2937' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Traveler</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Destination</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Budget</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Purpose</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {travelRequests.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #283548' }}>
                      <td style={{ padding: '1rem', fontWeight: 600, color: '#f3f4f6' }}>
                        {r.traveler_name || 'Alex Morgan'}
                      </td>
                      <td style={{ padding: '1rem' }}>{r.destination}</td>
                      <td style={{ padding: '1rem', color: '#34d399', fontWeight: 600 }}>
                        ${r.estimated_budget} {r.currency}
                      </td>
                      <td style={{ padding: '1rem', color: '#9ca3af', maxWidth: 260 }}>
                        {r.purpose}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${r.status === 'approved' ? 'badge-success' : (r.status === 'rejected' ? 'badge-error' : 'badge-warning')}`}>
                          {r.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Manager Decision Modal */}
      {approvalModalItem && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>
                {approvalDecision === 'approved' ? 'Authorize Travel Request' : 'Reject Travel Request'}
              </h3>
              <button className="btn-close" onClick={() => setApprovalModalItem(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f3f4f6' }}>
                {approvalModalItem.destination}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                Traveler: {approvalModalItem.traveler_name} • Amount: ${approvalModalItem.estimated_budget} USD
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 6 }}>
                Reason / Approval Notes (stored in audit log):
              </label>
              <textarea
                className="btn-secondary"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 6, border: '1px solid #374151', minHeight: 80 }}
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setApprovalModalItem(null)}>
                Cancel
              </button>
              <button
                className={`btn ${approvalDecision === 'approved' ? 'btn-success' : 'btn-warning'}`}
                onClick={handleConfirmDecision}
              >
                {approvalDecision === 'approved' ? 'Confirm Approval & Generate Booking' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
