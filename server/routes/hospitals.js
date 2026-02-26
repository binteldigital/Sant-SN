import express from 'express';
import Hospital from '../models/Hospital.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all hospitals
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { type, district, search, lat, lng, radius } = req.query;
        
        let hospitals;
        
        // If location provided, find nearby hospitals
        if (lat && lng) {
            hospitals = await Hospital.findNearby(
                parseFloat(lat), 
                parseFloat(lng), 
                parseFloat(radius) || 10
            );
        } else {
            hospitals = await Hospital.findAll({ type, district, search });
        }
        
        res.json({ hospitals, count: hospitals.length });
    } catch (error) {
        console.error('Get hospitals error:', error);
        res.status(500).json({ error: 'Failed to fetch hospitals' });
    }
});

// Get hospital types
router.get('/types', async (req, res) => {
    try {
        const types = await Hospital.getTypes();
        res.json({ types });
    } catch (error) {
        console.error('Get types error:', error);
        res.status(500).json({ error: 'Failed to fetch types' });
    }
});

// Get hospital districts
router.get('/districts', async (req, res) => {
    try {
        const districts = await Hospital.getDistricts();
        res.json({ districts });
    } catch (error) {
        console.error('Get districts error:', error);
        res.status(500).json({ error: 'Failed to fetch districts' });
    }
});

// Get single hospital
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        
        if (!hospital) {
            return res.status(404).json({ error: 'Hospital not found' });
        }
        
        res.json({ hospital });
    } catch (error) {
        console.error('Get hospital error:', error);
        res.status(500).json({ error: 'Failed to fetch hospital' });
    }
});

// Create hospital (admin only)
router.post('/', authenticate, async (req, res) => {
    try {
        // Check if user has admin role
        if (!['super_admin', 'hospital_admin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const hospital = await Hospital.create(req.body);
        res.status(201).json({ hospital });
    } catch (error) {
        console.error('Create hospital error:', error);
        res.status(500).json({ error: 'Failed to create hospital' });
    }
});

// Update hospital (admin only)
router.put('/:id', authenticate, async (req, res) => {
    try {
        if (!['super_admin', 'hospital_admin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const hospital = await Hospital.update(req.params.id, req.body);
        
        if (!hospital) {
            return res.status(404).json({ error: 'Hospital not found' });
        }
        
        res.json({ hospital });
    } catch (error) {
        console.error('Update hospital error:', error);
        res.status(500).json({ error: 'Failed to update hospital' });
    }
});

// Delete hospital (admin only)
router.delete('/:id', authenticate, async (req, res) => {
    try {
        if (!['super_admin', 'hospital_admin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const hospital = await Hospital.delete(req.params.id);
        
        if (!hospital) {
            return res.status(404).json({ error: 'Hospital not found' });
        }
        
        res.json({ message: 'Hospital deleted successfully' });
    } catch (error) {
        console.error('Delete hospital error:', error);
        res.status(500).json({ error: 'Failed to delete hospital' });
    }
});

export default router;
