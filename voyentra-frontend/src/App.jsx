import React, { useState, useEffect } from 'react';
import {
  Database,
  ArrowRight,
  RefreshCw,
  LogOut,
  Key,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Layers,
  ChevronRight,
  Compass
} from 'lucide-react';
import './App.css';

import RoleGuard from './components/RoleGuard';
import TravelerDashboard from './components/TravelerDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import FinanceDashboard from './components/FinanceDashboard';
import AdminDashboard from './components/AdminDashboard';
import DutyOfCareCenter from './components/DutyOfCareCenter';

const API_BASE = '/api/voyentra';

// Strict Persona Profiles matching Supabase Seed Database
const PERSONAS = {
  traveler: {
    id: '22222222-aaaa-bbbb-cccc-000000000002',
    name: 'Alex Morgan',
    role: 'Senior Software Engineer',
    roleType: 'traveler',
    dept: 'Engineering (Cost Center CC-ENG-101)',
    email: 'alex.morgan@voyentra.com',
    badgeColor: 'badge-info',
    portalTitle: 'Employee Travel & Expenses Portal',
    portalSubtitle: 'Search corporate flights & hotels, view personal itineraries, and submit OCR expense claims'
  },
  manager: {
    id: '33333333-aaaa-bbbb-cccc-000000000003',
    name: 'David Miller',
    role: 'VP of Engineering (Approver)',
    roleType: 'manager',
    dept: 'Engineering Management',
    email: 'david.miller@voyentra.com',
    badgeColor: 'badge-warning',
    portalTitle: 'Travel Approvals & Team Command Center',
    portalSubtitle: 'Review out-of-policy requests, authorize bookings, and monitor engineering team travel'
  },
  finance: {
    id: '44444444-aaaa-bbbb-cccc-000000000004',
    name: 'Elena Vance',
    role: 'Corporate Spend & Finance Controller',
    roleType: 'finance',
    dept: 'Finance & Treasury',
    email: 'elena.vance@voyentra.com',
    badgeColor: 'badge-success',
    portalTitle: 'Corporate Spend & Reimbursement Center',
    portalSubtitle: 'Audit OCR expense claims, approve reimbursements, and monitor departmental cost centers'
  },
  admin: {
    id: '55555555-aaaa-bbbb-cccc-000000000005',
    name: 'Chinmay Pardeshi',
    role: 'Global Platform Admin',
    roleType: 'admin',
    dept: 'Heloix Executive Suite',
    email: 'chinmay@voyentra.com',
    badgeColor: 'badge-neutral',
    portalTitle: 'Executive Administration & Policy Governance',
    portalSubtitle: 'Configure enterprise travel caps, manage departmental budgets, and inspect Supabase Cloud tables'
  }
};

