import React, { useEffect, useState } from 'react';
import client from '../../api/client';

export default function StaffDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    function refresh() {
        client.get('/appointments/today').then((res) => setAppointments(res.data));
    }

    useEffect(() => {
        refresh();
        setLoading(false);
    }, []);

    async function checkIn(id) {
        await client.patch(`/appointments/${id}/check-in`);
        refresh();
    }

    return (
        <div>
        <h1>Today's patients</h1>
        {loading ? (
            <p>Loading…</p>
        ) : (
            <table>
            <thead>
                <tr>
                <th>Time</th>
                <th>Patient</th>
                <th>Intake status</th>
                <th>Reason for visit</th>
                <th>Checked in</th>
                <th></th>
                </tr>
            </thead>
            <tbody>
                {appointments.map((appt) => (
                <tr key={appt.id}>
                    <td>{new Date(appt.slot.startTime).toLocaleTimeString()}</td>
                    <td>{appt.patient.name}</td>
                    <td>{appt.patient.intakeForm?.status || 'NOT STARTED'}</td>
                    <td>{appt.reasonForVisit || '—'}</td>
                    <td>{appt.checkedInAt ? 'Yes' : 'No'}</td>
                    <td>
                    {!appt.checkedInAt && <button onClick={() => checkIn(appt.id)}>Check in</button>}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
        {!loading && appointments.length === 0 && <p>No appointments scheduled for today.</p>}
        </div>
    );
}
