import React, { useState, useEffect } from 'react';
import { Save, Palette, Bell, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        branding: {
            primary_color: '#10b981',
            secondary_color: '#059669',
            app_name: 'FAJU',
            tagline: 'Santé à votre portée',
        },
        features: {
            enable_booking: true,
            enable_sms: false,
            enable_email: false,
            enable_duty_pharmacy: true,
            maintenance_mode: false,
        },
        emergency_contacts: {
            samu: '1515',
            police: '17',
            fire: '18',
            emergency: '112',
        }
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load settings from Supabase on mount
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('system_settings')
                .select('*');
            
            if (error) throw error;
            
            // Convert array of settings to object
            if (data && data.length > 0) {
                const settingsMap = {};
                data.forEach(setting => {
                    const keys = setting.key.split('.');
                    if (keys.length === 2) {
                        const [section, key] = keys;
                        if (!settingsMap[section]) settingsMap[section] = {};
                        settingsMap[section][key] = setting.value;
                    }
                });
                
                setSettings(prev => ({
                    branding: { ...prev.branding, ...settingsMap.branding },
                    features: { ...prev.features, ...settingsMap.features },
                    emergency_contacts: { ...prev.emergency_contacts, ...settingsMap.emergency_contacts },
                }));
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (section) => {
        setSaving(true);
        try {
            const sectionData = settings[section];
            const settingsToUpsert = Object.entries(sectionData).map(([key, value]) => ({
                key: `${section}.${key}`,
                value: value,
                updated_at: new Date().toISOString()
            }));

            // Upsert settings (insert or update)
            const { error } = await supabase
                .from('system_settings')
                .upsert(settingsToUpsert, { onConflict: 'key' });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Paramètres sauvegardés avec succès' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            console.error('Error saving settings:', err);
            setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (section, key, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Paramètres système</h1>
                <p className="text-gray-500 mt-1">Configurez votre application FAJU</p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Branding Settings */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Palette className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Identité visuelle</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'application</label>
                        <input
                            type="text"
                            value={settings.branding.app_name}
                            onChange={(e) => updateSetting('branding', 'app_name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slogan</label>
                        <input
                            type="text"
                            value={settings.branding.tagline}
                            onChange={(e) => updateSetting('branding', 'tagline', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Couleur principale</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={settings.branding.primary_color}
                                onChange={(e) => updateSetting('branding', 'primary_color', e.target.value)}
                                className="h-10 w-20 rounded-lg border border-gray-200"
                            />
                            <input
                                type="text"
                                value={settings.branding.primary_color}
                                onChange={(e) => updateSetting('branding', 'primary_color', e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => handleSave('branding')}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                </div>
            </div>

            {/* Features Settings */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Bell className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Fonctionnalités</h2>
                </div>

                <div className="space-y-4">
                    {[
                        { key: 'enable_booking', label: 'Réservations de rendez-vous', desc: 'Permettre aux patients de réserver des RDV' },
                        { key: 'enable_sms', label: 'Notifications SMS', desc: 'Envoyer des SMS de rappel' },
                        { key: 'enable_email', label: 'Notifications Email', desc: 'Envoyer des emails de confirmation' },
                        { key: 'enable_duty_pharmacy', label: 'Pharmacies de garde', desc: 'Afficher les pharmacies de garde' },
                        { key: 'maintenance_mode', label: 'Mode maintenance', desc: 'Mettre le site en maintenance' },
                    ].map((feature) => (
                        <div key={feature.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="font-medium text-gray-900">{feature.label}</p>
                                <p className="text-sm text-gray-500">{feature.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.features[feature.key]}
                                    onChange={(e) => updateSetting('features', feature.key, e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => handleSave('features')}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-5 h-5 text-red-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Numéros d'urgence</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { key: 'samu', label: 'SAMU' },
                        { key: 'police', label: 'Police' },
                        { key: 'fire', label: 'Pompiers' },
                        { key: 'emergency', label: 'Urgence' },
                    ].map((contact) => (
                        <div key={contact.key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{contact.label}</label>
                            <input
                                type="text"
                                value={settings.emergency_contacts[contact.key]}
                                onChange={(e) => updateSetting('emergency_contacts', contact.key, e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => handleSave('emergency_contacts')}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
