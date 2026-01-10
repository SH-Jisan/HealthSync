// src/App.tsx Update
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './features/dashboard/DashboardPage';
import ProfilePage from "./features/profile/ProfilePage.tsx";
import BloodHome from "./features/blood/BloodHome.tsx";
import RequestBlood from "./features/blood/RequestBlood.tsx";
import BloodFeed from "./features/blood/BloodFeed.tsx";
import DonorRegistration from "./features/blood/DonorRegistration.tsx";
import DoctorList from "./features/doctors/DoctorList.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* পাবলিক রুট */}
                <Route path="/" element={<LoginPage />} />

                {/* প্রোটেক্টেড রুট (Sidebar সহ) */}
                <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/profile" element={<ProfilePage/>} />
                    <Route path="/blood" element={<BloodHome />} />
                    <Route path="/blood/request" element={<RequestBlood />} />
                    <Route path="/blood/feed" element={<BloodFeed />} />
                    <Route path="/blood/register" element={<DonorRegistration />} />
                    <Route path="/doctors" element={<DoctorList />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
export default App;