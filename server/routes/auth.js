import express from 'express';
import User from '../models/User.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, full_name, phone, role = 'patient' } = req.body;

        // Validation
        if (!email || !password || !full_name) {
            return res.status(400).json({ 
                error: 'Email, password, and full name are required' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'Password must be at least 6 characters' 
            });
        }

        // Check if user exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ 
                error: 'User with this email already exists' 
            });
        }

        // Create user
        const user = await User.create({
            email,
            password,
            full_name,
            phone,
            role: ['patient', 'doctor'].includes(role) ? role : 'patient'
        });

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            message: 'User registered successfully',
            user,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email and password are required' 
            });
        }

        // Verify credentials
        const user = await User.verifyPassword(email, password);
        
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }

        // Generate token
        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            user,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
    try {
        res.json({ user: req.user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// Update profile
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { full_name, phone, avatar_url } = req.body;
        
        const updatedUser = await User.update(req.user.id, {
            full_name,
            phone,
            avatar_url
        });

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Change password
router.put('/password', authenticate, async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ 
                error: 'Current password and new password are required' 
            });
        }

        if (new_password.length < 6) {
            return res.status(400).json({ 
                error: 'New password must be at least 6 characters' 
            });
        }

        // Verify current password
        const user = await User.verifyPassword(req.user.email, current_password);
        if (!user) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Update password
        await User.updatePassword(req.user.id, new_password);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Logout (client-side token removal, but we can track if needed)
router.post('/logout', authenticate, async (req, res) => {
    // In a more advanced setup, you could add token to a blacklist
    res.json({ message: 'Logout successful' });
});

export default router;
