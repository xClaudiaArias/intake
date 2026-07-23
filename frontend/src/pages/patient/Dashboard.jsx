import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';

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
        <h1>Your appointments</h1>
        <nav>
            <Link to="/intake">Complete intake form</Link> · <Link to="/book">Book an appointment</Link>
        </nav>

        {loading ? (
            <p>Loading…</p>
        ) : appointments.length === 0 ? (
            <p>No appointments yet.</p>
        ) : (
            <ul>
            {appointments.map((appt) => (
                <li key={appt.id}>
                {new Date(appt.slot.startTime).toLocaleString()} — {appt.status}
                {appt.reasonForVisit && ` — ${appt.reasonForVisit}`}
                </li>
            ))}
            </ul>
        )}
        </div>
    );
}
