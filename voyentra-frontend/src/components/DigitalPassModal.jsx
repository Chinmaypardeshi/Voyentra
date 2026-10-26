import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  Plane,
  Building,
  QrCode,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  User,
  Luggage,
  PhoneCall,
  CheckCircle,
  Copy,
  Check
} from 'lucide-react';

export default function DigitalPassModal({ booking, trip, currentUser, onClose }) {
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      try {
        const id = booking?.id || booking?.supplier_reference || 'bk-101';
        const res = await fetch(`/api/voyentra/bookings/${id}/ticket`, {
          headers: {
            'x-user-id': currentUser?.id || '22222222-aaaa-bbbb-cccc-000000000002',
            'x-user-role': currentUser?.role || 'traveler'
          }
        });
        const json = await res.json();
        if (json.data) {
          setTicketData(json.data);
        }
      } catch (err) {
        console.warn('Failed to load dynamic ticket, using prop fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [booking, currentUser]);

  const isFlight = (booking?.booking_type || ticketData?.booking_type || 'flight') === 'flight';
  const travelerName = ticketData?.traveler?.name || `${currentUser?.first_name || 'Alex'} ${currentUser?.last_name || 'Morgan'}`;
  const pnr = ticketData?.supplier_reference || booking?.supplier_reference || 'BA-849201';

  const handlePrint = () => {
    window.print();
  };

  const handleCopyPNR = () => {
    navigator.clipboard.writeText(pnr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPassbook = () => {
    const payload = JSON.stringify(ticketData || { booking, trip }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Voyentra_Passbook_${pnr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)',
      padding: '1rem'
    }}>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #voyentra-printable-pass, #voyentra-printable-pass * {
            visibility: visible;
          }
          #voyentra-printable-pass {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #ffffff !important;
            color: #000000 !important;
            border: 1px solid #ccc !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="modal-card" style={{
        maxWidth: 860,
        width: '100%',
        backgroundColor: '#111827',
        border: '1px solid #374151',
        borderRadius: 16,
        padding: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        maxHeight: '92vh',
        overflowY: 'auto'
      }}>
        {/* Top Action Bar */}
        <div className="no-print" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          borderBottom: '1px solid #283548',
          paddingBottom: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              backgroundColor: isFlight ? 'rgba(99, 102, 241, 0.15)' : 'rgba(14, 165, 233, 0.15)',
              color: isFlight ? '#818cf8' : '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isFlight ? <Plane size={20} /> : <Building size={20} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f9fafb' }}>
                {isFlight ? 'Digital Flight Boarding Pass' : 'Corporate Hotel Stay Voucher'}
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                SRS Section 8 & 18 • Verified Airline Reservation & Corporate Card Settlement
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600 }}
              title="Print E-Ticket or Save to PDF"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button
              type="button"
              onClick={handleDownloadPassbook}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}
              title="Download Passbook JSON"
            >
              <Download size={14} /> Passbook
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 6, marginLeft: 4 }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Ticket Container */}
        <div id="voyentra-printable-pass">
          {isFlight ? (
            /* ================= FLIGHT BOARDING PASS ================= */
            <div style={{
              backgroundColor: '#182234',
              borderRadius: 14,
              border: '1px solid #334155',
              overflow: 'hidden',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)'
            }}>
              {/* Airline Banner */}
              <div style={{
                background: 'linear-gradient(90deg, #1e3a8a, #0369a1)',
                padding: '1rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#ffffff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Plane size={24} />
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                      {ticketData?.supplier_name || 'BRITISH AIRWAYS'}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                      Flight: {ticketData?.flight_details?.flight_number || 'BA 178'} • e-Ticket: {ticketData?.ticket_number || '084-294829104'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '0.2rem 0.6rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 4,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em'
                  }}>
                    {ticketData?.flight_details?.cabin || 'ECONOMY / IN-POLICY'}
                  </div>
                  <div style={{ fontSize: '0.72rem', marginTop: 2, opacity: 0.9 }}>
                    Frequent Flyer: {ticketData?.traveler?.frequent_flyer || 'BA-EC-8829104'}
                  </div>
                </div>
              </div>

              {/* Boarding Pass Body (2-Column Stub Layout) */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', minHeight: 260 }}>
                {/* Left Section: Flight Details */}
                <div style={{ padding: '1.5rem', borderRight: '2px dashed #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  {/* Route & Airport Codes */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1 }}>
                        {ticketData?.flight_details?.origin_code || 'JFK'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                        {ticketData?.flight_details?.origin_city || 'New York, USA'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {ticketData?.flight_details?.origin_terminal || 'Terminal 7'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 1rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, marginBottom: 4 }}>NON-STOP (7h 15m)</span>
                      <div style={{ width: 100, height: 2, backgroundColor: '#38bdf8', position: 'relative' }}>
                        <Plane size={14} style={{ position: 'absolute', top: -6, left: 42, color: '#38bdf8' }} />
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>Operated by Boeing 777-300ER</span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1 }}>
                        {ticketData?.flight_details?.destination_code || 'LHR'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                        {ticketData?.flight_details?.destination_city || 'London Heathrow'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {ticketData?.flight_details?.destination_terminal || 'Terminal 5'}
                      </div>
                    </div>
                  </div>

                  {/* Flight Parameters Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '0.75rem',
                    backgroundColor: '#0f172a',
                    padding: '0.85rem 1rem',
                    borderRadius: 8,
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>Passenger</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>{travelerName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>Boarding Time</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>
                        {ticketData?.flight_details?.boarding_time || '18:45'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>Departure</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>19:30 EST</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>Gate / Zone</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>
                        {ticketData?.flight_details?.gate || 'B24'} / {ticketData?.flight_details?.zone || 'Zone 3'}
                      </div>
                    </div>
                  </div>

                  {/* Baggage & Booking Ref */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Luggage size={14} style={{ color: '#10b981' }} />
                      <span>{ticketData?.flight_details?.baggage || '2 Checked Bags (23kg) + 1 Cabin'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>PNR Reference:</span>
                      <strong style={{ color: '#fde047', fontFamily: 'monospace', fontSize: '0.85rem' }}>{pnr}</strong>
                      <button
                        type="button"
                        onClick={handleCopyPNR}
                        className="no-print"
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
                        title="Copy PNR Locator"
                      >
                        {copied ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Stub Section: Boarding Gate Stub & Barcode */}
                <div style={{ padding: '1.25rem', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>BOARDING PASS</span>
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>CONFIRMED</span>
                    </div>

                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                      {travelerName.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 12 }}>
                      Flight {ticketData?.flight_details?.flight_number || 'BA 178'} • JFK $\rightarrow$ LHR
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                      <div style={{ backgroundColor: '#1e293b', padding: '0.4rem 0.6rem', borderRadius: 6 }}>
                        <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>SEAT</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#38bdf8' }}>
                          {ticketData?.flight_details?.seat || '14A'}
                        </div>
                      </div>
                      <div style={{ backgroundColor: '#1e293b', padding: '0.4rem 0.6rem', borderRadius: 6 }}>
                        <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>GATE</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f59e0b' }}>
                          {ticketData?.flight_details?.gate || 'B24'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Aztec / 2D Barcode Rendering */}
                  <div style={{ textAlign: 'center', borderTop: '1px solid #1e293b', paddingTop: 8 }}>
                    <div style={{
                      backgroundColor: '#ffffff',
                      padding: 8,
                      borderRadius: 6,
                      display: 'inline-flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      <QrCode size={78} style={{ color: '#000000' }} />
                      <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#000000', fontWeight: 700, marginTop: 2 }}>
                        {pnr}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: 4 }}>
                      Scan at airport security & e-gate
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ================= HOTEL CHECK-IN VOUCHER ================= */
            <div style={{
              backgroundColor: '#182234',
              borderRadius: 14,
              border: '1px solid #334155',
              overflow: 'hidden',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)'
            }}>
              {/* Hotel Header Banner */}
              <div style={{
                background: 'linear-gradient(90deg, #0f766e, #0e7490)',
                padding: '1rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#ffffff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Building size={24} />
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                      {ticketData?.hotel_details?.hotel_name || booking?.supplier_name || 'The Langham London'}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                      Confirmation Voucher: {ticketData?.supplier_reference || booking?.supplier_reference || 'MAR-502914'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-success" style={{ backgroundColor: '#ffffff', color: '#0f766e', fontWeight: 700 }}>
                    CORPORATE PRE-PAID
                  </span>
                  <div style={{ fontSize: '0.72rem', marginTop: 2, opacity: 0.9 }}>
                    5 Nights • Executive King
                  </div>
                </div>
              </div>

              {/* Hotel Details Body */}
              <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                    <MapPin size={16} style={{ color: '#38bdf8' }} />
                    <span>{ticketData?.hotel_details?.address || '1C Portland Pl, London W1B 1JA, United Kingdom'}</span>
                  </div>

                  {/* Dates & Times */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    backgroundColor: '#0f172a',
                    padding: '1rem',
                    borderRadius: 8,
                    marginBottom: '1.25rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Check-In Date</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f1f5f9' }}>Nov 10, 2026</div>
                      <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>From 15:00 GMT</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Check-Out Date</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f1f5f9' }}>Nov 15, 2026</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Until 11:00 GMT</div>
                    </div>
                  </div>

                  {/* Room Details & Inclusions */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>
                      Room Type & Corporate Inclusions:
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>
                      {ticketData?.hotel_details?.room_type || 'Executive Deluxe King Room (Non-Smoking)'}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(ticketData?.hotel_details?.amenities || [
                        'Breakfast Included',
                        'High-Speed Wi-Fi',
                        'Executive Lounge Access'
                      ]).map((am, i) => (
                        <span key={i} className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                          ✓ {am}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Corporate Policy Note: Room charges and daily breakfast settled directly to corporate card. Incidentals (minibar, spa) must be submitted via Voyentra Expense OCR claims.
                  </div>
                </div>

                {/* Voucher QR Code & Front Desk Info */}
                <div style={{ backgroundColor: '#0f172a', borderRadius: 8, padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>
                      HOTEL CHECK-IN QR
                    </div>
                    <div style={{
                      backgroundColor: '#ffffff',
                      padding: 10,
                      borderRadius: 8,
                      display: 'inline-block',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}>
                      <QrCode size={100} style={{ color: '#000000' }} />
                      <div style={{ fontSize: '0.7rem', color: '#000000', fontWeight: 700, fontFamily: 'monospace', marginTop: 4 }}>
                        {pnr}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 12 }}>
                    Present this voucher and employee corporate ID at front desk upon arrival.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Security & Emergency Assistance Footer */}
          <div style={{
            marginTop: '1.25rem',
            padding: '0.85rem 1.25rem',
            backgroundColor: '#1e293b',
            borderRadius: 8,
            border: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.78rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8' }}>
              <ShieldCheck size={16} />
              <span>
                <strong>Duty of Care Emergency Protection Active:</strong> Hotline {ticketData?.emergency_contact?.duty_of_care_hotline || '+1-800-869-7233 (+1-800-VOY-SAFE)'}
              </span>
            </div>

            <div style={{ color: '#94a3b8' }}>
              Corporate Policy: <strong>{ticketData?.emergency_contact?.policy_id || 'VOY-ENT-GL-2026-99'}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
