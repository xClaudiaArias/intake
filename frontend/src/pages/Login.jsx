import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { TraceLine } from '../components/Layout.jsx';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        try {
        const user = await login(email, password);
        navigate(user.role === 'PATIENT' ? '/dashboard' : '/staff');
        } catch (err) {
        setError(err.response?.data?.error || 'Login failed');
        }
    }

    return (
        <div className="auth-page">
        <div className="page-header">
            <h1>Log in</h1>
            <TraceLine />
        </div>
        <div className="card">
            <form onSubmit={handleSubmit}>
            <label>
                Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
                Password
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit">Log in</button>
            </form>
        </div>
        <p className="hint" style={{ marginTop: 'var(--space-4)' }}>
            New patient? <Link to="/register">Register here</Link>
        </p>
        </div>
    );
}
