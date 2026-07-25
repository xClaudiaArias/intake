import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import PatientDashboard from './pages/patient/Dashboard.jsx';
import IntakeForm from './pages/patient/IntakeForm.jsx';
import BookAppointment from './pages/patient/BookAppointment.jsx';
import StaffDashboard from './pages/staff/Dashboard.jsx';

import './App.css';

function Home() {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return <Navigate to={user.role === 'PATIENT' ? '/dashboard' : '/staff'} replace />;
    }

    export default function App() {
    return (
        <AuthProvider>
        <Layout>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
                path="/dashboard"
                element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                    <PatientDashboard />
                </ProtectedRoute>
                }
            />
            <Route
                path="/intake"
                element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                    <IntakeForm />
                </ProtectedRoute>
                }
            />
            <Route
                path="/book"
                element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                    <BookAppointment />
                </ProtectedRoute>
                }
            />

            <Route
                path="/staff"
                element={
                <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                    <StaffDashboard />
                </ProtectedRoute>
                }
            />
            </Routes>
        </Layout>
        </AuthProvider>
    );
}
