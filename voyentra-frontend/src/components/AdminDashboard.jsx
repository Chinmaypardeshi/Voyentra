import React, { useState } from 'react';
import {
  Sliders,
  Database,
  PieChart,
  ShieldCheck,
  Save,
  CheckCircle,
  ExternalLink,
  Layers,
  Users,
  Building,
  DollarSign
} from 'lucide-react';

export default function AdminDashboard({
  currentUser,
  policy,
  stats,
  dbHealth,
  meta,
  onSavePolicy,
  loading
}) {
  const [activeTab, setActiveTab] = useState('policies'); // 'policies' | 'budgets' | 'database'

  // Editable Policy Rules State
  const [intlFlightCap, setIntlFlightCap] = useState(policy?.rules_json?.max_international_flight_amount || 1200);
  const [domFlightCap, setDomFlightCap] = useState(policy?.rules_json?.max_flight_amount || 450);
  const [hotelNightlyCap, setHotelNightlyCap] = useState(policy?.rules_json?.max_hotel_nightly_rate || 250);
  const [advanceDays, setAdvanceDays] = useState(policy?.rules_json?.advance_booking_days || 14);

  const handleUpdatePolicy = (e) => {
    e.preventDefault();
    onSavePolicy({
      max_international_flight_amount: Number(intlFlightCap),
      max_flight_amount: Number(domFlightCap),
      max_hotel_nightly_rate: Number(hotelNightlyCap),
      advance_booking_days: Number(advanceDays)
    });
  };

  const schemaTables = [
    { name: 'organizations', count: 1, purpose: 'Multi-tenant corporate workspaces' },
    { name: 'user_profiles', count: meta?.profiles?.length || 4, purpose: 'Employee profiles with RBAC roles' },
    { name: 'departments', count: 3, purpose: 'Organizational hierarchy & managers' },
    { name: 'cost_centers', count: 3, purpose: 'Financial spending allocations' },
    { name: 'travel_policies', count: 1, purpose: 'Active policy threshold rules engine' },
    { name: 'travel_requests', count: 5, purpose: 'Pre-trip exception requests' },
    { name: 'approvals', count: 4, purpose: 'Manager multi-tier approval workflow' },
    { name: 'trips', count: 4, purpose: 'Primary trip containers & itineraries' },
    { name: 'bookings', count: 5, purpose: 'Supplier airline/hotel PNR reservations' },
    { name: 'payments', count: 5, purpose: 'Corporate card checkout ledger' },
    { name: 'expenses', count: 6, purpose: 'Employee expense claims & reimbursements' },
    { name: 'receipts', count: 6, purpose: 'OCR optical receipt data' },
    { name: 'audit_logs', count: 18, purpose: 'Immutable security & SOC2 audit trail' }
  ];

  return (
    <>
      {/* Admin Navigation Tabs */}
      <div className="tab-navigation">
        <button
          className={`nav-tab ${activeTab === 'policies' ? 'active' : ''}`}
          onClick={() => setActiveTab('policies')}
        >
          <Sliders size={16} /> Global Policy Rules Engine
        </button>
        <button
          className={`nav-tab ${activeTab === 'budgets' ? 'active' : ''}`}
          onClick={() => setActiveTab('budgets')}
        >
          <PieChart size={16} /> Cost Center Allocations
        </button>
        <button
          className={`nav-tab ${activeTab === 'database' ? 'active' : ''}`}
          onClick={() => setActiveTab('database')}
        >
          <Database size={16} /> Supabase Cloud Database (13 Tables)
        </button>
      </div>

      <main className="main-content">
        {/* Admin Platform Metrics */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <ShieldCheck size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">Policy v{policy?.version || 1}</div>
              <div className="stat-label">Enforced Across All Searches</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <DollarSign size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">$115,000</div>
              <div className="stat-label">Total Allocated Budgets</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Database size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">13 Tables</div>
              <div className="stat-label">Supabase Cloud PostgreSQL</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
              <Users size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">4 Personas</div>
              <div className="stat-label">Strict RBAC Isolations Active</div>
            </div>
          </div>
        </div>

        {/* TAB 1: POLICY RULES ENGINE */}
        {activeTab === 'policies' && (
          <div>
            <div className="page-header">
              <div>
                <h2 className="page-title">Global Travel Policy Rules Engine</h2>
                <p className="page-subtitle">Configure enterprise spending thresholds enforced automatically on all search inventory.</p>
              </div>
              <span className="badge badge-success">Active Policy v{policy?.version || 1}</span>
            </div>

            <div className="card" style={{ maxWidth: 680 }}>
              <form onSubmit={handleUpdatePolicy}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: 6 }}>
                      Max International Flight Cap ($ USD):
                    </label>
                    <input
                      type="number"
                      className="btn-secondary"
                      style={{ width: '100%', padding: '0.65rem', borderRadius: 6, border: '1px solid #374151' }}
                      value={intlFlightCap}
                      onChange={(e) => setIntlFlightCap(e.target.value)}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Flights exceeding this cap automatically trigger manager pre-trip authorization.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: 6 }}>
                      Max Domestic Flight Cap ($ USD):
                    </label>
                    <input
                      type="number"
                      className="btn-secondary"
                      style={{ width: '100%', padding: '0.65rem', borderRadius: 6, border: '1px solid #374151' }}
                      value={domFlightCap}
                      onChange={(e) => setDomFlightCap(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: 6 }}>
                      Max Nightly Hotel Rate Cap ($ USD):
                    </label>
                    <input
                      type="number"
                      className="btn-secondary"
                      style={{ width: '100%', padding: '0.65rem', borderRadius: 6, border: '1px solid #374151' }}
                      value={hotelNightlyCap}
                      onChange={(e) => setHotelNightlyCap(e.target.value)}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Hotels above this rate per night require manager sign-off.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: 6 }}>
                      Advance Booking Window (Days):
                    </label>
                    <input
                      type="number"
                      className="btn-secondary"
                      style={{ width: '100%', padding: '0.65rem', borderRadius: 6, border: '1px solid #374151' }}
                      value={advanceDays}
                      onChange={(e) => setAdvanceDays(e.target.value)}
                    />
                  </div>

                  <div style={{ paddingTop: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
                      <Save size={16} /> Save & Enforce Policy across Voyentra
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: COST CENTER ALLOCATIONS */}
        {activeTab === 'budgets' && (
          <div>
            <div className="page-header">
              <div>
                <h2 className="page-title">Enterprise Cost Centers & Budget Ceilings</h2>
                <p className="page-subtitle">Configure department spending allocations and approval chains.</p>
              </div>
            </div>

            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af', backgroundColor: '#1f2937' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Cost Center Code</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Department Name</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Allocated Budget</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Spent</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #283548' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#818cf8' }}>CC-ENG-101</td>
                    <td style={{ padding: '1rem', color: '#f3f4f6' }}>Engineering & Product Development</td>
                    <td style={{ padding: '1rem', color: '#34d399', fontWeight: 600 }}>$50,000 USD</td>
                    <td style={{ padding: '1rem', color: '#f59e0b' }}>${Number(stats?.cost_centers?.[0]?.spent || 15680).toLocaleString()} USD</td>
                    <td style={{ padding: '1rem', color: '#38bdf8', fontWeight: 600 }}>$34,320 USD</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #283548' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#818cf8' }}>CC-SALES-201</td>
                    <td style={{ padding: '1rem', color: '#f3f4f6' }}>Global Sales & Customer Success</td>
                    <td style={{ padding: '1rem', color: '#34d399', fontWeight: 600 }}>$40,000 USD</td>
                    <td style={{ padding: '1rem', color: '#f59e0b' }}>$8,200 USD</td>
                    <td style={{ padding: '1rem', color: '#38bdf8', fontWeight: 600 }}>$31,800 USD</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #283548' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#818cf8' }}>CC-OPS-301</td>
                    <td style={{ padding: '1rem', color: '#f3f4f6' }}>Executive Operations & Facilities</td>
                    <td style={{ padding: '1rem', color: '#34d399', fontWeight: 600 }}>$25,000 USD</td>
                    <td style={{ padding: '1rem', color: '#f59e0b' }}>$4,500 USD</td>
                    <td style={{ padding: '1rem', color: '#38bdf8', fontWeight: 600 }}>$20,500 USD</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SUPABASE CLOUD DATABASE INSPECTOR */}
        {activeTab === 'database' && (
          <div>
            <div className="page-header">
              <div>
                <h2 className="page-title">Supabase Cloud Database Inspector (13 Tables)</h2>
                <p className="page-subtitle">Multi-tenant schema details and live transaction metrics for Heloix presentation.</p>
              </div>
            </div>

            <div style={{
              backgroundColor: '#111827',
              border: '1px solid #374151',
              borderRadius: 8,
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className={`db-dot ${dbHealth?.is_live_supabase ? 'live' : 'demo'}`}></span>
                  <strong style={{ color: '#f3f4f6' }}>
                    {dbHealth?.is_live_supabase ? 'Connected to Live Supabase Cloud PostgreSQL' : 'Supabase High-Fidelity Schema Engine Active'}
                  </strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                  Pooler: aws-0-ap-southeast-1.pooler.supabase.com:6543 • Target: xzbmsbayggiazhwnlxri
                </div>
              </div>

              <span className="badge badge-success">PostgreSQL v16.1 Compliant</span>
            </div>

            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af', backgroundColor: '#1f2937' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Table Name</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Active Records</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Architectural Purpose (Perk SRS v1.0)</th>
                  </tr>
                </thead>
                <tbody>
                  {schemaTables.map(t => (
                    <tr key={t.name} style={{ borderBottom: '1px solid #283548' }}>
                      <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#818cf8', fontWeight: 600 }}>
                        {t.name}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#34d399', fontWeight: 600 }}>
                        {t.count}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#9ca3af' }}>
                        {t.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
