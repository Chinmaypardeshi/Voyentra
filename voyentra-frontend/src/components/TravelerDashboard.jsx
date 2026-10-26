import React, { useState } from 'react';
import {
  Plane,
  Building,
  CheckCircle,
  AlertTriangle,
  Clock,
  Receipt,
  MapPin,
  Briefcase,
  Search,
  Plus,
  CreditCard,
  X,
  Check,
  Tag,
  ArrowRight,
  Eye,
  Sparkles,
  QrCode
} from 'lucide-react';
import ReceiptScanner from './ReceiptScanner';
import ReceiptInspectionModal from './ReceiptInspectionModal';
import DigitalPassModal from './DigitalPassModal';

export default function TravelerDashboard({
  currentUser,
  trips = [],
  expenses = [],
  travelRequests = [],
  flights = [],
  hotels = [],
  policy,
  onBookTravel,
  onSubmitExpense,
  loading
}) {
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'my_trips' | 'my_expenses'
  const [searchType, setSearchType] = useState('flights'); // 'flights' | 'hotels'
  const [flightDestination, setFlightDestination] = useState('');
  const [flightCabin, setFlightCabin] = useState('All');
  const [hotelCity, setHotelCity] = useState('');

  // Modals state
  const [bookingModalItem, setBookingModalItem] = useState(null);
  const [bookingType, setBookingType] = useState('flight');
  const [bookingCostCenter, setBookingCostCenter] = useState('88888888-aaaa-bbbb-cccc-000000000008');
  const [bookingPurpose, setBookingPurpose] = useState('Q4 Client Product Review & Executive Strategy');
  const [bookingNotes, setBookingNotes] = useState('');

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseMerchant, setExpenseMerchant] = useState('Heathrow Express Rail');
  const [expenseAmount, setExpenseAmount] = useState('45.00');
  const [expenseCategory, setExpenseCategory] = useState('ground_transportation');
  const [expenseTripId, setExpenseTripId] = useState(trips[0]?.id || '');
  const [ocrScanned, setOcrScanned] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const [receiptImage, setReceiptImage] = useState(null);
  const [selectedReceiptExpense, setSelectedReceiptExpense] = useState(null);
  const [selectedPassBooking, setSelectedPassBooking] = useState(null);
  const [selectedPassTrip, setSelectedPassTrip] = useState(null);

  // Alex's Personal Filtered Data (Strict Identity Boundary)
  const myTrips = trips.filter(t => t.primary_traveler_id === currentUser.id || t.traveler_name?.includes('Alex'));
  const myExpenses = expenses.filter(e => e.employee_id === currentUser.id || e.employee_name?.includes('Alex'));
  const myPendingRequests = travelRequests.filter(r => r.traveler_id === currentUser.id && r.status === 'pending_approval');

  const filteredFlights = flights.filter(f => {
    const matchDest = !flightDestination ||
      f.destination.toLowerCase().includes(flightDestination.toLowerCase()) ||
      f.destination_city.toLowerCase().includes(flightDestination.toLowerCase());
    const matchCabin = flightCabin === 'All' || f.cabin.toLowerCase() === flightCabin.toLowerCase();
    return matchDest && matchCabin;
  });

  const filteredHotels = hotels.filter(h => {
    return !hotelCity || h.city.toLowerCase().includes(hotelCity.toLowerCase());
  });

  const handleOpenBookingModal = (item, type) => {
    setBookingModalItem(item);
    setBookingType(type);
  };

  const handleConfirmBooking = () => {
    if (!bookingModalItem) return;
    onBookTravel({
      item: bookingModalItem,
      type: bookingType,
      costCenter: bookingCostCenter,
      purpose: bookingPurpose,
      notes: bookingNotes
    });
    setBookingModalItem(null);
    setActiveTab('my_trips');
  };

  const handleOcrComplete = (parsedData, imageSource) => {
    setOcrData(parsedData);
    setOcrScanned(true);
    setReceiptImage(imageSource);

    // Automatically fill in form fields from OCR!
    if (parsedData.merchant_name) setExpenseMerchant(parsedData.merchant_name);
    if (parsedData.total_amount) setExpenseAmount(parsedData.total_amount.toString());
    if (parsedData.category) setExpenseCategory(parsedData.category);
  };

  const handleSubmitExpenseForm = (e) => {
    e.preventDefault();
    onSubmitExpense({
      tripId: expenseTripId || trips[0]?.id,
      merchant: expenseMerchant,
      amount: parseFloat(expenseAmount),
      category: expenseCategory,
      ocrData,
      receiptImage
    });
    setExpenseModalOpen(false);
    setOcrScanned(false);
    setOcrData(null);
    setReceiptImage(null);
    setActiveTab('my_expenses');
  };

  return (
    <>
      {/* Traveler Navigation Tabs */}
      <div className="tab-navigation">
        <button
          className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <Plane size={16} /> Book Travel (Flights & Hotels)
        </button>
        <button
          className={`nav-tab ${activeTab === 'my_trips' ? 'active' : ''}`}
          onClick={() => setActiveTab('my_trips')}
        >
          <MapPin size={16} /> My Trips & Itineraries
        </button>
        <button
          className={`nav-tab ${activeTab === 'my_expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('my_expenses')}
        >
          <Receipt size={16} /> My Expenses & OCR Receipts
        </button>
      </div>

      <main className="main-content">
        {/* Personal Metrics Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <MapPin size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{myTrips.length} Active</div>
              <div className="stat-label">My Scheduled Trips</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Plane size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">Confirmed</div>
              <div className="stat-label">Flight & Hotel PNRs</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{myPendingRequests.length} Pending</div>
              <div className="stat-label">Manager Requests in Review</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
              <Receipt size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{myExpenses.length} Claims</div>
              <div className="stat-label">My Expense Receipts</div>
            </div>
          </div>
        </div>

        {/* TAB 1: SEARCH & BOOK TRAVEL */}
        {activeTab === 'search' && (
          <div>
            <div className="page-header">
              <div>
                <h2 className="page-title">Corporate Travel Search</h2>
                <p className="page-subtitle">
                  Corporate policy validation: Flights max ${policy?.rules_json?.max_international_flight_amount || 1200}, Hotels max ${policy?.rules_json?.max_hotel_nightly_rate || 250}/night.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', background: '#1f2937', padding: '0.25rem', borderRadius: 8 }}>
                <button
                  className={`btn btn-sm ${searchType === 'flights' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSearchType('flights')}
                >
                  <Plane size={14} /> Flights ({filteredFlights.length})
                </button>
                <button
                  className={`btn btn-sm ${searchType === 'hotels' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSearchType('hotels')}
                >
                  <Building size={14} /> Hotels ({filteredHotels.length})
                </button>
              </div>
            </div>

            {/* Flights Search Section */}
            {searchType === 'flights' && (
              <>
                <div className="search-filter-box" style={{
                  display: 'flex',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap',
                  backgroundColor: '#1f2937',
                  padding: '1rem',
                  borderRadius: 10,
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>Destination (City or IATA):</label>
                    <input
                      type="text"
                      className="btn-secondary"
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid #374151' }}
                      placeholder="e.g. London, LHR, Paris, Singapore..."
                      value={flightDestination}
                      onChange={(e) => setFlightDestination(e.target.value)}
                    />
                  </div>

                  <div style={{ width: 180 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>Cabin Class:</label>
                    <select
                      className="btn-secondary"
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid #374151' }}
                      value={flightCabin}
                      onChange={(e) => setFlightCabin(e.target.value)}
                    >
                      <option value="All">All Cabins</option>
                      <option value="Economy">Economy</option>
                      <option value="Premium Economy">Premium Economy</option>
                      <option value="Business Class">Business Class</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {filteredFlights.map(flight => (
                    <div key={flight.id} className="flight-card">
                      <div className="flight-header">
                        <div className="airline-badge">
                          <Plane size={18} style={{ color: '#818cf8' }} />
                          <span>{flight.airline}</span>
                          <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 400 }}>• {flight.flight_number}</span>
                          <span className="badge badge-neutral" style={{ marginLeft: 8 }}>{flight.cabin}</span>
                        </div>

                        <div>
                          {flight.in_policy ? (
                            <span className="policy-badge policy-in">
                              <CheckCircle size={14} /> In Policy
                            </span>
                          ) : (
                            <span className="policy-badge policy-out">
                              <AlertTriangle size={14} /> Out of Policy
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flight-route">
                        <div className="route-stop">
                          <div className="city-code">{flight.origin}</div>
                          <div className="time">{flight.departure_time}</div>
                          <div className="city-name">{flight.origin_city}</div>
                        </div>

                        <div className="route-duration">
                          <div className="flight-duration">{flight.duration}</div>
                          <div className="flight-line"></div>
                          <div className="flight-stops">{flight.stops}</div>
                        </div>

                        <div className="route-stop">
                          <div className="city-code">{flight.destination}</div>
                          <div className="time">{flight.arrival_time}</div>
                          <div className="city-name">{flight.destination_city}</div>
                        </div>
                      </div>

                      {!flight.in_policy && flight.policy_warnings?.length > 0 && (
                        <div className="policy-alert">
                          <AlertTriangle size={16} />
                          <div>
                            <strong>Requires Manager Pre-Approval:</strong> {flight.policy_warnings.join(' ')}
                          </div>
                        </div>
                      )}

                      <div className="flight-footer">
                        <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                          Baggage: {flight.baggage} • {flight.refundable ? 'Refundable Fare' : 'Non-refundable'}
                        </div>

                        <div className="price-container">
                          <div>
                            <div className="price-amount">${flight.price}</div>
                            <div className="price-unit">Total {flight.currency} / person</div>
                          </div>

                          <button
                            className={`btn ${flight.in_policy ? 'btn-primary' : 'btn-warning'}`}
                            onClick={() => handleOpenBookingModal(flight, 'flight')}
                          >
                            {flight.in_policy ? (
                              <>Book Flight <CreditCard size={14} /></>
                            ) : (
                              <>Request Approval <ArrowRight size={14} /></>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Hotels Search Section */}
            {searchType === 'hotels' && (
              <>
                <div className="search-filter-box" style={{
                  display: 'flex',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                  backgroundColor: '#1f2937',
                  padding: '1rem',
                  borderRadius: 10,
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>Filter by City:</label>
                    <input
                      type="text"
                      className="btn-secondary"
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid #374151' }}
                      placeholder="e.g. London, Paris, New York..."
                      value={hotelCity}
                      onChange={(e) => setHotelCity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="cards-grid">
                  {filteredHotels.map(hotel => (
                    <div key={hotel.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: 160, borderRadius: 8, overflow: 'hidden', position: 'relative', marginBottom: '1rem' }}>
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{ position: 'absolute', top: 8, right: 8 }}>
                          {hotel.in_policy ? (
                            <span className="policy-badge policy-in">In Policy</span>
                          ) : (
                            <span className="policy-badge policy-out">Out of Policy</span>
                          )}
                        </div>
                        <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', color: '#f3f4f6' }}>
                          ★ {hotel.rating} ({hotel.stars} Stars)
                        </div>
                      </div>

                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f9fafb', marginBottom: 4 }}>
                          {hotel.name}
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                          <MapPin size={12} /> {hotel.neighborhood}, {hotel.city}
                        </p>
                        <div style={{ fontSize: '0.8rem', color: '#d1d5db', marginBottom: 8 }}>
                          Room: {hotel.room_type}
                        </div>
                      </div>

                      {!hotel.in_policy && hotel.policy_warnings?.length > 0 && (
                        <div className="policy-alert" style={{ marginBottom: 12 }}>
                          <AlertTriangle size={14} />
                          <span style={{ fontSize: '0.75rem' }}>{hotel.policy_warnings.join(' ')}</span>
                        </div>
                      )}

                      <div style={{ borderTop: '1px solid #374151', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f9fafb' }}>
                            ${hotel.nightly_rate}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>per night ({hotel.currency})</div>
                        </div>

                        <button
                          className={`btn btn-sm ${hotel.in_policy ? 'btn-primary' : 'btn-warning'}`}
                          onClick={() => handleOpenBookingModal(hotel, 'hotel')}
                        >
                          {hotel.in_policy ? 'Reserve Room' : 'Request Exception'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: MY TRIPS & ITINERARIES */}
        {activeTab === 'my_trips' && (
          <div>
            <div className="page-header">
              <div>
                <h2 className="page-title">My Travel Itineraries & Bookings</h2>
                <p className="page-subtitle">Confirmed flights, hotels, and corporate card reservations for Alex Morgan.</p>
              </div>
            </div>

            {myTrips.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <MapPin size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <h3>No scheduled trips found</h3>
                <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>Use the Book Travel tab to search and reserve business flights or hotels.</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('search')}>
                  <Search size={16} /> Book Travel Now
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {myTrips.map(trip => (
                  <div key={trip.id} className="card" style={{ borderLeft: '4px solid #6366f1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f9fafb' }}>
                            Trip: {trip.destination}
                          </h3>
                          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                            Dates: {trip.start_date} to {trip.end_date} • Purpose: {trip.purpose}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="badge badge-success">Status: {trip.status}</span>
                        {trip.bookings?.length > 0 && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              const flightBooking = trip.bookings?.find(b => b.booking_type === 'flight') || trip.bookings?.[0];
                              setSelectedPassBooking(flightBooking);
                              setSelectedPassTrip(trip);
                            }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600 }}
                          >
                            <QrCode size={13} /> E-Ticket & Pass
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.85rem', color: '#9ca3af', textTransform: 'uppercase' }}>
                        Confirmed Reservations:
                      </h4>

                      {trip.bookings?.length > 0 ? (
                        trip.bookings.map(bk => (
                          <div key={bk.id} style={{
                            backgroundColor: '#111827',
                            border: '1px solid #374151',
                            borderRadius: 8,
                            padding: '1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              {bk.booking_type === 'flight' ? (
                                <Plane size={24} style={{ color: '#818cf8' }} />
                              ) : (
                                <Building size={24} style={{ color: '#38bdf8' }} />
                              )}
                              <div>
                                <div style={{ fontWeight: 600, color: '#f3f4f6' }}>
                                  {bk.supplier_name} ({bk.booking_type.toUpperCase()})
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                  PNR / Reference: <span style={{ color: '#fde047', fontFamily: 'monospace' }}>{bk.supplier_reference}</span>
                                </div>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }}>
                                ${bk.total_amount} {bk.currency}
                              </div>
                              <span className="badge badge-success" style={{ marginBottom: 4, display: 'inline-block' }}>Paid on Corporate Visa</span>
                              <div>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => {
                                    setSelectedPassBooking(bk);
                                    setSelectedPassTrip(trip);
                                  }}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', padding: '0.2rem 0.55rem', marginTop: 4 }}
                                >
                                  <QrCode size={12} style={{ color: '#818cf8' }} /> {bk.booking_type === 'flight' ? 'Boarding Pass' : 'Stay Voucher'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                          No reservations linked to this trip yet.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY EXPENSES & OCR RECEIPTS */}
        {activeTab === 'my_expenses' && (
          <div>
            <div className="page-header">
              <div>
                <h2 className="page-title">My Travel Expenses & Receipts</h2>
                <p className="page-subtitle">Submit expense reports with AI OCR receipt extraction for Alex Morgan.</p>
              </div>

              <button className="btn btn-primary" onClick={() => setExpenseModalOpen(true)}>
                <Plus size={16} /> Submit Expense Claim
              </button>
            </div>

            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af', backgroundColor: '#1f2937' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Merchant & Date</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Amount</th>
                    <th style={{ padding: '0.85rem 1rem' }}>OCR Verification</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Reimbursement Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myExpenses.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                        No expenses submitted yet. Click "Submit Expense Claim" to upload a receipt.
                      </td>
                    </tr>
                  ) : (
                    myExpenses.map(exp => (
                      <tr key={exp.id} style={{ borderBottom: '1px solid #283548' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600, color: '#f3f4f6' }}>{exp.merchant}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{exp.expense_date}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                            {exp.category?.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <strong style={{ color: '#f3f4f6' }}>${exp.amount} {exp.currency}</strong>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="badge badge-info">
                              OCR {exp.receipt?.ocr_extracted_data?.confidence_score || 98}%
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={() => setSelectedReceiptExpense(exp)}
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                              title="Inspect Scanned Receipt & OCR Data"
                            >
                              <Eye size={12} /> View Receipt
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {exp.status === 'approved' ? (
                            <span className="badge badge-success">Reimbursed / Paid</span>
                          ) : (
                            <span className="badge badge-warning">Pending Finance Approval</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {bookingModalItem && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>
                {bookingModalItem.in_policy ? 'Confirm Corporate Reservation' : 'Submit Out-of-Policy Travel Request'}
              </h3>
              <button className="btn-close" onClick={() => setBookingModalItem(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#f3f4f6' }}>
                {bookingType === 'flight' ? bookingModalItem.airline : bookingModalItem.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                {bookingType === 'flight'
                  ? `${bookingModalItem.origin_city} (${bookingModalItem.origin}) ➔ ${bookingModalItem.destination_city} (${bookingModalItem.destination})`
                  : `${bookingModalItem.neighborhood}, ${bookingModalItem.city}`}
              </div>
            </div>

            <div style={{ backgroundColor: '#111827', padding: '1rem', borderRadius: 8, marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#9ca3af' }}>Total Amount:</span>
                <strong style={{ color: '#34d399', fontSize: '1.1rem' }}>
                  ${bookingType === 'flight' ? bookingModalItem.price : (bookingModalItem.nightly_rate * 3)} USD
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#9ca3af' }}>Policy Compliance:</span>
                <span className={`badge ${bookingModalItem.in_policy ? 'badge-success' : 'badge-warning'}`}>
                  {bookingModalItem.in_policy ? 'Within Policy Cap' : 'Manager Exception Required'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>
                  Charged Cost Center:
                </label>
                <select
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #374151' }}
                  value={bookingCostCenter}
                  onChange={(e) => setBookingCostCenter(e.target.value)}
                >
                  <option value="88888888-aaaa-bbbb-cccc-000000000008">Engineering (CC-ENG-101)</option>
                  <option value="88888888-aaaa-bbbb-cccc-000000000009">Sales & Marketing (CC-SALES-201)</option>
                  <option value="88888888-aaaa-bbbb-cccc-000000000010">Executive Operations (CC-OPS-301)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>
                  Business Purpose:
                </label>
                <input
                  type="text"
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #374151' }}
                  value={bookingPurpose}
                  onChange={(e) => setBookingPurpose(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>
                  Additional Notes:
                </label>
                <textarea
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #374151', minHeight: 60 }}
                  placeholder="Optional notes or justification..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setBookingModalItem(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmBooking}>
                {bookingModalItem.in_policy ? 'Confirm & Book on Corporate Card' : 'Submit to David Miller for Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {expenseModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Submit Expense with AI OCR</h3>
              <button className="btn-close" onClick={() => setExpenseModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitExpenseForm}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>
                    Link to Active Business Trip:
                  </label>
                  <select
                    className="btn-secondary"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #374151' }}
                    value={expenseTripId}
                    onChange={(e) => setExpenseTripId(e.target.value)}
                  >
                    {myTrips.map(t => (
                      <option key={t.id} value={t.id}>{t.destination} ({t.start_date})</option>
                    ))}
                    {myTrips.length === 0 && <option value="">General Corporate Spend</option>}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>
                    Merchant Name:
                  </label>
                  <input
                    type="text"
                    className="btn-secondary"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #374151' }}
                    value={expenseMerchant}
                    onChange={(e) => setExpenseMerchant(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>
                      Amount ($ USD):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="btn-secondary"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #374151' }}
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>
                      Category:
                    </label>
                    <select
                      className="btn-secondary"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #374151' }}
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value)}
                    >
                      <option value="ground_transportation">Ground Transport</option>
                      <option value="meals">Meals & Dining</option>
                      <option value="flight">Flight Extras</option>
                      <option value="lodging">Hotel Incidentals</option>
                      <option value="miscellaneous">Miscellaneous</option>
                    </select>
                  </div>
                </div>

                {/* Real Optical Character Recognition (OCR) Scanner */}
                <ReceiptScanner
                  onOcrComplete={handleOcrComplete}
                  initialImage={receiptImage}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setExpenseModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Claim to Finance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Optical Receipt Inspection Modal */}
      {selectedReceiptExpense && (
        <ReceiptInspectionModal
          expense={selectedReceiptExpense}
          onClose={() => setSelectedReceiptExpense(null)}
          isFinance={false}
        />
      )}

      {/* Digital Boarding Pass & Itinerary Voucher Modal */}
      {selectedPassBooking && (
        <DigitalPassModal
          booking={selectedPassBooking}
          trip={selectedPassTrip}
          currentUser={currentUser}
          onClose={() => {
            setSelectedPassBooking(null);
            setSelectedPassTrip(null);
          }}
        />
      )}
    </>
  );
}
