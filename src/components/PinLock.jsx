import React, { useState, useEffect } from 'react';
import { Lock, X, Delete } from 'lucide-react';

const PinLock = ({ onUnlock, onSetPin, hasPin, healthRecordId }) => {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [step, setStep] = useState(hasPin ? 'verify' : 'create');
    const [error, setError] = useState('');

    const handleNumberClick = (num) => {
        if (error) setError('');
        
        if (step === 'verify' || step === 'create') {
            if (pin.length < 4) {
                setPin(prev => prev + num);
            }
        } else if (step === 'confirm') {
            if (confirmPin.length < 4) {
                setConfirmPin(prev => prev + num);
            }
        }
    };

    const handleDelete = () => {
        if (error) setError('');
        
        if (step === 'verify' || step === 'create') {
            setPin(prev => prev.slice(0, -1));
        } else if (step === 'confirm') {
            setConfirmPin(prev => prev.slice(0, -1));
        }
    };

    const handleVerify = async () => {
        if (pin.length !== 4) {
            setError('Veuillez entrer 4 chiffres');
            return;
        }

        // Vérifier le PIN
        const isValid = await onUnlock(pin);
        if (isValid) {
            // Marquer comme vérifié pour cette session avec timestamp
            sessionStorage.setItem(`pin_verified_${healthRecordId}`, JSON.stringify({
                verified: true,
                timestamp: Date.now()
            }));
        } else {
            setError('Code incorrect');
            setPin('');
        }
    };

    const handleCreatePin = () => {
        if (pin.length !== 4) {
            setError('Veuillez entrer 4 chiffres');
            return;
        }
        setStep('confirm');
        setError('');
    };

    const handleConfirmPin = async () => {
        if (confirmPin.length !== 4) {
            setError('Veuillez confirmer les 4 chiffres');
            return;
        }

        if (pin !== confirmPin) {
            setError('Les codes ne correspondent pas');
            setConfirmPin('');
            return;
        }

        // Sauvegarder le PIN
        const success = await onSetPin(pin);
        if (success) {
            sessionStorage.setItem(`pin_verified_${healthRecordId}`, JSON.stringify({
                verified: true,
                timestamp: Date.now()
            }));
        } else {
            setError('Erreur lors de la sauvegarde');
        }
    };

    // Déverrouiller automatiquement quand 4 chiffres sont entrés
    useEffect(() => {
        if (pin.length === 4 && step === 'verify') {
            handleVerify();
        }
    }, [pin, step]);

    useEffect(() => {
        if (confirmPin.length === 4 && step === 'confirm') {
            handleConfirmPin();
        }
    }, [confirmPin, step]);

    const getDisplayValue = () => {
        if (step === 'confirm') {
            return confirmPin;
        }
        return pin;
    };

    const getTitle = () => {
        switch (step) {
            case 'verify':
                return 'Carnet de Santé Sécurisé';
            case 'create':
                return 'Créer un code secret';
            case 'confirm':
                return 'Confirmer le code';
            default:
                return '';
        }
    };

    const getSubtitle = () => {
        switch (step) {
            case 'verify':
                return 'Entrez votre code à 4 chiffres';
            case 'create':
                return 'Choisissez un code à 4 chiffres pour sécuriser votre carnet';
            case 'confirm':
                return 'Répétez le code pour confirmation';
            default:
                return '';
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
            {/* Header */}
            <div className="flex-1 flex flex-col items-center justify-center px-8">
                <div className="w-20 h-20 bg-dakar-emerald/10 rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-10 h-10 text-dakar-emerald" />
                </div>

                <h2 className="text-xl font-bold text-deep-charcoal mb-2">
                    {getTitle()}
                </h2>
                <p className="text-sm text-gray-500 text-center mb-8">
                    {getSubtitle()}
                </p>

                {/* PIN Display */}
                <div className="flex gap-4 mb-8">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all ${
                                i < getDisplayValue().length
                                    ? 'bg-dakar-emerald text-white'
                                    : 'bg-gray-100 text-gray-300'
                            }`}
                        >
                            {i < getDisplayValue().length ? '•' : ''}
                        </div>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                )}

                {/* Action Button for create step */}
                {step === 'create' && pin.length === 4 && (
                    <button
                        onClick={handleCreatePin}
                        className="mb-6 px-8 py-3 bg-dakar-emerald text-white rounded-2xl font-bold"
                    >
                        Continuer
                    </button>
                )}
            </div>

            {/* Keypad */}
            <div className="px-8 pb-8">
                <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num.toString())}
                            className="h-16 rounded-2xl bg-gray-100 text-2xl font-bold text-deep-charcoal active:bg-dakar-emerald active:text-white transition-colors"
                        >
                            {num}
                        </button>
                    ))}
                    <div className="h-16" /> {/* Empty space */}
                    <button
                        onClick={() => handleNumberClick('0')}
                        className="h-16 rounded-2xl bg-gray-100 text-2xl font-bold text-deep-charcoal active:bg-dakar-emerald active:text-white transition-colors"
                    >
                        0
                    </button>
                    <button
                        onClick={handleDelete}
                        className="h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 active:bg-gray-200 transition-colors"
                    >
                        <Delete className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PinLock;
