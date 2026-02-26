import express from 'express';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticate, authorize('super_admin', 'support'), async (req, res) => {
    try {
        const { role, search, isActive } = req.query;
        const users = await User.findAll({ role, search, isActive });
        res.json({ users, count: users.length });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get user statistics (admin only)
router.get('/stats', authenticate, authorize('super_admin'), async (req, res) => {
    try {
        const stats = await User.countByRole();
        res.json({ stats });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ error: 'Failed to fetch user statistics' });
    }
});

// Get single user
router.get('/:id', authenticate, async (req, res) => {
    try {
        // Users can only view their own profile unless they're admin
        if (req.user.id !== req.params.id && !['super_admin', 'support'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user (admin only)
router.put('/:id', authenticate, authorize('super_admin'), async (req, res) => {
    try {
        const { full_name, phone, avatar_url, role, is_active } = req.body;
        
        const user = await User.update(req.params.id, {
            full_name,
            phone,
            avatar_url,
            role,
            is_active
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ user });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user (admin only)
router.delete('/:id', authenticate, authorize('super_admin'), async (req, res) => {
    try {
        // Prevent deleting yourself
        if (req.user.id === req.params.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const user = await User.delete(req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

export default router;
