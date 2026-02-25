import { useState, useEffect, useCallback } from 'react';

export const useGeolocation = () => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("La géolocalisation n'est pas supportée par votre navigateur");
            return;
        }

        const handleSuccess = (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lng: longitude });
        };

        const handleError = (err) => {
            setError(err.message);
            // Fallback: try again without high accuracy
            navigator.geolocation.getCurrentPosition(
                handleSuccess,
                () => setError("Impossible d'obtenir votre position"),
                { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
            );
        };

        // First try with high accuracy
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000
        });

        // Also watch for position updates
        const watchId = navigator.geolocation.watchPosition(handleSuccess, () => { }, {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 30000
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }, []);

    return { location, error, calculateDistance };
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};
