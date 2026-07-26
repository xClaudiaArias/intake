import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { TraceLine } from '../../components/Layout.jsx';

function intakeBadge(appt) {
    const status = appt.patient.intakeForm?.status || 'NOT_STARTED';
    return (
        <span className={`badge badge--${status.toLowerCase().replace('_', '-')}`}>
        {status.replace('_', ' ')}
        </span>
    );
}

// Groups a flat list of appointments into { "Mon, Jan 5": [...], ... },
// keyed in calendar order (the API already returns them sorted by time).
function groupByDate(appointments) {
    const groups = new Map();
    for (const appt of appointments) {
        const key = new Date(appt.slot.startTime).toLocaleDateString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric',
        });
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(appt);
    }
    return groups;
}

export default function StaffDashboard() {
    const [today, setToday] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);

    function refresh() {
        Promise.all([
        client.get('/appointments/today'),
        client.get('/appointments/upcoming?days=7'),
        ]).then(([todayRes, upcomingRes]) => {
        setToday(todayRes.data);
        setUpcoming(upcomingRes.data);
        });
    }

    useEffect(() => {
        refresh();
        setLoading(false);
    }, []);

    async function checkIn(id) {
        await client.patch(`/appointments/${id}/check-in`);
        refresh();
    }

    const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const restOfWeek = upcoming.filter((appt) => {
        const key = new Date(appt.slot.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        return key !== todayLabel;
    });
    const weekGroups = groupByDate(restOfWeek);

    return (
        <div>
        <div className="page-header">
            <h1>Today's patients</h1>
            <TraceLine />
        </div>

        {loading ? (
            <p className="hint">Loading…</p>
        ) : today.length === 0 ? (
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
                {today.map((appt) => (
                    <tr key={appt.id}>
                    <td className="hint" style={{ fontFamily: 'var(--font-mono)' }}>
                        {new Date(appt.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>{appt.patient.name}</td>
                    <td>{intakeBadge(appt)}</td>
                    <td>{appt.reasonForVisit || '—'}</td>
                    <td>{appt.checkedInAt ? '✓' : '—'}</td>
                    <td>
                        {!appt.checkedInAt && <button onClick={() => checkIn(appt.id)}>Check in</button>}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}

        <div className="page-header" style={{ marginTop: 'var(--space-7)' }}>
            <h1>This week</h1>
            <TraceLine />
        </div>

        {!loading && weekGroups.size === 0 ? (
            <div className="card">
            <p className="hint" style={{ margin: 0 }}>No appointments booked for the rest of the week.</p>
            </div>
        ) : (
            Array.from(weekGroups.entries()).map(([dateLabel, appts]) => (
            <div key={dateLabel} className="day-group">
                <h3 className="day-group__label">{dateLabel}</h3>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table>
                    <thead>
                    <tr>
                        <th>Time</th>
                        <th>Patient</th>
                        <th>Intake</th>
                        <th>Reason for visit</th>
                    </tr>
                    </thead>
                    <tbody>
                    {appts.map((appt) => (
                        <tr key={appt.id}>
                        <td className="hint" style={{ fontFamily: 'var(--font-mono)' }}>
                            {new Date(appt.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>{appt.patient.name}</td>
                        <td>{intakeBadge(appt)}</td>
                        <td>{appt.reasonForVisit || '—'}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
            ))
        )}
        </div>
    );
}
