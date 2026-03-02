import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, QrCode, Loader2, User, Calendar, MapPin, Phone, Droplets, Activity, Syringe, FileText, Keyboard } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const QRScanner = ({ onClose, onScanSuccess }) => {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState(null);
    const [scannedData, setScannedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [manualToken, setManualToken] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);
    const scannerRef = useRef(null);
    const scannerInstanceRef = useRef(null);

    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, []);

    const startScanner = async () => {
        try {
            setScanning(true);
            setError(null);

            const scanner = new Html5Qrcode('qr-reader');
            scannerInstanceRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                onScanSuccessHandler,
                onScanErrorHandler
            );
        } catch (err) {
            console.error('Scanner error:', err);
            setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
            setScanning(false);
        }
    };

    const stopScanner = async () => {
        if (scannerInstanceRef.current) {
            try {
                await scannerInstanceRef.current.stop();
            } catch (err) {
                console.error('Stop scanner error:', err);
            }
            scannerInstanceRef.current = null;
        }
        setScanning(false);
    };

    const onScanSuccessHandler = async (decodedText) => {
        if (loading) return;
        
        try {
            setLoading(true);
            await stopScanner();
            
            // Rechercher le carnet de santé par le token QR
            const { data: healthRecord, error: recordError } = await supabase
                .from('health_records')
                .select(`
                    *,
                    vaccinations(*),
                    users:user_id(full_name, email)
                `)
                .eq('qr_code_token', decodedText)
                .single();

            if (recordError || !healthRecord) {
                setError('QR code invalide ou carnet non trouvé');
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
            console.error('Scan processing error:', err);
            setError('Erreur lors du traitement du QR code');
        } finally {
            setLoading(false);
        }
    };

    const onScanErrorHandler = (err) => {
        // Ignorer les erreurs de scan normales
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
                    {!scannedData && !scanning && (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <QrCode className="w-12 h-12 text-dakar-emerald" />
                            </div>
                            <h3 className="text-lg font-bold text-deep-charcoal mb-2">Prêt à scanner</h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                Cliquez sur le bouton ci-dessous pour activer la caméra et scanner le QR code du patient.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={startScanner}
                                    className="px-8 py-4 bg-dakar-emerald text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:shadow-xl transition-all active:scale-95"
                                >
                                    Démarrer le scan
                                </button>
                                <button
                                    onClick={() => setShowManualInput(true)}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                                >
                                    <Keyboard className="w-5 h-5" />
                                    Saisir le code manuellement
                                </button>
                            </div>
                        </div>
                    )}

                    {scanning && (
                        <div className="text-center">
                            <div id="qr-reader" className="mx-auto max-w-sm rounded-2xl overflow-hidden"></div>
                            <p className="text-sm text-gray-500 mt-4">Placez le QR code dans le cadre</p>
                            <button
                                onClick={stopScanner}
                                className="mt-4 px-6 py-2 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                Annuler
                            </button>
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-12">
                            <Loader2 className="w-12 h-12 animate-spin text-dakar-emerald mx-auto mb-4" />
                            <p className="text-gray-600">Recherche du dossier patient...</p>
                        </div>
                    )}

                    {error && !showManualInput && (
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
                                    Réessayer avec la caméra
                                </button>
                                <button
                                    onClick={() => { setError(null); setShowManualInput(true); }}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2"
                                >
                                    <Keyboard className="w-5 h-5" />
                                    Saisir le code manuellement
                                </button>
                            </div>
                        </div>
                    )}

                    {showManualInput && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Keyboard className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-bold text-deep-charcoal mb-2">Saisie manuelle</h3>
                            <p className="text-gray-500 mb-4 text-sm">
                                Entrez le code ID affiché sous le QR code du patient
                            </p>
                            <div className="max-w-sm mx-auto space-y-3">
                                <input
                                    type="text"
                                    value={manualToken}
                                    onChange={(e) => setManualToken(e.target.value)}
                                    placeholder="Ex: A1B2C3D4E5F6..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center font-mono text-lg uppercase focus:ring-2 focus:ring-dakar-emerald focus:border-transparent"
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setShowManualInput(false); setManualToken(''); }}
                                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={() => onScanSuccessHandler(manualToken.trim())}
                                        disabled={!manualToken.trim() || loading}
                                        className="flex-1 px-4 py-3 bg-dakar-emerald text-white rounded-xl font-bold disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Rechercher'}
                                    </button>
                                </div>
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
