import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { TraceLine } from '../../components/Layout.jsx';

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
        <div className="page-header">
            <h1>Today's patients</h1>
            <TraceLine />
        </div>

        {loading ? (
            <p className="hint">Loading…</p>
        ) : appointments.length === 0 ? (
            <div className="card">
            <p className="hint" style={{ margin: 0 }}>No appointments scheduled for today.</p>
            </div>
        ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table>
                <thead>
                <tr>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Intake</th>
                    <th>Reason for visit</th>
                    <th>Checked in</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {appointments.map((appt) => {
                    const intakeStatus = appt.patient.intakeForm?.status || 'NOT_STARTED';
                    return (
                    <tr key={appt.id}>
                        <td className="hint" style={{ fontFamily: 'var(--font-mono)' }}>
                        {new Date(appt.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>{appt.patient.name}</td>
                        <td>
                        <span className={`badge badge--${intakeStatus.toLowerCase().replace('_', '-')}`}>
                            {intakeStatus.replace('_', ' ')}
                        </span>
                        </td>
                        <td>{appt.reasonForVisit || '—'}</td>
                        <td>{appt.checkedInAt ? '✓' : '—'}</td>
                        <td>
                        {!appt.checkedInAt && <button onClick={() => checkIn(appt.id)}>Check in</button>}
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
            </div>
        )}
        </div>
    );
}
