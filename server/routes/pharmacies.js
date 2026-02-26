import express from 'express';
import Pharmacy from '../models/Pharmacy.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all pharmacies
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { district, onDuty, search, lat, lng, radius } = req.query;
        
        let pharmacies;
        
        // If location provided, find nearby pharmacies
        if (lat && lng) {
            pharmacies = await Pharmacy.findNearby(
                parseFloat(lat), 
                parseFloat(lng), 
                parseFloat(radius) || 10
            );
        } else {
            pharmacies = await Pharmacy.findAll({ 
                district, 
                onDuty: onDuty === 'true',
                search 
            });
        }
        
        res.json({ pharmacies, count: pharmacies.length });
    } catch (error) {
        console.error('Get pharmacies error:', error);
        res.status(500).json({ error: 'Failed to fetch pharmacies' });
    }
});

// Get on-duty pharmacies
router.get('/duty', async (req, res) => {
    try {
        const { district } = req.query;
        const pharmacies = await Pharmacy.findOnDuty(district);
        res.json({ pharmacies, count: pharmacies.length });
    } catch (error) {
        console.error('Get duty pharmacies error:', error);
        res.status(500).json({ error: 'Failed to fetch duty pharmacies' });
    }
});

// Get pharmacy districts
router.get('/districts', async (req, res) => {
    try {
        const districts = await Pharmacy.getDistricts();
        res.json({ districts });
    } catch (error) {
        console.error('Get districts error:', error);
        res.status(500).json({ error: 'Failed to fetch districts' });
    }
});

// Get single pharmacy
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const pharmacy = await Pharmacy.findById(req.params.id);
        
        if (!pharmacy) {
            return res.status(404).json({ error: 'Pharmacy not found' });
        }
        
        res.json({ pharmacy });
    } catch (error) {
        console.error('Get pharmacy error:', error);
        res.status(500).json({ error: 'Failed to fetch pharmacy' });
    }
});

// Create pharmacy (admin only)
router.post('/', authenticate, async (req, res) => {
    try {
        if (!['super_admin', 'support'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const pharmacy = await Pharmacy.create(req.body);
        res.status(201).json({ pharmacy });
    } catch (error) {
        console.error('Create pharmacy error:', error);
        res.status(500).json({ error: 'Failed to create pharmacy' });
    }
});

// Update pharmacy (admin only)
router.put('/:id', authenticate, async (req, res) => {
    try {
        if (!['super_admin', 'support'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const pharmacy = await Pharmacy.update(req.params.id, req.body);
        
        if (!pharmacy) {
            return res.status(404).json({ error: 'Pharmacy not found' });
        }
        
        res.json({ pharmacy });
    } catch (error) {
        console.error('Update pharmacy error:', error);
        res.status(500).json({ error: 'Failed to update pharmacy' });
    }
});

// Update duty status (admin only)
router.put('/:id/duty', authenticate, async (req, res) => {
    try {
        if (!['super_admin', 'support'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { on_duty } = req.body;
        const pharmacy = await Pharmacy.updateDutyStatus(req.params.id, on_duty);
        
        if (!pharmacy) {
            return res.status(404).json({ error: 'Pharmacy not found' });
        }
        
        res.json({ pharmacy });
    } catch (error) {
        console.error('Update duty status error:', error);
        res.status(500).json({ error: 'Failed to update duty status' });
    }
});

// Delete pharmacy (admin only)
router.delete('/:id', authenticate, async (req, res) => {
    try {
        if (!['super_admin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const pharmacy = await Pharmacy.delete(req.params.id);
        
        if (!pharmacy) {
            return res.status(404).json({ error: 'Pharmacy not found' });
        }
        
        res.json({ message: 'Pharmacy deleted successfully' });
    } catch (error) {
        console.error('Delete pharmacy error:', error);
        res.status(500).json({ error: 'Failed to delete pharmacy' });
    }
});

export default router;
