
import React, { useState } from 'react';
import { Plane, Hotel, MapPin, CalendarDays, Search, ArrowLeft } from 'lucide-react';

export default function Travel({ onBack }) {
  const [travelType, setTravelType] = useState('flight');
  const [from, setFrom] = useState('Lagos');
  const [destination, setDestination] = useState('');
  const [departure, setDeparture] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [results, setResults] = useState(false);
  const [message, setMessage] = useState('');

  const destinations = [
    { city: 'Abuja', country: 'Nigeria', price: 85000 },
    { city: 'Port Harcourt', country: 'Nigeria', price: 95000 },
    { city: 'Accra', country: 'Ghana', price: 180000 },
    { city: 'London', country: 'United Kingdom', price: 750000 },
  ];

  const money = (amount) =>
    amount.toLocaleString('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    });

  const searchTrips = (event) => {
    event.preventDefault();

    if (!destination.trim() || !departure) {
      setMessage('Please enter a destination and departure date.');
      setResults(false);
      return;
    }

    if (departure < new Date().toISOString().slice(0, 10)) {
      setMessage('Please choose a future departure date.');
      setResults(false);
      return;
    }

    if (returnDate && returnDate < departure) {
      setMessage('Return date cannot be before departure.');
      setResults(false);
      return;
    }

    setMessage('');
    setResults(true);
  };

  const matchingTrips = destinations.filter((trip) =>
    trip.city.toLowerCase().includes(destination.toLowerCase()) ||
    trip.country.toLowerCase().includes(destination.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <button
        onClick={onBack}
        className="btn btn-secondary"
        style={{ alignSelf: 'flex-start' }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <section className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa',
          }}>
            {travelType === 'flight'
              ? <Plane size={24} />
              : <Hotel size={24} />}
          </div>

          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              Travel with MiniBank
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Explore destinations and plan your next trip.
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: 10,
          marginTop: 24,
          marginBottom: 20,
        }}>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setTravelType('flight');
              setResults(false);
              setMessage('');
            }}
            style={{
              background: travelType === 'flight'
                ? 'rgba(59, 130, 246, 0.18)'
                : undefined,
            }}
          >
            <Plane size={16} /> Flights
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => {
              setTravelType('hotel');
              setResults(false);
              setMessage('');
            }}
            style={{
              background: travelType === 'hotel'
                ? 'rgba(59, 130, 246, 0.18)'
                : undefined,
            }}
          >
            <Hotel size={16} /> Hotels
          </button>
        </div>

        <form onSubmit={searchTrips} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
        }}>
          <label style={{ display: 'grid', gap: 7 }}>
            <span style={{ fontSize: '0.85rem' }}>From</span>
            <input
              className="form-input"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              placeholder="Departure city"
              required
            />
          </label>

          <label style={{ display: 'grid', gap: 7 }}>
            <span style={{ fontSize: '0.85rem' }}>Destination</span>
            <input
              className="form-input"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="Where do you want to go?"
              required
            />
          </label>

          <label style={{ display: 'grid', gap: 7 }}>
            <span style={{ fontSize: '0.85rem' }}>
              {travelType === 'flight' ? 'Departure date' : 'Check-in date'}
            </span>
            <input
              className="form-input"
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={departure}
              onChange={(event) => setDeparture(event.target.value)}
              required
            />
          </label>

          <label style={{ display: 'grid', gap: 7 }}>
            <span style={{ fontSize: '0.85rem' }}>
              {travelType === 'flight' ? 'Return date (optional)' : 'Check-out date'}
            </span>
            <input
              className="form-input"
              type="date"
              min={departure || new Date().toISOString().slice(0, 10)}
              value={returnDate}
              onChange={(event) => setReturnDate(event.target.value)}
            />
          </label>

          {travelType === 'flight' && (
            <label style={{ display: 'grid', gap: 7 }}>
              <span style={{ fontSize: '0.85rem' }}>Passengers</span>
              <select
                className="form-input"
                value={passengers}
                onChange={(event) => setPassengers(event.target.value)}
              >
                <option value="1">1 passenger</option>
                <option value="2">2 passengers</option>
                <option value="3">3 passengers</option>
                <option value="4">4 passengers</option>
                <option value="5">5 passengers</option>
              </select>
            </label>
          )}

          <button
            className="btn btn-primary"
            type="submit"
            style={{ alignSelf: 'end', minHeight: 42 }}
          >
            <Search size={16} /> Search {travelType === 'flight' ? 'Flights' : 'Hotels'}
          </button>
        </form>

        {message && (
          <p role="alert" style={{ color: '#fb7185', marginTop: 16 }}>
            {message}
          </p>
        )}
      </section>

      {results && (
        <section className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>
            Demo {travelType === 'flight' ? 'Flight' : 'Hotel'} Results
          </h2>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            marginBottom: 18,
          }}>
            {from} to {destination} · {departure}
            {returnDate ? ` to ${returnDate}` : ''}
            {travelType === 'flight' ? ` · ${passengers} passenger(s)` : ''}
          </p>

          {matchingTrips.length === 0 ? (
            <p>No sample destinations match that search. Try Abuja, Accra, London, or Port Harcourt.</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14,
            }}>
              {matchingTrips.map((trip) => (
                <article
                  key={trip.city}
                  style={{
                    padding: 18,
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <MapPin size={20} color="#60a5fa" />
                  <h3 style={{ fontWeight: 700, marginTop: 10 }}>
                    {trip.city}, {trip.country}
                  </h3>

                  <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    marginTop: 5,
                  }}>
                    {travelType === 'flight'
                      ? 'Sample one-way fare'
                      : 'Sample nightly hotel rate'}
                  </p>

                  <p style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    marginTop: 10,
                  }}>
                    {money(
                      trip.price *
                      (travelType === 'flight' ? Number(passengers) : 1)
                    )}
                  </p>

                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%', marginTop: 14 }}
                    onClick={() => setMessage(
                      `Demo selection: ${trip.city}. No real booking or payment has been made.`
                    )}
                  >
                    Select {travelType === 'flight' ? 'Flight' : 'Hotel'}
                  </button>
                </article>
              ))}
            </div>
          )}

          <p style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginTop: 20,
          }}>
            Demo only: destinations and prices are examples, not live travel offers.
            No real reservations or payments are made.
          </p>
        </section>
      )}
    </div>
  );
}
