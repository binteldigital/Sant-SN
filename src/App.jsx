import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HospitalDetail from './pages/HospitalDetail';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <Router>
            <div className="flex flex-col min-height-screen">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/hospital/:id" element={<HospitalDetail />} />
                    <Route path="/booking/:hospitalId" element={<Booking />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
