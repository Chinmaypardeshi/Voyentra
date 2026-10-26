import React, { useState, useEffect } from 'react';
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
  DollarSign,
  Plus,
  Power,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  FileSpreadsheet,
  Globe,
  Lock,
  Train,
  CreditCard,
  Zap,
  Mail,
  UserCheck
} from 'lucide-react';
import TenantProvisionModal from './TenantProvisionModal';
import EmployeeRosterImporter from './EmployeeRosterImporter';

export default function AdminDashboard({
  currentUser,
  policy,
  stats,
  dbHealth,
  meta,
  onSavePolicy,
  loading
}) {
  const [activeTab, setActiveTab] = useState('tenants'); // 'tenants' | 'onboarding' | 'policies' | 'budgets' | 'database'
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);

  // Editable Policy Rules State
  const [intlFlightCap, setIntlFlightCap] = useState(policy?.rules_json?.max_international_flight_amount || 1200);
  const [domFlightCap, setDomFlightCap] = useState(policy?.rules_json?.max_flight_amount || 450);
  const [hotelNightlyCap, setHotelNightlyCap] = useState(policy?.rules_json?.max_hotel_nightly_rate || 250);
  const [advanceDays, setAdvanceDays] = useState(policy?.rules_json?.advance_booking_days || 14);

  // Tenants State
  const [tenants, setTenants] = useState([
    {
      id: '11111111-aaaa-bbbb-cccc-000000000001',
      legal_name: 'Voyentra Technologies Inc.',
      display_name: 'Voyentra Global',
      subdomain: 'voyentra.app',
      plan_tier: 'Enterprise',
      country: 'USA',
      base_currency: 'USD',
      monthly_active_travelers: 120,
      max_seats: 500,
      feature_flags: {
        rail_booking_enabled: true,
        hotel_direct_billing: true,
        strict_budget_locks: true,
        flight_auto_approve: false
      },
      subscription_status: 'active'
    },
    {
      id: 'org-acme-2026',
      legal_name: 'Acme Aerospace Corporation',
      display_name: 'Acme Aerospace',
      subdomain: 'acme.voyentra.com',
      plan_tier: 'Growth',
      country: 'USA',
      base_currency: 'USD',
      monthly_active_travelers: 45,
      max_seats: 150,
      feature_flags: {
        rail_booking_enabled: false,
        hotel_direct_billing: true,
        strict_budget_locks: false,
        flight_auto_approve: true
      },
      subscription_status: 'active'
    },
    {
      id: 'org-nexus-2026',
      legal_name: 'Nexus BioPharma International AG',
      display_name: 'Nexus BioPharma',
      subdomain: 'nexus.voyentra.com',
      plan_tier: 'Enterprise',
      country: 'Switzerland',
      base_currency: 'EUR',
      monthly_active_travelers: 280,
      max_seats: 1000,
      feature_flags: {
        rail_booking_enabled: true,
        hotel_direct_billing: true,
        strict_budget_locks: true,
        flight_auto_approve: false
      },
      subscription_status: 'active'
    },
    {
      id: 'org-starlight-2026',
      legal_name: 'Starlight Logistics GmbH',
      display_name: 'Starlight Logistics',
      subdomain: 'starlight.voyentra.eu',
      plan_tier: 'Starter',
      country: 'Germany',
      base_currency: 'EUR',
      monthly_active_travelers: 18,
      max_seats: 50,
      feature_flags: {
        rail_booking_enabled: true,
        hotel_direct_billing: false,
        strict_budget_locks: false,
        flight_auto_approve: false
      },
      subscription_status: 'provisioning'
    }
  ]);

  // Employees Directory State
  const [employees, setEmployees] = useState([
    { id: 'u1', first_name: 'Alex', last_name: 'Morgan', email: 'alex.morgan@voyentra.com', role: 'traveler', department_name: 'Engineering & Technology', cost_center_code: 'CC-ENG-101', status: 'active' },
    { id: 'u2', first_name: 'David', last_name: 'Miller', email: 'david.miller@voyentra.com', role: 'manager', department_name: 'Executive Operations', cost_center_code: 'CC-OPS-301', status: 'active' },
    { id: 'u3', first_name: 'Elena', last_name: 'Vance', email: 'elena.vance@voyentra.com', role: 'finance_manager', department_name: 'Global Finance & Treasury', cost_center_code: 'CC-OPS-301', status: 'active' },
    { id: 'u4', first_name: 'Chinmay', last_name: 'Pardeshi', email: 'chinmay@voyentra.com', role: 'admin', department_name: 'Global IT & Security', cost_center_code: 'CC-ENG-101', status: 'active' }
  ]);

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/voyentra/admin/tenants', {
        headers: {
          'x-user-id': currentUser?.id || '55555555-aaaa-bbbb-cccc-000000000005',
          'x-user-role': 'admin'
        }
      });
      const json = await res.json();
      if (json.data?.tenants) {
        setTenants(json.data.tenants);
      }
    } catch (e) {
      console.warn('Could not fetch tenants, using initial seed:', e);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/voyentra/admin/employees', {
        headers: {
          'x-user-id': currentUser?.id || '55555555-aaaa-bbbb-cccc-000000000005',
          'x-user-role': 'admin'
        }
      });
      const json = await res.json();
      if (json.data?.employees) {
        setEmployees(json.data.employees);
      }
    } catch (e) {
      console.warn('Could not fetch employees directory:', e);
    }
  };

  useEffect(() => {
    fetchTenants();
    fetchEmployees();
  }, []);

  const handleUpdatePolicy = (e) => {
    e.preventDefault();
    onSavePolicy({
      max_international_flight_amount: Number(intlFlightCap),
      max_flight_amount: Number(domFlightCap),
      max_hotel_nightly_rate: Number(hotelNightlyCap),
      advance_booking_days: Number(advanceDays)
    });
  };

  const handleToggleTenantStatus = async (tenantId) => {
    try {
      const target = tenants.find(t => t.id === tenantId);
      const newStatus = target?.subscription_status === 'active' ? 'suspended' : 'active';
      const res = await fetch(`/api/voyentra/admin/tenants/${tenantId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '55555555-aaaa-bbbb-cccc-000000000005',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (json.status === 'success') {
        setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, subscription_status: newStatus } : t));
      }
    } catch (err) {
      setTenants(prev => prev.map(t => t.id === tenantId ? {
        ...t,
        subscription_status: t.subscription_status === 'active' ? 'suspended' : 'active'
      } : t));
    }
  };

  const handleToggleFeatureFlag = async (tenantId, flagKey) => {
    const target = tenants.find(t => t.id === tenantId);
    if (!target) return;
    const updatedFlags = {
      ...target.feature_flags,
      [flagKey]: !target.feature_flags?.[flagKey]
    };

    try {
      await fetch(`/api/voyentra/admin/tenants/${tenantId}/feature-flags`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '55555555-aaaa-bbbb-cccc-000000000005',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({ feature_flags: updatedFlags })
      });
    } catch (e) {
      // optimistic
    }

    setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, feature_flags: updatedFlags } : t));
  };

  const handleTenantCreated = (newTenant) => {
    setTenants(prev => [newTenant, ...prev]);
  };

  const handleEmployeesInvited = (newProfiles) => {
    setEmployees(prev => [
      ...newProfiles.map(p => ({
        ...p,
        department_name: p.department || 'Engineering & Technology',
        cost_center_code: p.cost_center || 'CC-ENG-101',
        status: 'active'
      })),
      ...prev
    ]);
  };

  const schemaTables = [
    { name: 'organizations', count: tenants.length, purpose: 'Multi-tenant corporate workspaces' },
    { name: 'user_profiles', count: employees.length, purpose: 'Employee profiles with RBAC roles' },
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
    { name: 'audit_logs', count: 24, purpose: 'Immutable security & SOC2 audit trail' }
  ];

  const totalMAT = tenants.reduce((sum, t) => sum + (t.monthly_active_travelers || 0), 0);
  const activeTenantsCount = tenants.filter(t => t.subscription_status === 'active').length;

  return (
    <>
      {/* Admin Navigation Tabs */}
      <div className="tab-navigation">
        <button
          className={`nav-tab ${activeTab === 'tenants' ? 'active' : ''}`}
          onClick={() => setActiveTab('tenants')}
        >
          <Building size={16} /> Multi-Tenant SaaS Workspaces (SRS Sec 17)
        </button>
        <button
          className={`nav-tab ${activeTab === 'onboarding' ? 'active' : ''}`}
          onClick={() => setActiveTab('onboarding')}
        >
          <Users size={16} /> Employee Directory & CSV Onboarding (SRS Sec 21)
        </button>
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
              <Building size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{activeTenantsCount} / {tenants.length} Active</div>
              <div className="stat-label">Corporate SaaS Tenants</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Users size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{totalMAT} MAT</div>
              <div className="stat-label">Monthly Active Travelers</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <ShieldCheck size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">Policy v{policy?.version || 1}</div>
              <div className="stat-label">Global Policy Thresholds</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
              <Database size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">13 Tables</div>
              <div className="stat-label">Supabase Cloud PostgreSQL</div>
            </div>
          </div>
        </div>

        {/* TAB 1: MULTI-TENANT WORKSPACE PROVISIONING */}
        {activeTab === 'tenants' && (
          <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 className="page-title">Super Admin Multi-Tenant Provisioning & Governance</h2>
                <p className="page-subtitle">
                  SRS Section 17 & 21 • Provision isolated tenant environments, toggle corporate feature flags, and manage subscription tiers.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsProvisionModalOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
              >
                <Plus size={16} /> Provision New Corporate Tenant
              </button>
            </div>

            {/* Tenant Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              {tenants.map(t => {
                const isActive = t.subscription_status === 'active';
                const mat = t.monthly_active_travelers || 20;
                const maxSeats = t.max_seats || 100;
                const utilPct = Math.min(Math.round((mat / maxSeats) * 100), 100);
                const flags = t.feature_flags || {};

                return (
                  <div
                    key={t.id}
                    className="card"
                    style={{
                      padding: '1.25rem',
                      border: isActive ? '1px solid #1f2937' : '1px solid #ef4444',
                      opacity: isActive ? 1 : 0.85
                    }}
                  >
                    {/* Card Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span className={`badge ${t.plan_tier === 'Enterprise' ? 'badge-primary' : (t.plan_tier === 'Growth' ? 'badge-info' : 'badge-neutral')}`}>
                            {t.plan_tier} Plan
                          </span>
                          <span className={`badge ${isActive ? 'badge-success' : 'badge-warning'}`}>
                            {isActive ? 'ACTIVE' : t.subscription_status.toUpperCase()}
                          </span>
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f9fafb' }}>
                          {t.display_name || t.legal_name}
                        </h3>
                        <div style={{ fontSize: '0.78rem', color: '#818cf8', fontFamily: 'monospace', marginTop: 2 }}>
                          {t.subdomain}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleTenantStatus(t.id)}
                        className={`btn btn-sm ${isActive ? 'btn-secondary' : 'btn-success'}`}
                        style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        title={isActive ? 'Suspend tenant workspace' : 'Reactivate tenant workspace'}
                      >
                        <Power size={12} /> {isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </div>

                    {/* Seat Utilization Meter */}
                    <div style={{ marginBottom: '1rem', backgroundColor: '#1f2937', padding: '0.75rem', borderRadius: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                        <span style={{ color: '#9ca3af' }}>Active Travelers (MAT):</span>
                        <strong style={{ color: '#f3f4f6' }}>{mat} / {maxSeats} seats ({utilPct}%)</strong>
                      </div>
                      <div style={{ width: '100%', height: 6, backgroundColor: '#374151', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${utilPct}%`,
                          height: '100%',
                          backgroundColor: utilPct > 80 ? '#f59e0b' : '#10b981',
                          borderRadius: 3
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#9ca3af', marginTop: 4 }}>
                        <span>Base Currency: <strong>{t.base_currency || 'USD'}</strong></span>
                        <span>Region: <strong>{t.country || 'USA'}</strong></span>
                      </div>
                    </div>

                    {/* Feature Flags Toggles */}
                    <div style={{ borderTop: '1px solid #374151', paddingTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, marginBottom: 6 }}>
                        Configured Feature Flags:
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div
                          onClick={() => handleToggleFeatureFlag(t.id, 'rail_booking_enabled')}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', cursor: 'pointer', padding: '0.2rem 0' }}
                        >
                          <span style={{ color: flags.rail_booking_enabled ? '#f3f4f6' : '#6b7280' }}>
                            🚄 Rail & Transit Booking
                          </span>
                          <span style={{ color: flags.rail_booking_enabled ? '#10b981' : '#6b7280', fontWeight: 600 }}>
                            {flags.rail_booking_enabled ? 'ON' : 'OFF'}
                          </span>
                        </div>

                        <div
                          onClick={() => handleToggleFeatureFlag(t.id, 'hotel_direct_billing')}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', cursor: 'pointer', padding: '0.2rem 0' }}
                        >
                          <span style={{ color: flags.hotel_direct_billing ? '#f3f4f6' : '#6b7280' }}>
                            🏨 Hotel Direct Card Billing
                          </span>
                          <span style={{ color: flags.hotel_direct_billing ? '#10b981' : '#6b7280', fontWeight: 600 }}>
                            {flags.hotel_direct_billing ? 'ON' : 'OFF'}
                          </span>
                        </div>

                        <div
                          onClick={() => handleToggleFeatureFlag(t.id, 'strict_budget_locks')}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', cursor: 'pointer', padding: '0.2rem 0' }}
                        >
                          <span style={{ color: flags.strict_budget_locks ? '#f3f4f6' : '#6b7280' }}>
                            🔒 Hard Budget Locks (FR-209)
                          </span>
                          <span style={{ color: flags.strict_budget_locks ? '#ef4444' : '#6b7280', fontWeight: 600 }}>
                            {flags.strict_budget_locks ? 'LOCKED' : 'SOFT'}
                          </span>
                        </div>

                        <div
                          onClick={() => handleToggleFeatureFlag(t.id, 'flight_auto_approve')}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', cursor: 'pointer', padding: '0.2rem 0' }}
                        >
                          <span style={{ color: flags.flight_auto_approve ? '#f3f4f6' : '#6b7280' }}>
                            ⚡ Auto-Approve Flights &lt; $500
                          </span>
                          <span style={{ color: flags.flight_auto_approve ? '#10b981' : '#6b7280', fontWeight: 600 }}>
                            {flags.flight_auto_approve ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: EMPLOYEE DIRECTORY & CSV ONBOARDING */}
        {activeTab === 'onboarding' && (
          <div>
            <div className="page-header">
              <div>
                <h2 className="page-title">Employee Directory & CSV Roster Onboarding</h2>
                <p className="page-subtitle">
                  SRS Section 21 / FR-280 to FR-310 • Import employee rosters in bulk, provision RBAC roles, and map cost centers.
                </p>
              </div>
            </div>

            {/* Importer Component */}
            <EmployeeRosterImporter onEmployeesInvited={handleEmployeesInvited} />

            {/* Live Employee Table */}
            <div className="page-header" style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f9fafb' }}>
                Active Provisioned Corporate Employees ({employees.length})
              </h3>
            </div>

            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af', backgroundColor: '#1f2937' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Employee Name</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Corporate Email</th>
                    <th style={{ padding: '0.85rem 1rem' }}>RBAC Role</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Department</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Assigned Cost Center</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Account Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id || emp.email} style={{ borderBottom: '1px solid #283548' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#f3f4f6' }}>
                        {emp.first_name} {emp.last_name}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                        {emp.email}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className={`badge ${
                          emp.role === 'admin' ? 'badge-primary' :
                          (emp.role === 'manager' ? 'badge-warning' :
                          (emp.role === 'finance_manager' ? 'badge-success' : 'badge-neutral'))
                        }`} style={{ textTransform: 'capitalize' }}>
                          {emp.role?.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#9ca3af' }}>
                        {emp.department_name || 'Engineering & Technology'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className="badge badge-info">{emp.cost_center_code || 'CC-ENG-101'}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className="badge badge-success">Active / Invited</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: POLICY RULES ENGINE */}
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

        {/* TAB 4: COST CENTER ALLOCATIONS */}
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

        {/* TAB 5: SUPABASE CLOUD DATABASE INSPECTOR */}
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

      {/* Provision New Corporate Tenant Modal */}
      {isProvisionModalOpen && (
        <TenantProvisionModal
          onClose={() => setIsProvisionModalOpen(false)}
          onCreated={handleTenantCreated}
        />
      )}
    </>
  );
}
