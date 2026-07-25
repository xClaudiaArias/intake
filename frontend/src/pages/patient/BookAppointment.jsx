import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { TraceLine } from '../../components/Layout.jsx';

export default function BookAppointment() {
    const [slots, setSlots] = useState([]);
    const [reasonForVisit, setReasonForVisit] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        client.get('/slots').then((res) => setSlots(res.data));
    }, []);

    async function book(slotId) {
        setMessage('');
        try {
        await client.post('/appointments', { slotId, reasonForVisit });
        navigate('/dashboard');
        } catch (err) {
        setMessage(err.response?.data?.error || 'Could not book this slot');
        // Refresh slots in case it was taken by someone else
        client.get('/slots').then((res) => setSlots(res.data));
        }
    }

    return (
        <div>
        <div className="page-header">
            <h1>Book an appointment</h1>
            <TraceLine />
        </div>

        <div className="card">
            <label>
            Reason for visit
            <input value={reasonForVisit} onChange={(e) => setReasonForVisit(e.target.value)} placeholder="e.g. Annual checkup" />
            </label>
        </div>

        {message && <p className="error" style={{ marginTop: 'var(--space-4)' }}>{message}</p>}

        {slots.length === 0 ? (
            <p className="hint" style={{ marginTop: 'var(--space-4)' }}>No open slots right now.</p>
        ) : (
            <ul className="slot-list">
            {slots.map((slot) => (
                <li key={slot.id}>
                {new Date(slot.startTime).toLocaleString()}
                <button onClick={() => book(slot.id)}>Book</button>
                </li>
            ))}
            </ul>
        )}
        </div>
    );
}
