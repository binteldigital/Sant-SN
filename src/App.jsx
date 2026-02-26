import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import HospitalDetail from './pages/HospitalDetail';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
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

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (requireAdmin && !['super_admin', 'hospital_admin', 'support'].includes(user.role)) {
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
                        <Route path="/dashboard" element={<Dashboard />} />
                        
                        {/* Admin Routes */}
                        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="hospitals" element={<AdminHospitals />} />
                            <Route path="hospitals/new" element={<AdminHospitals />} />
                            <Route path="pharmacies" element={<AdminPharmacies />} />
                            <Route path="users" element={<AdminUsers />} />
                            <Route path="settings" element={<AdminSettings />} />
                        </Route>
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
