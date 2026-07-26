import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { TraceLine } from '../../components/Layout.jsx';
import { INSURANCE_PROVIDERS } from './insuranceProviders';

const CHRONIC_CONDITIONS = [
    'Diabetes',
    'Hypertension',
    'Asthma',
    'Heart disease',
    'Cancer',
    'Thyroid disorder',
    'Depression / anxiety',
];

const emptyState = {
    demographics: {
        fullName: '', address: '', city: '', state: '', zip: '',
        phone: '', email: '',
        sexAssignedAtBirth: '', maritalStatus: '',
        employer: '', occupation: '', preferredPharmacy: '',
    },
    emergencyContact: { name: '', relationship: '', phone: '' },
    insuranceInfo: {
        provider: '', otherProvider: '', memberId: '', groupNumber: '',
        policyholderName: '', policyholderRelationship: 'Self',
    },
    medicalHistory: {
        allergies: '', medications: '', pastSurgeries: '',
        chronicConditions: [], otherConditions: '', familyHistory: '',
    },
    lifestyle: { smokingStatus: '', alcoholUse: '', exerciseFrequency: '' },
    consent: { treatmentConsent: false, privacyAcknowledged: false, financialAcknowledged: false, signatureName: '' },
};

function useSection(initial) {
    const [value, setValue] = useState(initial);
    const update = (field) => (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setValue((prev) => ({ ...prev, [field]: val }));
    };
    return [value, setValue, update];
    }

    export default function IntakeForm() {
    const [status, setStatus] = useState('DRAFT');
    const [demographics, setDemographics, updateDemographics] = useSection(emptyState.demographics);
    const [emergencyContact, setEmergencyContact, updateEmergencyContact] = useSection(emptyState.emergencyContact);
    const [insuranceInfo, setInsuranceInfo, updateInsuranceInfo] = useSection(emptyState.insuranceInfo);
    const [medicalHistory, setMedicalHistory, updateMedicalHistory] = useSection(emptyState.medicalHistory);
    const [lifestyle, setLifestyle, updateLifestyle] = useSection(emptyState.lifestyle);
    const [consent, setConsent, updateConsent] = useSection(emptyState.consent);

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        client.get('/intake').then((res) => {
        const { form, profileDefaults } = res.data;

        setStatus(form?.status || 'DRAFT');

        // Prefill name/email from the account, but let a previously saved
        // draft's values win if the patient already edited them.
        setDemographics((prev) => ({
            ...prev,
            fullName: profileDefaults?.fullName || '',
            email: profileDefaults?.email || '',
            ...(form?.demographics || {}),
        }));

        if (!form) return;
        if (form.emergencyContact) setEmergencyContact((prev) => ({ ...prev, ...form.emergencyContact }));
        if (form.insuranceInfo) setInsuranceInfo((prev) => ({ ...prev, ...form.insuranceInfo }));
        if (form.medicalHistory) setMedicalHistory((prev) => ({ ...prev, ...form.medicalHistory }));
        if (form.lifestyle) setLifestyle((prev) => ({ ...prev, ...form.lifestyle }));
        if (form.consent) setConsent((prev) => ({ ...prev, ...form.consent }));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function toggleCondition(condition) {
        setMedicalHistory((prev) => {
        const has = prev.chronicConditions.includes(condition);
        return {
            ...prev,
            chronicConditions: has
            ? prev.chronicConditions.filter((c) => c !== condition)
            : [...prev.chronicConditions, condition],
        };
        });
    }

    async function saveDraft(e) {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
        await client.put('/intake', { demographics, emergencyContact, insuranceInfo, medicalHistory, lifestyle, consent });
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
        // Save the latest values first, so submit validates against what's on screen.
        await client.put('/intake', { demographics, emergencyContact, insuranceInfo, medicalHistory, lifestyle, consent });
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
    const showOtherInsurance = insuranceInfo.provider === 'Other';

    return (
        <div>
        <div className="page-header">
            <h1>Patient intake form</h1>
            <TraceLine />
        </div>

        <div style={{ marginBottom: 'var(--space-5)' }}>
            <span className={`badge badge--${status.toLowerCase()}`}>{status}</span>
        </div>

        {locked && (
            <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
            <p className="hint" style={{ margin: 0 }}>
                This form has been submitted and is locked. Contact the front desk to request a change.
            </p>
            </div>
        )}

        <form onSubmit={saveDraft} style={{ maxWidth: '640px', gap: 'var(--space-6)' }}>

            {/* ---------------- Personal / Demographic Information ---------------- */}
            <section className="card">
            <h2>Personal information</h2>
            <div className="form-grid">
                <label className="span-2">
                Full name
                <input value={demographics.fullName} onChange={updateDemographics('fullName')} disabled={locked} />
                </label>
                <label className="span-2">
                Street address
                <input value={demographics.address} onChange={updateDemographics('address')} disabled={locked} />
                </label>
                <label>
                City
                <input value={demographics.city} onChange={updateDemographics('city')} disabled={locked} />
                </label>
                <label>
                State
                <input value={demographics.state} onChange={updateDemographics('state')} disabled={locked} maxLength={2} placeholder="e.g. NY" />
                </label>
                <label>
                ZIP code
                <input value={demographics.zip} onChange={updateDemographics('zip')} disabled={locked} />
                </label>
                <label>
                Phone number
                <input type="tel" value={demographics.phone} onChange={updateDemographics('phone')} disabled={locked} />
                </label>
                <label>
                Email
                <input type="email" value={demographics.email} onChange={updateDemographics('email')} disabled={locked} />
                </label>
                <label>
                Sex assigned at birth
                <select value={demographics.sexAssignedAtBirth} onChange={updateDemographics('sexAssignedAtBirth')} disabled={locked}>
                    <option value="">Select…</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Intersex</option>
                    <option>Prefer not to say</option>
                </select>
                </label>
                <label>
                Marital status
                <select value={demographics.maritalStatus} onChange={updateDemographics('maritalStatus')} disabled={locked}>
                    <option value="">Select…</option>
                    <option>Single</option>
                    <option>Married</option>
                    <option>Divorced</option>
                    <option>Widowed</option>
                    <option>Separated</option>
                </select>
                </label>
                <label>
                Employer
                <input value={demographics.employer} onChange={updateDemographics('employer')} disabled={locked} />
                </label>
                <label>
                Occupation
                <input value={demographics.occupation} onChange={updateDemographics('occupation')} disabled={locked} />
                </label>
                <label className="span-2">
                Preferred pharmacy
                <input value={demographics.preferredPharmacy} onChange={updateDemographics('preferredPharmacy')} disabled={locked} placeholder="Name and location" />
                </label>
            </div>
            </section>

            {/* ---------------- Emergency Contact ---------------- */}
            <section className="card">
            <h2>Emergency contact</h2>
            <div className="form-grid">
                <label>
                Full name
                <input value={emergencyContact.name} onChange={updateEmergencyContact('name')} disabled={locked} />
                </label>
                <label>
                Relationship to patient
                <input value={emergencyContact.relationship} onChange={updateEmergencyContact('relationship')} disabled={locked} placeholder="e.g. Spouse" />
                </label>
                <label className="span-2">
                Phone number
                <input type="tel" value={emergencyContact.phone} onChange={updateEmergencyContact('phone')} disabled={locked} />
                </label>
            </div>
            </section>

            {/* ---------------- Insurance ---------------- */}
            <section className="card">
            <h2>Insurance information</h2>
            <div className="form-grid">
                <label className="span-2">
                Insurance provider
                <select value={insuranceInfo.provider} onChange={updateInsuranceInfo('provider')} disabled={locked}>
                    <option value="">Select…</option>
                    {INSURANCE_PROVIDERS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                    ))}
                </select>
                </label>
                {showOtherInsurance && (
                <label className="span-2">
                    Please specify your insurance provider
                    <input value={insuranceInfo.otherProvider} onChange={updateInsuranceInfo('otherProvider')} disabled={locked} />
                </label>
                )}
                <label>
                Member ID
                <input value={insuranceInfo.memberId} onChange={updateInsuranceInfo('memberId')} disabled={locked} />
                </label>
                <label>
                Group number
                <input value={insuranceInfo.groupNumber} onChange={updateInsuranceInfo('groupNumber')} disabled={locked} />
                </label>
                <label>
                Policyholder name
                <input value={insuranceInfo.policyholderName} onChange={updateInsuranceInfo('policyholderName')} disabled={locked} placeholder="If different from patient" />
                </label>
                <label>
                Policyholder relationship
                <select value={insuranceInfo.policyholderRelationship} onChange={updateInsuranceInfo('policyholderRelationship')} disabled={locked}>
                    <option>Self</option>
                    <option>Spouse</option>
                    <option>Parent</option>
                    <option>Other</option>
                </select>
                </label>
            </div>
            </section>

            {/* ---------------- Medical History ---------------- */}
            <section className="card">
            <h2>Medical history</h2>
            <div className="form-grid">
                <label className="span-2">
                Known allergies (medication, food, environmental)
                <textarea value={medicalHistory.allergies} onChange={updateMedicalHistory('allergies')} disabled={locked} placeholder="List allergies or write 'None'" />
                </label>
                <label className="span-2">
                Current medications
                <textarea value={medicalHistory.medications} onChange={updateMedicalHistory('medications')} disabled={locked} placeholder="Name, dosage, frequency" />
                </label>
                <label className="span-2">
                Past surgeries or hospitalizations
                <textarea value={medicalHistory.pastSurgeries} onChange={updateMedicalHistory('pastSurgeries')} disabled={locked} />
                </label>
            </div>

            <div style={{ marginTop: 'var(--space-4)' }}>
                <span className="hint" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                Do you have (or have you had) any of the following?
                </span>
                <div className="checkbox-grid">
                {CHRONIC_CONDITIONS.map((condition) => (
                    <label key={condition} className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={medicalHistory.chronicConditions.includes(condition)}
                        onChange={() => toggleCondition(condition)}
                        disabled={locked}
                    />
                    {condition}
                    </label>
                ))}
                </div>
            </div>

            <label style={{ marginTop: 'var(--space-4)' }}>
                Other conditions
                <input value={medicalHistory.otherConditions} onChange={updateMedicalHistory('otherConditions')} disabled={locked} />
            </label>
            <label style={{ marginTop: 'var(--space-4)' }}>
                Family medical history
                <textarea value={medicalHistory.familyHistory} onChange={updateMedicalHistory('familyHistory')} disabled={locked} placeholder="Significant conditions in immediate family" />
            </label>
            </section>

            {/* ---------------- Lifestyle ---------------- */}
            <section className="card">
            <h2>Lifestyle &amp; social history</h2>
            <div className="form-grid">
                <label>
                Smoking status
                <select value={lifestyle.smokingStatus} onChange={updateLifestyle('smokingStatus')} disabled={locked}>
                    <option value="">Select…</option>
                    <option>Never smoked</option>
                    <option>Former smoker</option>
                    <option>Current smoker</option>
                </select>
                </label>
                <label>
                Alcohol use
                <select value={lifestyle.alcoholUse} onChange={updateLifestyle('alcoholUse')} disabled={locked}>
                    <option value="">Select…</option>
                    <option>None</option>
                    <option>Occasional</option>
                    <option>Regular</option>
                </select>
                </label>
                <label className="span-2">
                Exercise frequency
                <select value={lifestyle.exerciseFrequency} onChange={updateLifestyle('exerciseFrequency')} disabled={locked}>
                    <option value="">Select…</option>
                    <option>Rarely / never</option>
                    <option>1–2 times per week</option>
                    <option>3 or more times per week</option>
                </select>
                </label>
            </div>
            </section>

            {/* ---------------- Consent ---------------- */}
            <section className="card">
            <h2>Consent &amp; acknowledgment</h2>
            <label className="checkbox-label">
                <input type="checkbox" checked={consent.treatmentConsent} onChange={updateConsent('treatmentConsent')} disabled={locked} />
                I consent to examination and treatment by clinic providers.
            </label>
            <label className="checkbox-label" style={{ marginTop: 'var(--space-2)' }}>
                <input type="checkbox" checked={consent.privacyAcknowledged} onChange={updateConsent('privacyAcknowledged')} disabled={locked} />
                I acknowledge receipt of the Notice of Privacy Practices.
            </label>
            <label className="checkbox-label" style={{ marginTop: 'var(--space-2)' }}>
                <input type="checkbox" checked={consent.financialAcknowledged} onChange={updateConsent('financialAcknowledged')} disabled={locked} />
                I understand I am financially responsible for any costs not covered by insurance.
            </label>
            <label style={{ marginTop: 'var(--space-4)' }}>
                Signature (type your full legal name)
                <input value={consent.signatureName} onChange={updateConsent('signatureName')} disabled={locked} placeholder="Full name as signature" />
            </label>
            <p className="hint" style={{ marginTop: 'var(--space-2)' }}>
                Today's date: {new Date().toLocaleDateString()}
            </p>
            </section>

            {message && <p className={message.includes('saved') || message.includes('submitted') ? 'hint' : 'error'}>{message}</p>}

            {!locked && (
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button type="submit" disabled={saving}>Save draft</button>
                <button type="button" onClick={submitForm} disabled={saving}>Submit form</button>
            </div>
            )}
        </form>
        </div>
    );
}
