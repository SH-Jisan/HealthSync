// src/App.tsx Update
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './features/dashboard/DashboardPage';
import ProfilePage from "./features/profile/ProfilePage.tsx";

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
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
export default App;