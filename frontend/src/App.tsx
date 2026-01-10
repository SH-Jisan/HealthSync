// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js'; // Import Session type
import { supabase } from './lib/supabaseClient';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './features/auth/LoginPage';
import AboutPage from './features/about/AboutPage';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Features
import DashboardPage from './features/dashboard/DashboardPage';
import ProfilePage from './features/profile/ProfilePage';
import BloodHome from './features/blood/BloodHome';
import RequestBlood from './features/blood/RequestBlood';
import BloodFeed from './features/blood/BloodFeed';
import DonorRegistration from './features/blood/DonorRegistration';
import DoctorList from './features/doctors/DoctorList';

function App() {
    // Fix: Used Session | null instead of any
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={!session ? <LandingPage /> : <Navigate to="/dashboard" />} />
                <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/dashboard" />} />
                <Route path="/about" element={<AboutPage />} />

                {/* Protected Routes (Dashboard Layout) */}
                <Route element={session ? <DashboardLayout /> : <Navigate to="/login" />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/profile" element={<ProfilePage />} />

                    {/* Blood Bank Routes */}
                    <Route path="/blood" element={<BloodHome />} />
                    <Route path="/blood/request" element={<RequestBlood />} />
                    <Route path="/blood/feed" element={<BloodFeed />} />
                    <Route path="/blood/register" element={<DonorRegistration />} />

                    {/* Doctor Routes */}
                    <Route path="/doctors" element={<DoctorList />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;