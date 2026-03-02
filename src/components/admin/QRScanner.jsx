import React, { useState, useEffect, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { X, QrCode, Loader2, User, Calendar, MapPin, Phone, Droplets, Activity, Syringe, FileText, Camera, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const QRScanner = ({ onClose, onScanSuccess }) => {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState(null);
    const [scannedData, setScannedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [manualCode, setManualCode] = useState('');
    const [activeTab, setActiveTab] = useState('manual'); // 'manual' ou 'scan'
    const videoRef = useRef(null);
    const codeReaderRef = useRef(null);
    const controlsRef = useRef(null);

    useEffect(() => {
        // Liste les caméras disponibles au chargement
        listCameras();
        
        return () => {
            stopScanner();
        };
    }, []);

    const listCameras = async () => {
        try {
            const devices = await BrowserQRCodeReader.listVideoInputDevices();
            console.log('📷 Caméras disponibles:', devices);
            setCameras(devices);
            
            // Sélectionner la caméra arrière par défaut (mobile) ou la première dispo
            const backCamera = devices.find(d => 
                d.label.toLowerCase().includes('back') || 
                d.label.toLowerCase().includes('arrière') ||
                d.label.toLowerCase().includes('environment')
            );
            setSelectedCamera(backCamera?.deviceId || devices[0]?.deviceId);
        } catch (err) {
            console.error('❌ Erreur liste caméras:', err);
        }
    };

    const startScanner = async () => {
        try {
            setScanning(true);
            setError(null);

            if (!selectedCamera) {
                setError('Aucune caméra disponible');
                setScanning(false);
                return;
            }

            const codeReader = new BrowserQRCodeReader();
            codeReaderRef.current = codeReader;

            console.log('🎥 Démarrage scan avec caméra:', selectedCamera);

            const controls = await codeReader.decodeFromVideoDevice(
                selectedCamera,
                videoRef.current,
                (result, err) => {
                    if (result) {
                        console.log('✅ QR Code détecté:', result.getText());
                        handleScanSuccess(result.getText());
                    }
                    if (err && err.name !== 'NotFoundException') {
                        console.error('❌ Erreur scan:', err);
                    }
                }
            );

            controlsRef.current = controls;

        } catch (err) {
            console.error('❌ Erreur démarrage scanner:', err);
            setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
            setScanning(false);
        }
    };

    const stopScanner = () => {
        if (controlsRef.current) {
            controlsRef.current.stop();
            controlsRef.current = null;
        }
        setScanning(false);
    };

    const handleScanSuccess = async (decodedText) => {
        if (loading) return;
        
        stopScanner();
        
        try {
            setLoading(true);
            
            // Nettoyer le texte scanné
            const token = decodedText.trim().toUpperCase();
            console.log('🔍 Token scanné:', token);
            
            // Chercher par short_id (6 caractères) ou par qr_code_token
            let healthRecord = null;
            let recordError = null;
            
            if (token.length === 6) {
                // Recherche par short_id
                console.log('🔍 Recherche par short_id...');
                const result = await supabase
                    .from('health_records')
                    .select(`
                        *,
                        vaccinations(*),
                        users:user_id(full_name, email)
                    `)
                    .eq('short_id', token)
                    .single();
                healthRecord = result.data;
                recordError = result.error;
            } else {
                // Recherche par qr_code_token
                console.log('🔍 Recherche par qr_code_token...');
                const result = await supabase
                    .from('health_records')
                    .select(`
                        *,
                        vaccinations(*),
                        users:user_id(full_name, email)
                    `)
                    .eq('qr_code_token', token)
                    .single();
                healthRecord = result.data;
                recordError = result.error;
            }

            if (recordError) {
                console.error('❌ Erreur recherche:', recordError);
                setError('Code invalide ou carnet non trouvé');
                setLoading(false);
                return;
            }
            
            if (!healthRecord) {
                setError('Aucun carnet trouvé pour ce code');
                setLoading(false);
                return;
            }

            // Enregistrer le scan dans l'historique
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('qr_scan_history').insert({
                    health_record_id: healthRecord.id,
                    scanned_by: user.id,
                    scan_context: 'hospital_admin'
                });
            }

            setScannedData(healthRecord);
            if (onScanSuccess) onScanSuccess(healthRecord);
        } catch (err) {
            console.error('❌ Scan processing error:', err);
            setError('Erreur lors du traitement du code');
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = async () => {
        if (manualCode.length !== 6) {
            setError('Le code doit contenir exactement 6 caractères');
            return;
        }
        await handleScanSuccess(manualCode);
    };

    const formatDate = (date) => {
        if (!date) return 'Non renseigné';
        return new Date(date).toLocaleDateString('fr-FR');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-dakar-emerald rounded-xl flex items-center justify-center">
                            <QrCode className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-deep-charcoal">Scanner QR Patient</h2>
                            <p className="text-sm text-gray-500">Scannez le carnet de santé du patient</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Onglets */}
                    {!scannedData && (
                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => setActiveTab('manual')}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                                    activeTab === 'manual' 
                                        ? 'bg-dakar-emerald text-white' 
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                Code Manuel
                            </button>
                            <button
                                onClick={() => setActiveTab('scan')}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                                    activeTab === 'scan' 
                                        ? 'bg-dakar-emerald text-white' 
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                Scan QR
                            </button>
                        </div>
                    )}

                    {/* Saisie manuelle */}
                    {!scannedData && activeTab === 'manual' && !loading && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-black text-dakar-emerald">ABC</span>
                            </div>
                            <h3 className="text-lg font-bold text-deep-charcoal mb-2">Saisir le code patient</h3>
                            <p className="text-gray-500 mb-6 text-sm">
                                Demandez au patient son code à 6 caractères affiché sur son carnet
                            </p>
                            
                            <div className="max-w-xs mx-auto">
                                <input
                                    type="text"
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                    placeholder="Ex: A1B2C3"
                                    maxLength={6}
                                    className="w-full px-6 py-4 text-center text-2xl font-black tracking-widest border-2 border-gray-200 rounded-2xl uppercase focus:border-dakar-emerald focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                    {manualCode.length}/6 caractères
                                </p>
                                
                                <button
                                    onClick={handleManualSubmit}
                                    disabled={manualCode.length !== 6 || loading}
                                    className="w-full mt-4 py-4 bg-dakar-emerald text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                                >
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Rechercher'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Scan QR */}
                    {!scannedData && activeTab === 'scan' && !scanning && !loading && (
                        <div className="text-center py-8">
                            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Camera className="w-12 h-12 text-dakar-emerald" />
                            </div>
                            <h3 className="text-lg font-bold text-deep-charcoal mb-2">Scanner le QR code</h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                Positionnez le QR code du patient devant la caméra.
                            </p>
                            
                            {/* Sélection de caméra si plusieurs disponibles */}
                            {cameras.length > 1 && (
                                <div className="mb-4">
                                    <label className="text-sm text-gray-600 mb-2 block">Caméra:</label>
                                    <select
                                        value={selectedCamera || ''}
                                        onChange={(e) => setSelectedCamera(e.target.value)}
                                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm"
                                    >
                                        {cameras.map((cam) => (
                                            <option key={cam.deviceId} value={cam.deviceId}>
                                                {cam.label || `Caméra ${cam.deviceId.slice(0, 8)}...`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
                            <button
                                onClick={startScanner}
                                className="px-8 py-4 bg-dakar-emerald text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:shadow-xl transition-all active:scale-95"
                            >
                                Démarrer le scan
                            </button>
                        </div>
                    )}

                    {scanning && (
                        <div className="text-center">
                            <div className="relative mx-auto max-w-sm rounded-2xl overflow-hidden bg-black">
                                <video 
                                    ref={videoRef} 
                                    className="w-full h-auto"
                                    style={{ minHeight: '300px' }}
                                />
                                <div className="absolute inset-0 border-2 border-dakar-emerald/50 rounded-2xl pointer-events-none">
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-dakar-emerald rounded-lg"></div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-4">Placez le QR code dans le cadre vert</p>
                            <div className="flex justify-center gap-3 mt-4">
                                <button
                                    onClick={stopScanner}
                                    className="px-6 py-2 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={listCameras}
                                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Changer caméra
                                </button>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-12">
                            <Loader2 className="w-12 h-12 animate-spin text-dakar-emerald mx-auto mb-4" />
                            <p className="text-gray-600">Recherche du dossier patient...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X className="w-8 h-8 text-red-500" />
                            </div>
                            <p className="text-red-600 font-medium mb-4">{error}</p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => { setError(null); startScanner(); }}
                                    className="px-6 py-3 bg-dakar-emerald text-white rounded-xl font-bold"
                                >
                                    Réessayer
                                </button>
                                <button
                                    onClick={() => { setError(null); listCameras(); }}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold"
                                >
                                    Rafraîchir les caméras
                                </button>
                            </div>
                        </div>
                    )}

                    {scannedData && (
                        <div className="space-y-6">
                            {/* Patient Header */}
                            <div className="bg-gradient-to-br from-dakar-emerald to-emerald-600 rounded-2xl p-6 text-white">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <User className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">{scannedData.last_name} {scannedData.first_name}</h3>
                                        <p className="text-emerald-100">Né(e) le {formatDate(scannedData.birth_date)}</p>
                                        <p className="text-emerald-100 text-sm">{scannedData.users?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Identity */}
                            <section>
                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Identité
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <InfoCard icon={MapPin} label="Lieu de naissance" value={scannedData.birth_place} />
                                    <InfoCard icon={User} label="Sexe" value={scannedData.sex} />
                                    <InfoCard icon={Phone} label="Téléphone" value={scannedData.phone} />
                                    <InfoCard icon={MapPin} label="Adresse" value={scannedData.address} />
                                </div>
                            </section>

                            {/* Medical History */}
                            <section>
                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Antécédents Médicaux
                                </h4>
                                <div className="space-y-3">
                                    <InfoCard icon={FileText} label="Antécédents personnels" value={scannedData.personal_history} />
                                    <InfoCard icon={FileText} label="Antécédents familiaux" value={scannedData.family_history} />
                                    <InfoCard icon={Activity} label="Allergies" value={scannedData.allergies} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <InfoCard icon={Droplets} label="Groupe sanguin" value={scannedData.blood_group} color="text-red-500" />
                                        <InfoCard icon={Activity} label="Maladies chroniques" value={scannedData.chronic_diseases} />
                                    </div>
                                </div>
                            </section>

                            {/* Vaccinations */}
                            <section>
                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Syringe className="w-4 h-4" /> Vaccinations
                                </h4>
                                {scannedData.vaccinations?.length === 0 ? (
                                    <p className="text-gray-400 text-sm">Aucune vaccination enregistrée</p>
                                ) : (
                                    <div className="space-y-2">
                                        {scannedData.vaccinations?.map((vacc) => (
                                            <div key={vacc.id} className="bg-gray-50 rounded-xl p-3">
                                                <p className="font-bold text-deep-charcoal">{vacc.vaccine_name}</p>
                                                <p className="text-sm text-gray-500">{vacc.dose} • {formatDate(vacc.administration_date)}</p>
                                                <p className="text-xs text-gray-400">{vacc.health_center}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => { setScannedData(null); startScanner(); }}
                                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Scanner un autre
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-dakar-emerald text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoCard = ({ icon: Icon, label, value, color = "text-dakar-emerald" }) => (
    <div className="bg-gray-50 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="text-xs text-gray-400 uppercase">{label}</span>
        </div>
        <p className="font-bold text-deep-charcoal text-sm">{value || "Non renseigné"}</p>
    </div>
);

export default QRScanner;
