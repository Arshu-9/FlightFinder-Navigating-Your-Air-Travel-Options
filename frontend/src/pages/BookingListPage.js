import React, { useState, useEffect, useCallback } from 'react';
import { Container, Alert, Spinner, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './BookingListPage.css';

// Helper to safely format dates
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '-');
    } catch {
        return 'Invalid Date';
    }
};

const BookingListPage = () => {
    const { logout } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/bookings');
            setBookings(response.data || []);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch bookings. Please check the server or your access rights.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleCancelTicket = async (bookingId) => {
        if (window.confirm('Are you sure you want to cancel this ticket?')) {
            try {
                await api.put(`/admin/bookings/${bookingId}/cancel`);
                fetchBookings(); // Refresh after cancel
            } catch (err) {
                console.error(err);
                setError('Failed to cancel booking. Try again later.');
            }
        }
    };

    return (
        <div className="admin-bookings-page">
            <header className="admin-header">
                <div className="brand">SKY MATE 👑(Admin)</div>
                <nav className="nav-links">
                    <Link to="/admin">Home</Link>
                    <Link to="/admin/users">Users</Link>
                    <Link to="/admin/bookings">Bookings</Link>
                    <Link to="/admin/flights">Flights</Link>
                    <a href="/login" onClick={logout}>Logout</a>
                </nav>
            </header>

            <main className="admin-content">
                <Container fluid>
                    <h2 className="page-title">All Bookings</h2>

                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" />
                            <p className="mt-2">Loading bookings...</p>
                        </div>
                    ) : (
                        <Row>
                            {bookings.length > 0 ? bookings.map((booking) => (
                                <Col lg={6} md={12} key={booking._id} className="mb-4">
                                    <div className="admin-booking-card">
                                        <p><strong>Booking ID:</strong> {booking._id}</p>
                                        <p>
                                            <strong>Mobile:</strong> {booking.user?.phone || 'N/A'} &nbsp;&nbsp;
                                            <strong>Email:</strong> {booking.user?.email || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Flight No:</strong> {booking.flight?.flightNumber || 'N/A'} &nbsp;&nbsp;
                                            <strong>Airline:</strong> {booking.flight?.airline || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>From:</strong> {booking.flight?.departure?.city || 'N/A'} &nbsp;&nbsp;
                                            <strong>To:</strong> {booking.flight?.arrival?.city || 'N/A'}
                                        </p>

                                        <div>
                                            <strong>Passengers:</strong>
                                            <ol className="passengers-list">
                                                {booking.passengers?.map((p, idx) => (
                                                    <li key={idx}>Name: {p.name}, Age: {p.age || 'N/A'}</li>
                                                ))}
                                            </ol>
                                        </div>

                                        <p><strong>Seats:</strong> {booking.seatsBooked?.join(', ') || 'N/A'}</p>
                                        <p>
                                            <strong>Booking Date:</strong> {formatDate(booking.createdAt)} &nbsp;&nbsp;
                                            <strong>Journey Date:</strong> {formatDate(booking.flight?.departure?.date)}
                                        </p>
                                        <p>
                                            <strong>Journey Time:</strong> {booking.flight?.departure?.time || 'N/A'} &nbsp;&nbsp;
                                            <strong>Total Price:</strong> ${booking.totalPrice?.toFixed(2) || '0.00'}
                                        </p>

                                        <p className="d-flex align-items-center">
                                            <strong className="me-2">Booking Status:</strong>
                                            <span className={`status-text status-${booking.bookingStatus || 'unknown'}`}>
                                                {booking.bookingStatus || 'Unknown'}
                                            </span>
                                        </p>

                                        {booking.bookingStatus === 'confirmed' && (
                                            <Button
                                                variant="danger"
                                                className="cancel-button"
                                                onClick={() => handleCancelTicket(booking._id)}
                                            >
                                                Cancel Ticket
                                            </Button>
                                        )}
                                    </div>
                                </Col>
                            )) : (
                                <Col>
                                    <Alert variant="info">No bookings found.</Alert>
                                </Col>
                            )}
                        </Row>
                    )}
                </Container>
            </main>
        </div>
    );
};

export default BookingListPage;
