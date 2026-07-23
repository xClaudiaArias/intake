import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', dob: '' });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    function update(field) {
        return (e) => setForm({ ...form, [field]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        try {
        await register(form);
        navigate('/dashboard');
        } catch (err) {
        setError(err.response?.data?.error || 'Registration failed');
        }
    }

    return (
            <div className="auth-page">
            <h1>Create your account</h1>
            <form onSubmit={handleSubmit}>
                <label>
                Full name
                <input value={form.name} onChange={update('name')} required />
                </label>
                <label>
                Date of birth
                <input type="date" value={form.dob} onChange={update('dob')} required />
                </label>
                <label>
                Email
                <input type="email" value={form.email} onChange={update('email')} required />
                </label>
                <label>
                Password
                <input type="password" value={form.password} onChange={update('password')} required minLength={8} />
                </label>
                {error && <p className="error">{error}</p>}
                <button type="submit">Create account</button>
            </form>
            </div>
        );
}
