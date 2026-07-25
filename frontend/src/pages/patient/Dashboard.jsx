import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { TraceLine } from '../../components/Layout.jsx';

export default function PatientDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        client
        .get('/appointments/mine')
        .then((res) => setAppointments(res.data))
        .finally(() => setLoading(false));
    }, []);

    return (
        <div>
        <div className="page-header">
            <h1>Your appointments</h1>
            <TraceLine />
        </div>
        <nav className="page-nav">
            <Link to="/intake">Complete intake form</Link>
            <Link to="/book">Book an appointment</Link>
        </nav>

        {loading ? (
            <p className="hint">Loading…</p>
        ) : appointments.length === 0 ? (
            <div className="card">
            <p className="hint" style={{ margin: 0 }}>No appointments yet — book your first visit above.</p>
            </div>
        ) : (
            <ul className="appt-list">
            {appointments.map((appt) => (
                <li key={appt.id}>
                <div>
                    <time>{new Date(appt.slot.startTime).toLocaleString()}</time>
                    {appt.reasonForVisit && (
                    <div className="hint" style={{ marginTop: 'var(--space-1)' }}>{appt.reasonForVisit}</div>
                    )}
                </div>
                <span className={`badge badge--${appt.status.toLowerCase()}`}>{appt.status}</span>
                </li>
            ))}
            </ul>
        )}
        </div>
    );
}
