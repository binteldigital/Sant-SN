import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Lock, ChevronRight } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [phone, setPhone] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, we would verify credentials. 
        // For now, we try to load the user from localStorage.
        const savedUser = localStorage.getItem('sunu_sante_user');
        if (savedUser) {
            login(JSON.parse(savedUser));
            navigate('/');
        } else {
            alert("Compte non trouvé. Veuillez vous inscrire.");
            navigate('/register');
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
                        type="tel"
                        placeholder="Numéro de téléphone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-soft-gray rounded-2xl outline-none focus:ring-2 focus:ring-dakar-emerald/20 transition-all font-medium"
                    />
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-dakar-emerald transition-colors" />
                </div>

                <div className="relative group">
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        className="w-full pl-12 pr-4 py-4 bg-soft-gray rounded-2xl outline-none focus:ring-2 focus:ring-dakar-emerald/20 transition-all font-medium"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-dakar-emerald transition-colors" />
                </div>

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
