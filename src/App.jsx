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

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/register" replace />;
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
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
