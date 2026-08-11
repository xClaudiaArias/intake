import React from 'react';
import { Link } from 'react-router-dom';
import { TraceLine } from '../components/Layout.jsx';

const FEATURES = [
  {
    title: 'Register once, digitally',
    body: 'Fill out your intake form from home — personal info, insurance, medical history — no clipboard, no re-writing it at every visit.',
    icon: (
      <path d="M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z M9 7h6M9 11h6M9 15h3" />
    ),
  },
  {
    title: 'Book your own time',
    body: 'See real open slots and pick what works for you, instead of playing phone tag with the front desk.',
    icon: <path d="M4 5h16v16H4V5Z M4 9h16 M8 3v4 M16 3v4 M9 13h2v2H9v-2Z" />,
  },
  {
    title: 'Tell us before you arrive',
    body: 'Share your reason for visit and symptoms ahead of time, so your provider walks in already informed.',
    icon: <path d="M12 21s-7-4.5-9.3-9A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 9.3 6c-2.3 4.5-9.3 9-9.3 9Z" />,
  },
];

function FeatureIcon({ children }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export default function Landing() {
  return (
    <div className="landing">
      <section className="hero">
        <span className="hero__eyebrow">Clinic Intake &amp; Scheduling Portal</span>
        <h1>Registration that doesn't start with a clipboard.</h1>
        <p className="hero__subhead">
          Patients register, book appointments, and share symptoms online before they ever reach the front desk.
          Staff see it all organized and ready, the moment it comes in.
        </p>
        <TraceLine />
        <div className="hero__actions">
          <Link to="/register"><button type="button" className="btn-primary-link">Get started</button></Link>
          <Link to="/login" className="hero__login-link">Already have an account? Log in</Link>
        </div>
      </section>

      <section className="feature-grid">
        {FEATURES.map((f) => (
          <div className="feature-card" key={f.title}>
            <FeatureIcon>{f.icon}</FeatureIcon>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </div>
        ))}
      </section>

      <section className="split-section">
        <div>
          <span className="split-section__label">For patients</span>
          <ul>
            <li>Complete your intake form on your own time, from any device</li>
            <li>Book, reschedule, or cancel appointments without a phone call</li>
            <li>Update your reason for visit right up until check-in</li>
          </ul>
        </div>
        <div>
          <span className="split-section__label">For staff</span>
          <ul>
            <li>See today's schedule with intake status at a glance</li>
            <li>Review the week ahead, organized by date</li>
            <li>Check patients in with one click, no paper to file</li>
          </ul>
        </div>
      </section>

      <section className="cta-banner">
        <h2>Ready to skip the waiting room paperwork?</h2>
        <Link to="/register"><button type="button" className="btn-primary-link">Create your account</button></Link>
      </section>
    </div>
  );
}
