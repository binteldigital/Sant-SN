import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import HospitalDetail from './pages/HospitalDetail';
import Booking from './pages/Booking';
import FlashDashboard from './pages/FlashDashboard';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Login from './pages/Login';
import Hospitals from './pages/Hospitals';
import Pharmacies from './pages/Pharmacies';

// Admin imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminHospitals from './pages/admin/Hospitals';
import AdminPharmacies from './pages/admin/Pharmacies';
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';
import AdminAppointments from './pages/admin/Appointments';

// Hospital Admin imports
import HospitalDashboard from './pages/hospital-admin/HospitalDashboard';

const ProtectedRoute = ({ children, requireAdmin = false, allowedRoles = [] }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (requireAdmin && !['super_admin', 'hospital_admin', 'support', 'doctor'].includes(user.role)) {
        return <Navigate to="/" replace />;
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="flex flex-col min-height-screen">
                    <Routes>
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        {/* Pages accessibles sans compte */}
                        <Route path="/" element={<Home />} />
                        <Route path="/hospital/:id" element={<HospitalDetail />} />
                        <Route path="/hospitals" element={<Hospitals />} />
                        <Route path="/pharmacies" element={<Pharmacies />} />
                        <Route path="/profile" element={<Profile />} />
                        {/* Pages nécessitant un compte */}
                        <Route path="/booking/:hospitalId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
                        <Route path="/flashdashboard" element={<FlashDashboard />} />
                                                <Route path="/dashboard" element={<FlashDashboard />} />
                        
                        {/* Admin Routes - Super Admin only */}
                        <Route path="/admin" element={<ProtectedRoute requireAdmin allowedRoles={['super_admin', 'support']}><AdminLayout /></ProtectedRoute>}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="appointments" element={<AdminAppointments />} />
                            <Route path="hospitals" element={<AdminHospitals />} />
                            <Route path="hospitals/new" element={<AdminHospitals />} />
                            <Route path="pharmacies" element={<AdminPharmacies />} />
                            <Route path="users" element={<AdminUsers />} />
                            <Route path="settings" element={<AdminSettings />} />
                        </Route>

                        {/* Hospital Admin Routes */}
                        <Route path="/hospital-admin" element={<ProtectedRoute allowedRoles={['hospital_admin', 'doctor']}><HospitalDashboard /></ProtectedRoute>} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
