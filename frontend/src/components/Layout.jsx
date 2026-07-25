import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';


function TraceLine() {
    return (
        <svg width="120" height="10" viewBox="0 0 120 10" fill="none" aria-hidden="true">
        <path
            d="M0 5 H36 L42 1 L48 9 L54 5 H120"
            stroke="var(--border-strong)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
        />
        </svg>
    );
    }

    const NAV_LINKS = {
    PATIENT: [
        { to: '/dashboard', label: 'Appointments' },
        { to: '/intake', label: 'Intake form' },
        { to: '/book', label: 'Book a visit' },
    ],
    STAFF: [{ to: '/staff', label: "Today's patients" }],
    ADMIN: [{ to: '/staff', label: "Today's patients" }],
    };

    export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    function handleLogout() {
        logout();
        navigate('/login');
    }

    const links = user ? NAV_LINKS[user.role] || [] : [];

    return (
        <div className="app-shell">
        <header className="app-header">
            <Link to="/" className="app-header__brand">
            <svg className="app-header__mark" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="20" height="20" rx="5" stroke="var(--primary)" strokeWidth="1.5" />
                <path d="M11 6v10M6 11h10" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Clinic Portal
            </Link>

            {user && (
            <nav className="app-header__nav">
                {links.map((link) => (
                <Link key={link.to} to={link.to} className={location.pathname === link.to ? 'active' : ''}>
                    {link.label}
                </Link>
                ))}
            </nav>
            )}

            {user && (
            <div className="app-header__user">
                <span className="app-header__email">{user.email}</span>
                <button type="button" className="btn-logout" onClick={handleLogout}>
                Log out
                </button>
            </div>
            )}
        </header>

        <main className="app-main">{children}</main>
        </div>
    );
}

export { TraceLine };
