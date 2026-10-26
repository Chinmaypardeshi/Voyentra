import React, { useState, useEffect } from 'react';
import {
  Globe,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Send,
  Users,
  Clock,
  Phone,
  Plane,
  Building,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Search,
  X,
  Compass,
  CloudSun,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function DutyOfCareCenter({ currentUser, isManager = true }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTraveler, setSelectedTraveler] = useState(null);
  const [selectedCity, setSelectedCity] = useState('London');
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [alertTargetCity, setAlertTargetCity] = useState('London');
  const [alertSeverity, setAlertSeverity] = useState('warning');
  const [alertMessage, setAlertMessage] = useState('Flight schedule adjustments reported at London Heathrow (LHR). Please verify your itinerary and confirm check-in with management.');
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  // Fetch Duty of Care telemetry
  const fetchDutyOfCareData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/voyentra/duty-of-care', {
        headers: {
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.roleType
        }
      });
      const json = await res.json();
      if (json.data) {
        setData(json.data);
        if (json.data.travelers?.length > 0 && !selectedTraveler) {
          setSelectedTraveler(json.data.travelers[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load Duty of Care data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDutyOfCareData();
  }, []);

  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/voyentra/duty-of-care/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.roleType
        },
        body: JSON.stringify({
          title: `Duty of Care Alert: ${alertTargetCity}`,
          destination: `${alertTargetCity} Travelers`,
          city: alertTargetCity,
          severity: alertSeverity,
          message: alertMessage
        })
      });
      const json = await res.json();
      setBroadcastSuccess(json.message || 'Alert broadcast sent!');
      setTimeout(() => {
        setBroadcastSuccess('');
        setBroadcastModalOpen(false);
        fetchDutyOfCareData();
      }, 1500);
    } catch (err) {
      alert('Error broadcasting alert: ' + err.message);
    }
  };

  const FALLBACK_ADVISORIES = {
    'London': {
      city: 'London',
      country: 'United Kingdom',
      airport: 'LHR',
      coords: { x: 49.5, y: 31.0 },
      riskLevel: 'low',
      riskLabel: 'Level 1: Low Risk (Standard Precaution)',
      weather: '13°C • Overcast',
      localEmergencyNumber: '999 / 112',
      advisoryNote: 'All transit systems operating normally. Heathrow Terminals 2-5 clear.'
    },
    'Paris': {
      city: 'Paris',
      country: 'France',
      airport: 'CDG',
      coords: { x: 50.8, y: 33.5 },
      riskLevel: 'medium',
      riskLabel: 'Level 2: Travel Advisory (Air Traffic Delay Watch)',
      weather: '11°C • Light Rain',
      localEmergencyNumber: '112 / 15',
      advisoryNote: 'Possible 20-30m European airspace flow management delays at Charles de Gaulle.'
    },
    'Singapore': {
      city: 'Singapore',
      country: 'Singapore',
      airport: 'SIN',
      coords: { x: 79.5, y: 58.5 },
      riskLevel: 'low',
      riskLabel: 'Level 1: Low Risk (Normal Precaution)',
      weather: '29°C • Tropical Humidity',
      localEmergencyNumber: '999',
      advisoryNote: 'Changi Airport operations on schedule. High transit reliability.'
    },
    'New York': {
      city: 'New York',
      country: 'USA',
      airport: 'JFK',
      coords: { x: 28.5, y: 35.5 },
      riskLevel: 'low',
      riskLabel: 'Level 1: Low Risk (Normal Precaution)',
      weather: '16°C • Clear Sky',
      localEmergencyNumber: '911',
      advisoryNote: 'JFK and EWR ground transportation normal.'
    },
    'Frankfurt': {
      city: 'Frankfurt',
      country: 'Germany',
      airport: 'FRA',
      coords: { x: 52.8, y: 32.2 },
      riskLevel: 'low',
      riskLabel: 'Level 1: Low Risk (Normal Precaution)',
      weather: '12°C • Partly Cloudy',
      localEmergencyNumber: '112',
      advisoryNote: 'Lufthansa hub operating standard flight bank schedules.'
    }
  };

  const travelers = data?.travelers || [
    {
      id: '22222222-aaaa-bbbb-cccc-000000000002',
      name: 'Alex Morgan',
      role: 'Senior Software Engineer',
      email: 'alex.morgan@voyentra.com',
      phone: '+1-555-0199',
      department: 'Engineering (CC-ENG-101)',
      destination: 'London, United Kingdom',
      city: 'London',
      hotel: 'The Langham London (Room 412)',
      flight_number: 'BA 178',
      pnr: 'BA-849201',
      start_date: '2026-11-10',
      end_date: '2026-11-16',
      status: 'in_destination',
      status_label: 'In Destination • Active Onsite',
      safety_status: 'safe',
      last_check_in: new Date().toISOString(),
      emergency_contact: {
        name: 'Sarah Morgan',
        relation: 'Spouse',
        phone: '+1-555-0198'
      },
      passport: {
        number: 'USA-9982****',
        expiry: '2028-09-15',
        status: 'valid'
      }
    }
  ];

  const advisories = (data?.advisories && Object.keys(data.advisories).length > 0) ? data.advisories : FALLBACK_ADVISORIES;
  const activeAlerts = data?.active_alerts || [
    {
      id: 'alert-001',
      title: 'London Heathrow Weather Advisory (Mild Delays)',
      destination: 'London (LHR), United Kingdom',
      city: 'London',
      severity: 'advisory',
      message: 'Fog advisory at LHR Terminal 5 this morning. All Voyentra travelers are advised to verify gate assignments and confirm check-in.',
      broadcast_by: 'David Miller (VP of Engineering)',
      created_at: new Date().toISOString(),
      responses: [
        {
          traveler_id: '22222222-aaaa-bbbb-cccc-000000000002',
          traveler_name: 'Alex Morgan',
          status: 'safe',
          note: 'Checked in at The Langham London. All clear.',
          responded_at: new Date().toISOString()
        }
      ]
    }
  ];

  const stats = data?.stats || {
    travelers_in_destination: 1,
    upcoming_travelers: 2,
    safe_check_in_rate: '100%',
    active_risk_alerts: activeAlerts.length
  };

  const currentAdvisory = advisories[selectedCity] || advisories['London'] || FALLBACK_ADVISORIES['London'];

  return (
    <div className="duty-of-care-center">
      {/* Top Controls & Status Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Compass size={24} style={{ color: '#818cf8' }} />
            Duty of Care & Global Traveler Tracking
          </h2>
          <p className="page-subtitle">
            SRS Section 12.4 • Live geospatial traveler tracking, flight risk monitoring, and emergency safety broadcasts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchDutyOfCareData}
            title="Refresh Live Geolocation & Flight Telemetry"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Map
          </button>

          {isManager && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setBroadcastModalOpen(true)}
              style={{
                backgroundColor: '#dc2626',
                borderColor: '#ef4444',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Radio size={14} className="animate-pulse" /> Broadcast Safety Alert
            </button>
          )}
        </div>
      </div>

      {/* Duty of Care Metrics Bar */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <MapPin size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.travelers_in_destination} Active</div>
            <div className="stat-label">Travelers Currently Onsite</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <ShieldCheck size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.safe_check_in_rate} Safe</div>
            <div className="stat-label">Safety Check-in Compliance</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Plane size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{travelers.length} Monitored</div>
            <div className="stat-label">Active & Scheduled Trips</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.active_risk_alerts} Advisory</div>
            <div className="stat-label">Active Regional Notices</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Traveler Telemetry Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.8fr 1.2fr',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        {/* Left Column: Interactive Vector World Map */}
        <div className="card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Globe size={18} style={{ color: '#818cf8' }} />
              <strong style={{ fontSize: '0.95rem', color: '#f3f4f6' }}>Global Real-Time Tracking Grid</strong>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              Click any pin to inspect flight, hotel & safety details
            </span>
          </div>

          {/* SVG World Map Canvas */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: 380,
            backgroundColor: '#090d16',
            borderRadius: 8,
            border: '1px solid #1e293b',
            overflow: 'hidden'
          }}>
            <svg
              viewBox="0 0 1000 500"
              style={{ width: '100%', height: '100%', opacity: 0.85 }}
            >
              {/* Background Grid Lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
                {/* Glow Filter for Active Pins */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <rect width="1000" height="500" fill="url(#grid)" />

              {/* Stylized Continent Outlines */}
              {/* North America */}
              <path
                d="M 120 120 Q 180 80 260 100 T 320 180 T 260 260 T 180 240 T 140 180 Z"
                fill="#162032"
                stroke="#25354e"
                strokeWidth="1.5"
              />
              {/* South America */}
              <path
                d="M 280 280 Q 340 300 330 380 T 290 460 T 250 380 Z"
                fill="#162032"
                stroke="#25354e"
                strokeWidth="1.5"
              />
              {/* Europe */}
              <path
                d="M 460 110 Q 540 90 560 140 T 520 200 T 450 170 Z"
                fill="#1a273e"
                stroke="#334768"
                strokeWidth="1.5"
              />
              {/* Africa */}
              <path
                d="M 470 210 Q 560 220 570 310 T 530 400 T 460 320 T 440 240 Z"
                fill="#162032"
                stroke="#25354e"
                strokeWidth="1.5"
              />
              {/* Asia */}
              <path
                d="M 570 100 Q 750 70 850 140 T 820 280 T 680 260 T 580 180 Z"
                fill="#162032"
                stroke="#25354e"
                strokeWidth="1.5"
              />
              {/* Australia */}
              <path
                d="M 780 340 Q 860 330 870 390 T 810 430 T 760 380 Z"
                fill="#162032"
                stroke="#25354e"
                strokeWidth="1.5"
              />

              {/* Flight Arcs connecting JFK to London and Paris */}
              {/* JFK (285, 178) to London (495, 155) */}
              <path
                d="M 285 178 Q 390 110 495 155"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeDasharray="6 4"
                className="animate-pulse"
                opacity="0.75"
              />
              {/* JFK (285, 178) to Paris (508, 168) */}
              <path
                d="M 285 178 Q 395 125 508 168"
                fill="none"
                stroke="#818cf8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.45"
              />
              {/* JFK (285, 178) to Singapore (795, 292) */}
              <path
                d="M 285 178 Q 540 50 795 292"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.35"
              />
            </svg>

            {/* City Tracking Pins overlayed on map */}
            {Object.keys(advisories).map((cityName) => {
              const adv = advisories[cityName];
              const isSelected = selectedCity === cityName;
              const hasActiveTraveler = travelers.some(t => t.city === cityName && t.status === 'in_destination');
              const pinTraveler = travelers.find(t => t.city === cityName);

              return (
                <div
                  key={cityName}
                  onClick={() => {
                    setSelectedCity(cityName);
                    if (pinTraveler) setSelectedTraveler(pinTraveler);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${adv.coords.x}%`,
                    top: `${adv.coords.y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: isSelected ? 20 : 10
                  }}
                  title={`${cityName}: ${hasActiveTraveler ? 'Active Traveler Onsite' : 'Scheduled'}`}
                >
                  {/* Radar Ripple Animation for active traveler onsite */}
                  {hasActiveTraveler && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(16, 185, 129, 0.25)',
                      animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                    }} />
                  )}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '0.25rem 0.5rem',
                    borderRadius: 20,
                    backgroundColor: isSelected ? '#4f46e5' : (hasActiveTraveler ? '#065f46' : '#1e293b'),
                    border: `1.5px solid ${isSelected ? '#818cf8' : (hasActiveTraveler ? '#10b981' : '#475569')}`,
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    transition: 'all 0.2s ease'
                  }}>
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: hasActiveTraveler ? '#34d399' : (adv.riskLevel === 'medium' ? '#fbbf24' : '#94a3b8')
                    }}></span>
                    <span>{cityName}</span>
                    {pinTraveler && (
                      <span style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: 10,
                        padding: '1px 5px',
                        fontSize: '0.65rem'
                      }}>
                        {pinTraveler.name.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Map Legend */}
            <div style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid #334155',
              borderRadius: 6,
              padding: '0.4rem 0.75rem',
              fontSize: '0.7rem',
              display: 'flex',
              gap: 12,
              backdropFilter: 'blur(4px)'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }}></span> Active Onsite
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fbbf24' }}></span> Delay Watch
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#818cf8' }}></span> Selected Destination
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Selected City & Traveler Telemetry Card */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <span className="badge badge-info" style={{ fontSize: '0.7rem', marginBottom: 4 }}>
                DESTINATION TELEMETRY
              </span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f9fafb' }}>
                {currentAdvisory.city}, {currentAdvisory.country}
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                Primary Airport Hub: <strong>{currentAdvisory.airport}</strong>
              </span>
            </div>

            <span className={`badge ${currentAdvisory.riskLevel === 'medium' ? 'badge-warning' : 'badge-success'}`}>
              {currentAdvisory.riskLabel}
            </span>
          </div>

          {/* Regional Condition Box */}
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid #374151',
            borderRadius: 8,
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CloudSun size={14} /> Weather & Local Conditions:
              </span>
              <strong style={{ color: '#f3f4f6' }}>{currentAdvisory.weather}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Phone size={14} /> Local Emergency Line:
              </span>
              <strong style={{ color: '#ef4444' }}>{currentAdvisory.localEmergencyNumber}</strong>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#cbd5e1', borderTop: '1px solid #1f2937', paddingTop: 6 }}>
              {currentAdvisory.advisoryNote}
            </p>
          </div>

          {/* Personnel Assigned to this Destination */}
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#e5e7eb', display: 'block', marginBottom: 8 }}>
              Company Travelers in {currentAdvisory.city}:
            </span>

            {travelers.filter(t => t.city === selectedCity).length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.82rem', backgroundColor: '#111827', borderRadius: 8 }}>
                No active Voyentra personnel currently in {currentAdvisory.city}.
              </div>
            ) : (
              travelers.filter(t => t.city === selectedCity).map((traveler) => (
                <div
                  key={traveler.id}
                  style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    padding: '0.85rem',
                    marginBottom: 8
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: '#4f46e5',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}>
                        {traveler.name.charAt(0)}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#f3f4f6', display: 'block' }}>{traveler.name}</strong>
                        <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{traveler.role}</span>
                      </div>
                    </div>

                    <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                      {traveler.status === 'in_destination' ? 'ACTIVE ONSITE' : 'SCHEDULED'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', fontSize: '0.75rem', color: '#9ca3af', marginBottom: 8 }}>
                    <div>Flight: <strong style={{ color: '#f3f4f6' }}>{traveler.flight_number}</strong> ({traveler.pnr})</div>
                    <div>Dates: <strong style={{ color: '#f3f4f6' }}>{traveler.start_date.split('-').slice(1).join('/')} - {traveler.end_date.split('-').slice(1).join('/')}</strong></div>
                    <div style={{ gridColumn: 'span 2' }}>
                      Hotel: <strong style={{ color: '#f3f4f6' }}>{traveler.hotel}</strong>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #334155',
                    paddingTop: 6,
                    fontSize: '0.72rem'
                  }}>
                    <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={12} /> Safety Check-in: <strong>{traveler.safety_status.toUpperCase()}</strong>
                    </span>

                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setSelectedTraveler(traveler)}
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                    >
                      Emergency Contact Info
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Roster & Live Broadcast Activity Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#f3f4f6' }}>
            Active Duty of Care Safety Alerts & Traveler Check-ins
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            Alerts delivered to traveler mobile interfaces in real-time
          </span>
        </div>

        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af', backgroundColor: '#1f2937' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Alert Title & Target</th>
                <th style={{ padding: '0.75rem 1rem' }}>Severity</th>
                <th style={{ padding: '0.75rem 1rem' }}>Advisory Message</th>
                <th style={{ padding: '0.75rem 1rem' }}>Broadcast By</th>
                <th style={{ padding: '0.75rem 1rem' }}>Traveler Check-in Status</th>
              </tr>
            </thead>
            <tbody>
              {activeAlerts.map((alert) => (
                <tr key={alert.id} style={{ borderBottom: '1px solid #283548' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <strong style={{ color: '#f3f4f6', display: 'block' }}>{alert.title}</strong>
                    <span style={{ fontSize: '0.72rem', color: '#818cf8' }}>{alert.destination}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className={`badge ${alert.severity === 'critical' ? 'badge-error' : (alert.severity === 'warning' ? 'badge-warning' : 'badge-info')}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1', maxWidth: 320 }}>
                    {alert.message}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#9ca3af', fontSize: '0.75rem' }}>
                    <div>{alert.broadcast_by}</div>
                    <div>{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {alert.responses?.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span className="badge badge-success" style={{ alignSelf: 'flex-start' }}>
                          ✓ {alert.responses[0].traveler_name} Checked In Safe
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontStyle: 'italic' }}>
                          "{alert.responses[0].note}"
                        </span>
                      </div>
                    ) : (
                      <span className="badge badge-warning">Awaiting Traveler Confirmation</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Emergency Broadcast Modal */}
      {broadcastModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Radio size={18} />
                </div>
                <h3>Broadcast Duty of Care Advisory</h3>
              </div>
              <button onClick={() => setBroadcastModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {broadcastSuccess ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#34d399' }}>
                <CheckCircle size={36} style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{broadcastSuccess}</h4>
              </div>
            ) : (
              <form onSubmit={handleBroadcastAlert} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>
                    Target Travel Destination:
                  </label>
                  <select
                    className="btn-secondary"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 6, border: '1px solid #374151' }}
                    value={alertTargetCity}
                    onChange={(e) => setAlertTargetCity(e.target.value)}
                  >
                    <option value="London">London (LHR Travelers - Alex Morgan onsite)</option>
                    <option value="Paris">Paris (CDG Travelers)</option>
                    <option value="Singapore">Singapore (SIN Travelers)</option>
                    <option value="All Global Destinations">All Active Company Travelers Worldwide</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>
                    Alert Severity Level:
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${alertSeverity === 'advisory' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setAlertSeverity('advisory')}
                      style={{ flex: 1 }}
                    >
                      Advisory (Blue)
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${alertSeverity === 'warning' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setAlertSeverity('warning')}
                      style={{ flex: 1, backgroundColor: alertSeverity === 'warning' ? '#d97706' : undefined, borderColor: '#d97706' }}
                    >
                      Warning (Amber)
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${alertSeverity === 'critical' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setAlertSeverity('critical')}
                      style={{ flex: 1, backgroundColor: alertSeverity === 'critical' ? '#dc2626' : undefined, borderColor: '#dc2626' }}
                    >
                      Critical (Red)
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>
                    Emergency Advisory Instructions:
                  </label>
                  <textarea
                    rows={4}
                    className="btn-secondary"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 6, border: '1px solid #374151', color: '#f3f4f6', resize: 'vertical' }}
                    value={alertMessage}
                    onChange={(e) => setAlertMessage(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 4, display: 'block' }}>
                    This notification triggers a mandatory 1-click safety check-in prompt on the traveler's screen.
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setBroadcastModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#dc2626', borderColor: '#ef4444' }}>
                    <Send size={14} /> Send Broadcast Now
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Traveler Emergency Details Modal */}
      {selectedTraveler && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={20} style={{ color: '#10b981' }} />
                <h3>Traveler Duty of Care Profile</h3>
              </div>
              <button onClick={() => setSelectedTraveler(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem', fontSize: '0.85rem' }}>
              <div style={{ backgroundColor: '#111827', padding: '0.75rem', borderRadius: 8, border: '1px solid #374151' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f3f4f6' }}>{selectedTraveler.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{selectedTraveler.role} • {selectedTraveler.department}</div>
                <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: 4 }}>
                  Email: {selectedTraveler.email} • Phone: {selectedTraveler.phone}
                </div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '0.75rem', borderRadius: 8, border: '1px solid #374151' }}>
                <strong style={{ color: '#f3f4f6', display: 'block', marginBottom: 4 }}>Next of Kin / Emergency Contact:</strong>
                <div style={{ color: '#cbd5e1' }}>
                  <div>Name: <strong>{selectedTraveler.emergency_contact.name}</strong> ({selectedTraveler.emergency_contact.relation})</div>
                  <div>Phone: <strong style={{ color: '#34d399' }}>{selectedTraveler.emergency_contact.phone}</strong></div>
                </div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '0.75rem', borderRadius: 8, border: '1px solid #374151' }}>
                <strong style={{ color: '#f3f4f6', display: 'block', marginBottom: 4 }}>Travel Documents & Security:</strong>
                <div style={{ color: '#cbd5e1', fontSize: '0.78rem' }}>
                  <div>Passport: <strong>{selectedTraveler.passport.number}</strong> (Expires: {selectedTraveler.passport.expiry})</div>
                  <div>Active PNR: <strong style={{ color: '#fde047' }}>{selectedTraveler.pnr}</strong></div>
                  <div>Hotel: <strong>{selectedTraveler.hotel}</strong></div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button className="btn btn-primary" onClick={() => setSelectedTraveler(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
