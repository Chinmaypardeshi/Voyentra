import React, { useState } from 'react';
import {
  X,
  Building,
  CheckCircle,
  Shield,
  Layers,
  Globe,
  Sliders,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export default function TenantProvisionModal({ onClose, onCreated }) {
  const [legalName, setLegalName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [planTier, setPlanTier] = useState('Growth'); // 'Starter' | 'Growth' | 'Enterprise'
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [country, setCountry] = useState('USA');
  const [maxSeats, setMaxSeats] = useState(150);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  const [featureFlags, setFeatureFlags] = useState({
    rail_booking_enabled: true,
    hotel_direct_billing: true,
    strict_budget_locks: false,
    flight_auto_approve: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubdomainChange = (val) => {
    // Sanitize to alphanumeric + hyphen
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(clean);
  };

  const handleToggleFlag = (key) => {
    setFeatureFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!legalName.trim() || !subdomain.trim()) {
      setError('Legal company name and tenant subdomain are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/voyentra/admin/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '55555555-aaaa-bbbb-cccc-000000000005',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({
          legal_name: legalName.trim(),
          display_name: displayName.trim() || legalName.trim(),
          subdomain: subdomain.trim(),
          plan_tier: planTier,
          country,
          base_currency: baseCurrency,
          max_seats: Number(maxSeats),
          admin_name: adminName.trim(),
          admin_email: adminEmail.trim(),
          feature_flags: featureFlags
        })
      });

      const json = await res.json();
      if (!res.ok || json.status === 'error') {
        throw new Error(json.message || 'Failed to provision tenant.');
      }

      if (onCreated) {
        onCreated(json.data);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        maxWidth: 720,
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
              width: 38,
              height: 38,
              borderRadius: 8,
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#f9fafb' }}>
                Provision New Corporate Tenant
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#9ca3af' }}>
                SRS Section 17 & 21 • Enterprise Multi-Tenant SaaS Workspace Onboarding
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '0.75rem',
            borderRadius: 8,
            marginBottom: '1rem',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Row 1: Legal Name & Brand Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 4 }}>
                  Company Legal Entity Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Aerospace Corporation"
                  value={legalName}
                  onChange={(e) => {
                    setLegalName(e.target.value);
                    if (!displayName) setDisplayName(e.target.value);
                    if (!subdomain) handleSubdomainChange(e.target.value.split(' ')[0]);
                  }}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 6, border: '1px solid #374151', color: '#f3f4f6' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 4 }}>
                  Workspace Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Aerospace"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 6, border: '1px solid #374151', color: '#f3f4f6' }}
                />
              </div>
            </div>

            {/* Row 2: Subdomain */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 4 }}>
                Dedicated Tenant Subdomain <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  required
                  placeholder="acme"
                  value={subdomain}
                  onChange={(e) => handleSubdomainChange(e.target.value)}
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderTopLeftRadius: 6,
                    borderBottomLeftRadius: 6,
                    border: '1px solid #374151',
                    color: '#818cf8',
                    fontWeight: 600
                  }}
                />
                <span style={{
                  padding: '0.6rem 0.85rem',
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderLeft: 'none',
                  borderTopRightRadius: 6,
                  borderBottomRightRadius: 6,
                  color: '#9ca3af',
                  fontSize: '0.85rem'
                }}>
                  .voyentra.com
                </span>
              </div>
            </div>

            {/* Row 3: Plan Tier, Currency & Seats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 4 }}>
                  Subscription Tier
                </label>
                <select
                  value={planTier}
                  onChange={(e) => setPlanTier(e.target.value)}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 6, border: '1px solid #374151', color: '#f3f4f6' }}
                >
                  <option value="Starter">Starter (Up to 50 Travelers)</option>
                  <option value="Growth">Growth (Up to 250 Travelers)</option>
                  <option value="Enterprise">Enterprise (Unlimited Travelers)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 4 }}>
                  Operating Base Currency
                </label>
                <select
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 6, border: '1px solid #374151', color: '#f3f4f6' }}
                >
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="SGD">SGD (S$ - Singapore Dollar)</option>
                  <option value="CAD">CAD (C$ - Canadian Dollar)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 4 }}>
                  Max Traveler Seats
                </label>
                <input
                  type="number"
                  value={maxSeats}
                  onChange={(e) => setMaxSeats(e.target.value)}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 6, border: '1px solid #374151', color: '#f3f4f6' }}
                />
              </div>
            </div>

            {/* Row 4: Initial Admin */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 4 }}>
                  Initial Admin Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 6, border: '1px solid #374151', color: '#f3f4f6' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 4 }}>
                  Initial Admin Corporate Email
                </label>
                <input
                  type="email"
                  placeholder="admin@acme.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 6, border: '1px solid #374151', color: '#f3f4f6' }}
                />
              </div>
            </div>

            {/* Row 5: Feature Flags */}
            <div style={{
              backgroundColor: '#1f2937',
              borderRadius: 8,
              padding: '1rem',
              border: '1px solid #374151'
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '0.75rem' }}>
                Corporate Feature Flags & Permissions
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.8rem', color: '#e5e7eb' }}>
                  <input
                    type="checkbox"
                    checked={featureFlags.rail_booking_enabled}
                    onChange={() => handleToggleFlag('rail_booking_enabled')}
                  />
                  <span>🚄 Enable Rail & Train Booking Inventory</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.8rem', color: '#e5e7eb' }}>
                  <input
                    type="checkbox"
                    checked={featureFlags.hotel_direct_billing}
                    onChange={() => handleToggleFlag('hotel_direct_billing')}
                  />
                  <span>🏨 Hotel Direct Corporate Card Billing</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.8rem', color: '#e5e7eb' }}>
                  <input
                    type="checkbox"
                    checked={featureFlags.strict_budget_locks}
                    onChange={() => handleToggleFlag('strict_budget_locks')}
                  />
                  <span>🔒 Hard Budget Ceiling Lock Enforcement</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.8rem', color: '#e5e7eb' }}>
                  <input
                    type="checkbox"
                    checked={featureFlags.flight_auto_approve}
                    onChange={() => handleToggleFlag('flight_auto_approve')}
                  />
                  <span>⚡ Auto-Approve In-Policy Flights &lt; $500</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {loading ? 'Provisioning...' : 'Provision Tenant Workspace'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
