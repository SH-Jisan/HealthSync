import { Routes, Route, Navigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { PATHS } from './paths';

// Route Wrappers
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Layouts
import DashboardLayout from '../components/layout/DashboardLayout';

// Pages
import LandingPage from '../pages/landing/LandingPage';
import LoginPage from '../features/auth/LoginPage';
import SignupPage from '../features/auth/SignupPage';
import AboutPage from '../features/about/AboutPage';

// Feature Pages
import DashboardPage from '../pages/dashboard/DashboardPage';
import ProfilePage from '../features/profile/ProfilePage';
import EditProfile from '../features/profile/EditProfile';
import PatientAppointments from '../features/appointments/PatientAppointments';
import NotificationsPage from '../features/notifications/NotificationsPage';

// Blood Bank
import BloodHome from '../features/blood/BloodHome';
import RequestBlood from '../features/blood/RequestBlood';
import BloodFeed from '../features/blood/BloodFeed';
import DonorRegistration from '../features/blood/DonorRegistration';
import DonorSearch from '../features/blood/DonorSearch';
import MyBloodRequests from '../features/blood/MyBloodRequests';

// Doctor
import DoctorList from '../features/doctor/DoctorList';
import DoctorPatientProfile from '../features/doctor/DoctorPatientProfile';

interface AppRoutesProps {
    session: Session | null;
}

const AppRoutes = ({ session }: AppRoutesProps) => {
    return (
        <Routes>
            {/* Public-only routes (redirect to dashboard if logged in) */}
            <Route element={<PublicRoute session={session} />}>
                <Route path={PATHS.LANDING} element={<LandingPage />} />
                <Route path={PATHS.LOGIN} element={<LoginPage />} />
                <Route path={PATHS.SIGNUP} element={<SignupPage />} />
            </Route>

            {/* Public routes (always accessible) */}
            <Route path={PATHS.ABOUT} element={<AboutPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute session={session} />}>
                <Route element={<DashboardLayout />}>
                    <Route path={PATHS.DASHBOARD} element={<DashboardPage />} />
                    <Route path={PATHS.PATIENT_DETAILS} element={<DoctorPatientProfile />} />
                    <Route path={PATHS.PROFILE} element={<ProfilePage />} />
                    <Route path={PATHS.PROFILE_EDIT} element={<EditProfile />} />
                    <Route path={PATHS.APPOINTMENTS} element={<PatientAppointments />} />
                    <Route path={PATHS.NOTIFICATIONS} element={<NotificationsPage />} />

                    {/* Blood Bank */}
                    <Route path={PATHS.BLOOD_HOME} element={<BloodHome />} />
                    <Route path={PATHS.BLOOD_REQUEST} element={<RequestBlood />} />
                    <Route path={PATHS.BLOOD_FEED} element={<BloodFeed />} />
                    <Route path={PATHS.BLOOD_REGISTER} element={<DonorRegistration />} />
                    <Route path={PATHS.BLOOD_SEARCH} element={<DonorSearch />} />
                    <Route path={PATHS.BLOOD_MY_REQUESTS} element={<MyBloodRequests />} />

                    {/* Doctor */}
                    <Route path={PATHS.DOCTORS} element={<DoctorList />} />
                </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to={session ? PATHS.DASHBOARD : PATHS.LANDING} replace />} />
        </Routes>
    );
};

export default AppRoutes;