export default function App() {
  // Authentication & Identity State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedInUserKey, setLoggedInUserKey] = useState('traveler');
  const [loginEmail, setLoginEmail] = useState('alex.morgan@voyentra.com');
  const [loginPassword, setLoginPassword] = useState('Voyentra2026!');
  const [loginError, setLoginError] = useState('');

  // Explicit Screen Navigation (Allows testing RBAC unauthorized route protection!)
  const [activeScreen, setActiveScreen] = useState('dashboard'); // 'dashboard' | 'traveler' | 'manager' | 'finance' | 'admin'

  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Platform Data
  const [meta, setMeta] = useState(null);
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [travelRequests, setTravelRequests] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [dbHealth, setDbHealth] = useState(null);

  const currentUser = PERSONAS[loggedInUserKey] || PERSONAS.traveler;

  // Login Handlers
  const handleFormLogin = (e) => {
    e.preventDefault();
    if (!loginEmail) {
      setLoginError('Please enter a valid corporate email.');
      return;
    }
    const foundKey = Object.keys(PERSONAS).find(
      key => PERSONAS[key].email.toLowerCase() === loginEmail.trim().toLowerCase()
    );
    if (foundKey) {
      setLoggedInUserKey(foundKey);
    } else {
      setLoggedInUserKey('traveler');
    }
    setActiveScreen('dashboard');
    setIsAuthenticated(true);
    setLoginError('');
  };

  const handleQuickDemoLogin = (personaKey) => {
    setLoggedInUserKey(personaKey);
    setLoginEmail(PERSONAS[personaKey].email);
    setActiveScreen('dashboard');
    setIsAuthenticated(true);
    setLoginError('');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveScreen('dashboard');
  };

  // Helper for RBAC-authenticated API calls
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-id': currentUser.id,
    'x-user-role': currentUser.roleType
  });

  // Fetch data with user identity headers
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const headers = {
        'x-user-id': currentUser.id,
        'x-user-role': currentUser.roleType
      };

      const [resMeta, resFlights, resHotels, resReqs, resApprovals, resTrips, resExp, resStats, resHealth] =
        await Promise.all([
          fetch(`${API_BASE}/meta`, { headers }).then(r => r.json()).catch(() => ({})),
          fetch(`${API_BASE}/flights`, { headers }).then(r => r.json()).catch(() => ({})),
          fetch(`${API_BASE}/hotels`, { headers }).then(r => r.json()).catch(() => ({})),
          fetch(`${API_BASE}/requests`, { headers }).then(r => r.json()).catch(() => ({})),
          // approvals and stats are protected for manager/admin/finance
          fetch(`${API_BASE}/approvals`, { headers }).then(r => r.json()).catch(() => ({})),
          fetch(`${API_BASE}/trips`, { headers }).then(r => r.json()).catch(() => ({})),
          fetch(`${API_BASE}/expenses`, { headers }).then(r => r.json()).catch(() => ({})),
          fetch(`${API_BASE}/stats`, { headers }).then(r => r.json()).catch(() => ({})),
          fetch('/api/health').then(r => r.json()).catch(() => ({}))
        ]);

      if (resMeta?.data) {
        setMeta(resMeta.data);
        if (resMeta.data.policy) setPolicy(resMeta.data.policy);
      }
      if (resFlights?.data) setFlights(resFlights.data);
      if (resHotels?.data) setHotels(resHotels.data);
      if (resReqs?.data) setTravelRequests(resReqs.data);
      if (resApprovals?.data) setApprovals(resApprovals.data);
      if (resTrips?.data) setTrips(resTrips.data);
      if (resExp?.data) setExpenses(resExp.data);
      if (resStats?.data) setStats(resStats.data);
      if (resHealth?.status) setDbHealth(resHealth);
    } catch (err) {
      console.error('Error fetching Voyentra data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated, loggedInUserKey, refreshTrigger]);

  // Actions
  const handleBookTravel = async ({ item, type, costCenter, purpose, notes }) => {
    try {
      if (item.in_policy) {
        const res = await fetch(`${API_BASE}/bookings`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            trip_id: null,
            booking_type: type,
            supplier_name: type === 'flight' ? item.airline : item.name,
            total_amount: type === 'flight' ? item.price : (item.nightly_rate * 3),
            currency: 'USD',
            cost_center_id: costCenter,
            payload: {
              ...item,
              purpose: purpose + (notes ? ` | Note: ${notes}` : ''),
              destination_city: type === 'flight' ? item.destination_city : item.city,
              destination: type === 'flight' ? item.destination : item.city
            }
          })
        });
        const data = await res.json();
        alert(data.message || 'Travel option successfully booked on Corporate Card!');
      } else {
        const res = await fetch(`${API_BASE}/requests`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            destination: type === 'flight'
              ? `${item.destination_city} (${item.destination})`
              : `${item.city}, ${item.country || 'Global'}`,
            start_date: '2026-11-10',
            end_date: '2026-11-16',
            estimated_budget: type === 'flight' ? item.price : (item.nightly_rate * 3),
            currency: 'USD',
            purpose: purpose + (notes ? ` | Note: ${notes}` : '')
          })
        });
        const data = await res.json();
        alert('Out-of-policy item submitted! Routed to Manager David Miller for authorization.');
      }
      setRefreshTrigger(t => t + 1);
    } catch (err) {
      alert('Error booking travel: ' + err.message);
    }
  };

  const handleSubmitExpense = async ({ tripId, merchant, amount, category, ocrData, receiptImage }) => {
    try {
      const res = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          trip_id: tripId,
          merchant,
          amount,
          currency: 'USD',
          category,
          expense_date: new Date().toISOString().split('T')[0],
          receipt_ocr: ocrData,
          receipt_image: receiptImage
        })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || `Server responded with status ${res.status}`);
      }
      alert(data?.message || 'Expense submitted with OCR receipt!');
      setRefreshTrigger(t => t + 1);
    } catch (err) {
      alert('Error submitting expense: ' + err.message);
    }
  };

  const handleDecideApproval = async ({ approvalId, decision, reason }) => {
    try {
      const res = await fetch(`${API_BASE}/approvals/${approvalId}/decide`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ decision, reason })
      });
      const data = await res.json();
      alert(data.message || `Request ${decision}!`);
      setRefreshTrigger(t => t + 1);
    } catch (err) {
      alert('Error updating approval: ' + err.message);
    }
  };

  const handleApproveExpense = async (expenseId) => {
    try {
      const res = await fetch(`${API_BASE}/expenses/${expenseId}/approve`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      alert(data.message || 'Expense approved for reimbursement!');
      setRefreshTrigger(t => t + 1);
    } catch (err) {
      alert('Error approving expense: ' + err.message);
    }
  };

  const handleSavePolicy = async (rulesJson) => {
    try {
      const res = await fetch(`${API_BASE}/policy`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rules_json: rulesJson })
      });
      const data = await res.json();
      alert('Corporate Travel Policy updated and enforced across all bookings!');
      if (data.data) setPolicy(data.data);
      setRefreshTrigger(t => t + 1);
    } catch (err) {
      alert('Error updating policy: ' + err.message);
    }
  };

  // =========================================================================
  // VIEW 1: AUTHENTICATION / LOGIN SCREEN
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-logo">V</div>
          <div className="login-header">
            <h2>Sign in to Voyentra</h2>
            <p>Corporate Travel, Expense & Spend Management Platform (SRS v1.0)</p>
          </div>

          {loginError && (
            <div className="policy-alert" style={{ marginBottom: '1.25rem', borderColor: '#ef4444', color: '#fca5a5' }}>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleFormLogin}>
            <div className="login-input-group">
              <label>Corporate Email Address</label>
              <input
                type="email"
                className="login-input"
                placeholder="name@voyentra.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-input-group">
              <label>Password</label>
              <input
                type="password"
                className="login-input"
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
              Sign In to Assigned Portal <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="demo-login-section">
            <div className="demo-login-title">
              <span>Select an Employee Account to Test Dedicated Screen:</span>
              <Key size={14} />
            </div>

            <div className="demo-accounts-grid">
              {Object.keys(PERSONAS).map((key) => {
                const p = PERSONAS[key];
                return (
                  <div
                    key={key}
                    className="demo-account-btn"
                    onClick={() => handleQuickDemoLogin(key)}
                  >
                    <div className="demo-account-name">{p.name}</div>
                    <div className="demo-account-role">{p.role}</div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem', alignSelf: 'flex-start', marginTop: 4 }}>
                      {p.roleType.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
            Multi-Tenant SaaS • Supabase Cloud PostgreSQL • Heloix Enterprise
          </div>
        </div>
      </div>
    );
  }

  // Determine which screen to render
  const targetRole = activeScreen === 'dashboard' ? currentUser.roleType : activeScreen;

  // =========================================================================
  // VIEW 2: AUTHENTICATED PORTAL (STRICT ROLE ISOLATION WITH ROLE GUARD)
  // =========================================================================
  return (
    <div className="app-container">
      {/* Top Navbar: Clean, Secure, Identity Locked */}
      <nav className="navbar">
        <div className="brand">
          <div className="brand-logo">V</div>
          <div className="brand-text">
            <h1>VOYENTRA</h1>
            <span className="brand-subtitle">Corporate Travel & Spend Management (Ref: Perk)</span>
          </div>
        </div>

        <div className="nav-controls">
          {/* Supabase Cloud Connection Pill */}
          <div className="db-pill" title="Supabase Cloud connection">
            <span className={`db-dot ${dbHealth?.is_live_supabase ? 'live' : 'demo'}`}></span>
            <span className="db-pill-text">
              {dbHealth?.is_live_supabase
                ? 'Supabase Cloud Live (ap-southeast-1)'
                : 'Supabase Engine Active (13 Tables)'}
            </span>
            <Database size={14} style={{ opacity: 0.7 }} />
          </div>

          {/* Duty of Care Quick Access Pill */}
          <button
            className={`btn btn-sm ${activeScreen === 'duty_of_care' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveScreen(activeScreen === 'duty_of_care' ? 'dashboard' : 'duty_of_care')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.78rem',
              backgroundColor: activeScreen === 'duty_of_care' ? '#4f46e5' : '#1e293b',
              borderColor: activeScreen === 'duty_of_care' ? '#818cf8' : '#374151',
              color: '#fff',
              fontWeight: 600
            }}
            title="Live Geospatial Traveler Tracking & Risk Map"
          >
            <Compass size={14} className={activeScreen === 'duty_of_care' ? 'animate-spin' : ''} style={{ animationDuration: '8s', color: '#818cf8' }} />
            Duty of Care Map
          </button>

          {/* Role Screen Simulator (For testing RBAC access boundaries) */}
          <div className="route-tester">
            <span className="route-tester-label">Test Route:</span>
            <select
              value={activeScreen}
              onChange={(e) => setActiveScreen(e.target.value)}
              className="route-tester-select"
              title="Test accessing other role screens to verify RoleGuard 403 protection"
            >
              <option value="dashboard">My Assigned Portal ({currentUser.roleType})</option>
              <option value="traveler">Traveler Screen (/portal/traveler)</option>
              <option value="manager">Manager Screen (/portal/manager)</option>
              <option value="finance">Finance Screen (/portal/finance)</option>
              <option value="admin">Admin Screen (/portal/admin)</option>
              <option value="duty_of_care">Duty of Care Tracking (/portal/duty-of-care)</option>
            </select>
          </div>

          {/* Locked Identity Badge */}
          <div className="user-nav-badge">
            <div className="user-nav-avatar">
              {currentUser.name.charAt(0)}
            </div>
            <div className="user-nav-info">
              <span className="user-nav-name">
                {currentUser.name}
              </span>
              <span className="user-nav-role">
                {currentUser.role}
              </span>
            </div>
          </div>

          <button
            className="btn btn-secondary btn-sm nav-icon-btn"
            onClick={() => setRefreshTrigger(t => t + 1)}
            title="Refresh Data"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Secure Log Out Button */}
          <button
            className="btn btn-secondary btn-sm logout-btn"
            onClick={handleLogout}
            title="Log Out of this account"
          >
            <LogOut size={14} /> <span className="logout-text">Log Out</span>
          </button>
        </div>
      </nav>

      {/* Role Context Bar */}
      <div className="role-context-bar">
        <div className="role-context-left">
          <span className="role-context-label">Current Portal:</span>
          <strong className="role-context-title">
            {activeScreen === 'duty_of_care' ? 'Duty of Care & Global Traveler Tracking' : currentUser.portalTitle}
          </strong>
          <span className={`badge ${activeScreen === 'duty_of_care' ? 'badge-info' : currentUser.badgeColor}`}>
            {activeScreen === 'duty_of_care' ? 'SAFETY TRACKING' : currentUser.roleType.toUpperCase()}
          </span>
          <span className="role-dept-text">| {currentUser.dept}</span>
        </div>
        <div className="role-context-right">
          <span>Tenant: <strong>Voyentra Technologies Inc.</strong></span>
          <span>Currency: <strong>USD ($)</strong></span>
        </div>
      </div>

      {/* =========================================================================
          PROTECTED ROLE DASHBOARD ROUTING (WRAPPED IN ROLE GUARD)
          ========================================================================= */}
      
      {/* SCREEN 1: ALEX MORGAN (EMPLOYEE / TRAVELER PORTAL) */}
      {targetRole === 'traveler' && (
        <RoleGuard
          allowedRoles={['traveler', 'admin']}
          userRole={currentUser.roleType}
          userName={currentUser.name}
          onNavigateHome={() => setActiveScreen('dashboard')}
        >
          <TravelerDashboard
            currentUser={currentUser}
            trips={trips}
            expenses={expenses}
            travelRequests={travelRequests}
            flights={flights}
            hotels={hotels}
            policy={policy}
            onBookTravel={handleBookTravel}
            onSubmitExpense={handleSubmitExpense}
            loading={loading}
          />
        </RoleGuard>
      )}

      {/* SCREEN 2: DAVID MILLER (VP OF ENGINEERING / MANAGER PORTAL) */}
      {targetRole === 'manager' && (
        <RoleGuard
          allowedRoles={['manager', 'admin']}
          userRole={currentUser.roleType}
          userName={currentUser.name}
          onNavigateHome={() => setActiveScreen('dashboard')}
        >
          <ManagerDashboard
            currentUser={currentUser}
            approvals={approvals}
            trips={trips}
            travelRequests={travelRequests}
            stats={stats}
            onDecideApproval={handleDecideApproval}
            loading={loading}
          />
        </RoleGuard>
      )}

      {/* SCREEN 3: ELENA VANCE (FINANCE CONTROLLER / SPEND AUDIT PORTAL) */}
      {targetRole === 'finance' && (
        <RoleGuard
          allowedRoles={['finance', 'admin']}
          userRole={currentUser.roleType}
          userName={currentUser.name}
          onNavigateHome={() => setActiveScreen('dashboard')}
        >
          <FinanceDashboard
            currentUser={currentUser}
            expenses={expenses}
            costCenters={meta?.cost_centers || stats?.cost_centers || []}
            stats={stats}
            onApproveExpense={handleApproveExpense}
            loading={loading}
          />
        </RoleGuard>
      )}

      {/* SCREEN 4: CHINMAY PARDESHI (GLOBAL PLATFORM ADMIN PORTAL) */}
      {targetRole === 'admin' && (
        <RoleGuard
          allowedRoles={['admin']}
          userRole={currentUser.roleType}
          userName={currentUser.name}
          onNavigateHome={() => setActiveScreen('dashboard')}
        >
          <AdminDashboard
            currentUser={currentUser}
            policy={policy}
            stats={stats}
            dbHealth={dbHealth}
            meta={meta}
            onSavePolicy={handleSavePolicy}
            loading={loading}
          />
        </RoleGuard>
      )}

      {/* SCREEN 5: DUTY OF CARE & TRAVELER SAFETY TRACKING */}
      {targetRole === 'duty_of_care' && (
        <div className="main-content">
          <DutyOfCareCenter
            currentUser={currentUser}
            isManager={currentUser.roleType === 'manager' || currentUser.roleType === 'admin'}
          />
        </div>
      )}
    </div>
  );
}
