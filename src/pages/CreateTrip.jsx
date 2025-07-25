import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/useAuth';
import { createTrip, addDestination } from '../services/api';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const CreateTrip = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Trip form state
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [tripType, setTripType] = useState('vacation');
    const [budget, setBudget] = useState('');
    const [travelerCount, setTravelerCount] = useState(1);
    const [image, setImage] = useState(null);

    // Destinations state
    const [destinations, setDestinations] = useState([
        {
            name: '',
            description: '',
            destination_type: '',
            address: '',
            visit_date: '',
            visit_time: '',
            price_range: '',
            priority_level: 3
        },
    ]);

    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        try {
            setUploading(true);
            let imageUrl = '';

            if (image) {
                const imageRef = ref(storage, `trips/${currentUser.uid}/${uuidv4()}-${image.name}`);
                await uploadBytes(imageRef, image);
                imageUrl = await getDownloadURL(imageRef);
            }

            // Create the trip first
            const trip = await createTrip({
                user_firebase_uid: currentUser.uid,
                title,
                notes,
                start_date: startDate,
                end_date: endDate,
                country,
                city,
                trip_type: tripType,
                budget: budget ? parseFloat(budget) : null,
                traveler_count: travelerCount,
                image_url: imageUrl,
            });

            // Add destinations with enhanced data
            for (let i = 0; i < destinations.length; i++) {
                const dest = destinations[i];
                if (dest.name.trim()) { // Only add destinations with names
                    await addDestination(trip.id, {
                        ...dest,
                        order_index: i + 1,
                        priority_level: parseInt(dest.priority_level) || 3
                    });
                }
            }

            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError('Failed to create trip. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const addDestinationField = () => {
        setDestinations([...destinations, {
            name: '',
            description: '',
            destination_type: '',
            address: '',
            visit_date: '',
            visit_time: '',
            price_range: '',
            priority_level: 3
        }]);
    };

    const removeDestinationField = (index) => {
        if (destinations.length > 1) {
            setDestinations(destinations.filter((_, i) => i !== index));
        }
    };

    const updateDestination = (index, field, value) => {
        const newDestinations = [...destinations];
        newDestinations[index][field] = value;
        setDestinations(newDestinations);
    };

    return (
        <>
            <link
                href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
                rel="stylesheet"
            />
            <div
                style={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    paddingTop: '2rem',
                    paddingBottom: '4rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Animated background elements */}
                <div
                    style={{
                        position: 'absolute',
                        top: '10%',
                        left: '5%',
                        width: '200px',
                        height: '200px',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                        borderRadius: '50%',
                        animation: 'float 8s ease-in-out infinite'
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '20%',
                        right: '10%',
                        width: '150px',
                        height: '150px',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
                        borderRadius: '50%',
                        animation: 'float 6s ease-in-out infinite reverse'
                    }}
                />

                <Container style={{ position: 'relative', zIndex: 2 }}>
                    {/* Header */}
                    <div className="d-flex align-items-center mb-4">
                        <Button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                color: 'white',
                                borderRadius: '15px',
                                padding: '10px 20px',
                                marginRight: '20px',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255,255,255,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255,255,255,0.2)';
                            }}
                        >
                            ← Back to Dashboard
                        </Button>
                        <h2
                            style={{
                                color: 'white',
                                fontSize: '2.2rem',
                                fontWeight: '700',
                                textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                margin: 0
                            }}
                        >
                            Create New Trip ✈️
                        </h2>
                    </div>

                    {/* Main Form Card */}
                    <div
                        style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '25px',
                            padding: '2rem',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        {error && (
                            <Alert
                                variant="danger"
                                style={{
                                    background: 'rgba(220, 53, 69, 0.2)',
                                    border: '1px solid rgba(220, 53, 69, 0.3)',
                                    color: 'white',
                                    borderRadius: '15px'
                                }}
                            >
                                {error}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            <Row>
                                {/* Left Column - Trip Details */}
                                <Col lg={6}>
                                    <h4
                                        style={{
                                            color: 'white',
                                            marginBottom: '1.5rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        📋 Trip Details
                                    </h4>

                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ color: 'white', fontWeight: '500' }}>
                                            Trip Title *
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            required
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                border: '1px solid rgba(255,255,255,0.3)',
                                                borderRadius: '12px',
                                                color: 'white',
                                                padding: '12px 16px'
                                            }}
                                            placeholder="e.g., Amazing Tokyo Adventure"
                                        />
                                    </Form.Group>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label style={{ color: 'white', fontWeight: '500' }}>
                                                    Trip Type
                                                </Form.Label>
                                                <Form.Select
                                                    value={tripType}
                                                    onChange={(e) => setTripType(e.target.value)}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.1)',
                                                        border: '1px solid rgba(255,255,255,0.3)',
                                                        borderRadius: '12px',
                                                        color: 'white',
                                                        padding: '12px 16px'
                                                    }}
                                                >
                                                    <option value="vacation">🏖️ Vacation</option>
                                                    <option value="business">💼 Business</option>
                                                    <option value="weekend">🌟 Weekend Getaway</option>
                                                    <option value="family">👨‍👩‍👧‍👦 Family Trip</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label style={{ color: 'white', fontWeight: '500' }}>
                                                    Number of Travelers
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min="1"
                                                    value={travelerCount}
                                                    onChange={(e) => setTravelerCount(parseInt(e.target.value))}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.1)',
                                                        border: '1px solid rgba(255,255,255,0.3)',
                                                        borderRadius: '12px',
                                                        color: 'white',
                                                        padding: '12px 16px'
                                                    }}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label style={{ color: 'white', fontWeight: '500' }}>
                                                    Country
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={country}
                                                    onChange={(e) => setCountry(e.target.value)}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.1)',
                                                        border: '1px solid rgba(255,255,255,0.3)',
                                                        borderRadius: '12px',
                                                        color: 'white',
                                                        padding: '12px 16px'
                                                    }}
                                                    placeholder="e.g., Japan"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label style={{ color: 'white', fontWeight: '500' }}>
                                                    City
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={city}
                                                    onChange={(e) => setCity(e.target.value)}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.1)',
                                                        border: '1px solid rgba(255,255,255,0.3)',
                                                        borderRadius: '12px',
                                                        color: 'white',
                                                        padding: '12px 16px'
                                                    }}
                                                    placeholder="e.g., Tokyo"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label style={{ color: 'white', fontWeight: '500' }}>
                                                    Start Date
                                                </Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.1)',
                                                        border: '1px solid rgba(255,255,255,0.3)',
                                                        borderRadius: '12px',
                                                        color: 'white',
                                                        padding: '12px 16px'
                                                    }}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label style={{ color: 'white', fontWeight: '500' }}>
                                                    End Date
                                                </Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.1)',
                                                        border: '1px solid rgba(255,255,255,0.3)',
                                                        borderRadius: '12px',
                                                        color: 'white',
                                                        padding: '12px 16px'
                                                    }}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ color: 'white', fontWeight: '500' }}>
                                            Budget (optional)
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="0.01"
                                            value={budget}
                                            onChange={(e) => setBudget(e.target.value)}
                                            style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                border: '1px solid rgba(255,255,255,0.3)',
                                                borderRadius: '12px',
                                                color: 'white',
                                                padding: '12px 16px'
                                            }}
                                            placeholder="e.g., 2500.00"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ color: 'white', fontWeight: '500' }}>
                                            Trip Image (optional)
                                        </Form.Label>
                                        <Form.Control
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                border: '1px solid rgba(255,255,255,0.3)',
                                                borderRadius: '12px',
                                                color: 'white',
                                                padding: '12px 16px'
                                            }}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label style={{ color: 'white', fontWeight: '500' }}>
                                            Notes
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                border: '1px solid rgba(255,255,255,0.3)',
                                                borderRadius: '12px',
                                                color: 'white',
                                                padding: '12px 16px'
                                            }}
                                            placeholder="Any special notes about your trip..."
                                        />
                                    </Form.Group>
                                </Col>

                                {/* Right Column - Destinations */}
                                <Col lg={6}>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h4
                                            style={{
                                                color: 'white',
                                                fontWeight: '600',
                                                margin: 0
                                            }}
                                        >
                                            📍 Places to Visit
                                        </h4>
                                        <Button
                                            type="button"
                                            onClick={addDestinationField}
                                            style={{
                                                background: 'linear-gradient(45deg, #ffd89b, #19547b)',
                                                border: 'none',
                                                color: 'white',
                                                borderRadius: '12px',
                                                padding: '8px 16px',
                                                fontSize: '0.9rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            + Add Place
                                        </Button>
                                    </div>

                                    <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
                                        {destinations.map((dest, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    background: 'rgba(255,255,255,0.1)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    borderRadius: '15px',
                                                    padding: '1.5rem',
                                                    marginBottom: '1rem',
                                                    position: 'relative'
                                                }}
                                            >
                                                {destinations.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        onClick={() => removeDestinationField(index)}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '10px',
                                                            right: '10px',
                                                            background: 'rgba(220, 53, 69, 0.3)',
                                                            border: '1px solid rgba(220, 53, 69, 0.5)',
                                                            color: 'white',
                                                            borderRadius: '50%',
                                                            width: '30px',
                                                            height: '30px',
                                                            padding: '0',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        ×
                                                    </Button>
                                                )}

                                                <Form.Group className="mb-3">
                                                    <Form.Label style={{ color: 'white', fontWeight: '500', fontSize: '0.9rem' }}>
                                                        Place Name *
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={dest.name}
                                                        onChange={(e) => updateDestination(index, 'name', e.target.value)}
                                                        style={{
                                                            background: 'rgba(255,255,255,0.1)',
                                                            border: '1px solid rgba(255,255,255,0.3)',
                                                            borderRadius: '10px',
                                                            color: 'white',
                                                            padding: '10px 12px'
                                                        }}
                                                        placeholder="e.g., Tokyo Tower, Central Park"
                                                    />
                                                </Form.Group>

                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label style={{ color: 'white', fontWeight: '500', fontSize: '0.9rem' }}>
                                                                Type
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={dest.destination_type}
                                                                onChange={(e) => updateDestination(index, 'destination_type', e.target.value)}
                                                                style={{
                                                                    background: 'rgba(255,255,255,0.1)',
                                                                    border: '1px solid rgba(255,255,255,0.3)',
                                                                    borderRadius: '10px',
                                                                    color: 'white',
                                                                    padding: '10px 12px'
                                                                }}
                                                                placeholder="restaurant, attraction, etc."
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label style={{ color: 'white', fontWeight: '500', fontSize: '0.9rem' }}>
                                                                Priority
                                                            </Form.Label>
                                                            <Form.Select
                                                                value={dest.priority_level}
                                                                onChange={(e) => updateDestination(index, 'priority_level', e.target.value)}
                                                                style={{
                                                                    background: 'rgba(255,255,255,0.1)',
                                                                    border: '1px solid rgba(255,255,255,0.3)',
                                                                    borderRadius: '10px',
                                                                    color: 'white',
                                                                    padding: '10px 12px'
                                                                }}
                                                            >
                                                                <option value={1}>⭐ Must See</option>
                                                                <option value={2}>🌟 High Priority</option>
                                                                <option value={3}>✨ Medium Priority</option>
                                                                <option value={4}>💫 Low Priority</option>
                                                                <option value={5}>🌙 If Time Allows</option>
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Form.Group className="mb-3">
                                                    <Form.Label style={{ color: 'white', fontWeight: '500', fontSize: '0.9rem' }}>
                                                        Address
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={dest.address}
                                                        onChange={(e) => updateDestination(index, 'address', e.target.value)}
                                                        style={{
                                                            background: 'rgba(255,255,255,0.1)',
                                                            border: '1px solid rgba(255,255,255,0.3)',
                                                            borderRadius: '10px',
                                                            color: 'white',
                                                            padding: '10px 12px'
                                                        }}
                                                        placeholder="Full address or general location"
                                                    />
                                                </Form.Group>

                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label style={{ color: 'white', fontWeight: '500', fontSize: '0.9rem' }}>
                                                                Visit Date
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="date"
                                                                value={dest.visit_date}
                                                                onChange={(e) => updateDestination(index, 'visit_date', e.target.value)}
                                                                style={{
                                                                    background: 'rgba(255,255,255,0.1)',
                                                                    border: '1px solid rgba(255,255,255,0.3)',
                                                                    borderRadius: '10px',
                                                                    color: 'white',
                                                                    padding: '10px 12px'
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label style={{ color: 'white', fontWeight: '500', fontSize: '0.9rem' }}>
                                                                Visit Time
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="time"
                                                                value={dest.visit_time}
                                                                onChange={(e) => updateDestination(index, 'visit_time', e.target.value)}
                                                                style={{
                                                                    background: 'rgba(255,255,255,0.1)',
                                                                    border: '1px solid rgba(255,255,255,0.3)',
                                                                    borderRadius: '10px',
                                                                    color: 'white',
                                                                    padding: '10px 12px'
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label style={{ color: 'white', fontWeight: '500', fontSize: '0.9rem' }}>
                                                                Price Range
                                                            </Form.Label>
                                                            <Form.Select
                                                                value={dest.price_range}
                                                                onChange={(e) => updateDestination(index, 'price_range', e.target.value)}
                                                                style={{
                                                                    background: 'rgba(255,255,255,0.1)',
                                                                    border: '1px solid rgba(255,255,255,0.3)',
                                                                    borderRadius: '10px',
                                                                    color: 'white',
                                                                    padding: '10px 12px'
                                                                }}
                                                            >
                                                                <option value="">Select price range</option>
                                                                <option value="$">$ Budget-friendly</option>
                                                                <option value="$$">$$ Moderate</option>
                                                                <option value="$$$">$$$ Expensive</option>
                                                                <option value="$$$$">$$$$ Luxury</option>
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Form.Group className="mb-0">
                                                    <Form.Label style={{ color: 'white', fontWeight: '500', fontSize: '0.9rem' }}>
                                                        Description
                                                    </Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={2}
                                                        value={dest.description}
                                                        onChange={(e) => updateDestination(index, 'description', e.target.value)}
                                                        style={{
                                                            background: 'rgba(255,255,255,0.1)',
                                                            border: '1px solid rgba(255,255,255,0.3)',
                                                            borderRadius: '10px',
                                                            color: 'white',
                                                            padding: '10px 12px'
                                                        }}
                                                        placeholder="What makes this place special?"
                                                    />
                                                </Form.Group>
                                            </div>
                                        ))}
                                    </div>
                                </Col>
                            </Row>

                            {/* Submit Button */}
                            <div className="text-center mt-4">
                                <Button
                                    type="submit"
                                    disabled={uploading}
                                    style={{
                                        background: uploading
                                            ? 'rgba(108, 117, 125, 0.3)'
                                            : 'linear-gradient(45deg, #ffd89b, #19547b)',
                                        border: 'none',
                                        color: 'white',
                                        padding: '15px 40px',
                                        fontSize: '1.1rem',
                                        borderRadius: '20px',
                                        fontWeight: '600',
                                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                                        transition: 'all 0.3s ease',
                                        minWidth: '200px'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!uploading) {
                                            e.target.style.transform = 'translateY(-3px)';
                                            e.target.style.boxShadow = '0 12px 35px rgba(0,0,0,0.3)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!uploading) {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                                        }
                                    }}
                                >
                                    {uploading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                style={{ marginRight: '10px' }}
                                            />
                                            Creating Trip...
                                        </>
                                    ) : (
                                        <>
                                            ✨ Create Amazing Trip
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Container>

                <style jsx>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(5deg); }
                    }
                    
                    /* Custom scrollbar for destinations */
                    ::-webkit-scrollbar {
                        width: 8px;
                    }
                    
                    ::-webkit-scrollbar-track {
                        background: rgba(255,255,255,0.1);
                        border-radius: 10px;
                    }
                    
                    ::-webkit-scrollbar-thumb {
                        background: rgba(255,255,255,0.3);
                        border-radius: 10px;
                    }
                    
                    ::-webkit-scrollbar-thumb:hover {
                        background: rgba(255,255,255,0.5);
                    }
                    
                    /* Form control focus states */
                    .form-control:focus,
                    .form-select:focus {
                        background: rgba(255,255,255,0.2) !important;
                        border-color: rgba(255,255,255,0.5) !important;
                        box-shadow: 0 0 0 0.2rem rgba(255,255,255,0.25) !important;
                        color: white !important;
                    }
                    
                    /* Placeholder text color */
                    .form-control::placeholder {
                        color: rgba(255,255,255,0.6) !important;
                    }
                    
                    /* Select option styling */
                    .form-select option {
                        background: #667eea !important;
                        color: white !important;
                    }
                `}</style>
            </div>
        </>
    );
}

export default CreateTrip;