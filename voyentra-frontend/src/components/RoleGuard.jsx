import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

/**
 * RoleGuard Component
 * Enforces frontend role-based access control (RBAC).
 * Renders children if the active user role is authorized;
 * otherwise displays a strict 403 Access Denied security screen.
 */
export default function RoleGuard({ allowedRoles = [], userRole = '', userName = 'User', onNavigateHome, children }) {
  const isAuthorized = allowedRoles.map(r => r.toLowerCase()).includes(userRole?.toLowerCase());

  if (isAuthorized) {
    return <>{children}</>;
  }

  return (
    <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="card role-guard-card" style={{ maxWidth: 560, width: '100%', textAlign: 'center', padding: '2rem 1.5rem', borderColor: '#ef4444' }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem'
        }}>
          <ShieldAlert size={36} />
        </div>

        <span className="badge badge-error" style={{ marginBottom: '1rem', display: 'inline-block' }}>
          403 FORBIDDEN • RBAC ENFORCEMENT
        </span>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb', marginBottom: '0.75rem' }}>
          Security Access Denied
        </h2>

        <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          You do not have permission to view or interact with this screen. This module is restricted to 
          <strong style={{ color: '#e5e7eb' }}> [{allowedRoles.map(r => r.toUpperCase()).join(', ')}] </strong> 
          roles only.
        </p>

        <div style={{
          backgroundColor: '#111827',
          border: '1px solid #374151',
          borderRadius: 8,
          padding: '1rem',
          textAlign: 'left',
          fontSize: '0.82rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: '#9ca3af' }}>Authenticated Identity:</span>
            <strong style={{ color: '#f3f4f6' }}>{userName}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: '#9ca3af' }}>Your Active Role:</span>
            <span className="badge badge-warning">{userRole?.toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#9ca3af' }}>Required Roles:</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>{allowedRoles.join(', ')}</span>
          </div>
        </div>

        {onNavigateHome && (
          <button className="btn btn-primary" onClick={onNavigateHome} style={{ width: '100%', justifyContent: 'center' }}>
            <ArrowLeft size={16} /> Return to My Assigned Portal
          </button>
        )}
      </div>
    </div>
  );
}
