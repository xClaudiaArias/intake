import React, { useEffect, useState } from 'react';
import client from '../../api/client';

export default function IntakeForm() {
    const [status, setStatus] = useState('DRAFT');
    const [allergies, setAllergies] = useState('');
    const [medications, setMedications] = useState('');
    const [insuranceProvider, setInsuranceProvider] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        client.get('/intake').then((res) => {
        const form = res.data;
        if (!form) return;
        setStatus(form.status);
        setAllergies(form.medicalHistory?.allergies || '');
        setMedications(form.medicalHistory?.medications || '');
        setInsuranceProvider(form.insuranceInfo?.provider || '');
        });
    }, []);

    async function saveDraft(e) {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
        await client.put('/intake', {
            medicalHistory: { allergies, medications },
            insuranceInfo: { provider: insuranceProvider },
        });
        setMessage('Draft saved.');
        } catch (err) {
        setMessage(err.response?.data?.error || 'Could not save draft');
        } finally {
        setSaving(false);
        }
    }

    async function submitForm() {
        setSaving(true);
        setMessage('');
        try {
        await client.post('/intake/submit');
        setStatus('SUBMITTED');
        setMessage('Intake form submitted.');
        } catch (err) {
        setMessage(err.response?.data?.error || 'Could not submit');
        } finally {
        setSaving(false);
        }
    }

    const locked = status === 'SUBMITTED';

    return (
        <div>
        <h1>Patient intake form</h1>
        {locked && <p>This form has been submitted. Contact the front desk to make changes.</p>}
        <form onSubmit={saveDraft}>
            <label>
            Known allergies
            <textarea value={allergies} onChange={(e) => setAllergies(e.target.value)} disabled={locked} />
            </label>
            <label>
            Current medications
            <textarea value={medications} onChange={(e) => setMedications(e.target.value)} disabled={locked} />
            </label>
            <label>
            Insurance provider
            <input value={insuranceProvider} onChange={(e) => setInsuranceProvider(e.target.value)} disabled={locked} />
            </label>
            {message && <p>{message}</p>}
            {!locked && (
            <div>
                <button type="submit" disabled={saving}>Save draft</button>
                <button type="button" onClick={submitForm} disabled={saving}>Submit form</button>
            </div>
            )}
        </form>
        </div>
    );
}
