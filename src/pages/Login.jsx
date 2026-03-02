import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Lock, ChevronRight } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const result = await login(email, password);
            if (result.success) {
                // Redirect based on user role
                const { role } = result.user;
                console.log('User role:', role); // Debug log
                
                if (role === 'super_admin' || role === 'support') {
                    navigate('/admin');
                } else if (role === 'hospital_admin' || role === 'doctor') {
                    console.log('Redirecting to /hospital-admin'); // Debug log
                    navigate('/hospital-admin');
                } else {
                    navigate('/');
                }
            } else {
                setError(result.error || 'Échec de la connexion');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white px-6 pt-24">
            <header className="mb-12">
                <div className="w-16 h-16 bg-dakar-emerald rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6">S</div>
                <h1 className="text-3xl font-bold text-deep-charcoal mb-2">Bon retour !</h1>
                <p className="text-gray-500">Connectez-vous pour accéder à vos services de santé.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                    <input
                        required
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-soft-gray rounded-2xl outline-none focus:ring-2 focus:ring-dakar-emerald/20 transition-all font-medium"
                    />
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-dakar-emerald transition-colors" />
                </div>

                <div className="relative group">
                    <input
                        required
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-soft-gray rounded-2xl outline-none focus:ring-2 focus:ring-dakar-emerald/20 transition-all font-medium"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-dakar-emerald transition-colors" />
                </div>

                {error && (
                    <p className="text-red-500 text-sm text-center font-medium">{error}</p>
                )}

                <button
                    type="submit"
                    className="w-full h-16 bg-dakar-emerald text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-emerald-100 hover:scale-[1.02] active:scale-[0.98] transition-all mt-8"
                >
                    Se connecter
                    <ChevronRight className="w-5 h-5" />
                </button>
            </form>

            <div className="mt-auto pb-12 text-center text-sm text-gray-500">
                Vous n'avez pas de compte ?{' '}
                <Link to="/register" className="text-dakar-emerald font-bold hover:underline">
                    Inscrivez-vous
                </Link>
            </div>
        </div>
    );
};

export default Login;
