import express from 'express';
import { query } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', authenticate, authorize('super_admin', 'hospital_admin', 'support'), async (req, res) => {
    try {
        // Get counts
        const hospitalsCount = await query('SELECT COUNT(*) FROM hospitals WHERE is_active = true');
        const pharmaciesCount = await query('SELECT COUNT(*) FROM pharmacies WHERE is_active = true');
        const usersCount = await query('SELECT COUNT(*) FROM users WHERE is_active = true');
        const appointmentsCount = await query('SELECT COUNT(*) FROM appointments');
        
        // Get recent appointments
        const recentAppointments = await query(`
            SELECT a.*, u.full_name as patient_name, h.name as hospital_name
            FROM appointments a
            JOIN users u ON a.patient_id = u.id
            JOIN hospitals h ON a.hospital_id = h.id
            ORDER BY a.created_at DESC
            LIMIT 10
        `);

        // Get user distribution by role
        const userRoles = await query(`
            SELECT role, COUNT(*) as count 
            FROM users 
            WHERE is_active = true 
            GROUP BY role
        `);

        res.json({
            stats: {
                hospitals: parseInt(hospitalsCount.rows[0].count),
                pharmacies: parseInt(pharmaciesCount.rows[0].count),
                users: parseInt(usersCount.rows[0].count),
                appointments: parseInt(appointmentsCount.rows[0].count)
            },
            recentAppointments: recentAppointments.rows,
            userDistribution: userRoles.rows
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Get system settings
router.get('/settings', authenticate, authorize('super_admin'), async (req, res) => {
    try {
        const result = await query('SELECT * FROM system_settings');
        const settings = {};
        result.rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        res.json({ settings });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update system settings
router.put('/settings/:key', authenticate, authorize('super_admin'), async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        await query(
            `INSERT INTO system_settings (setting_key, setting_value, updated_by)
             VALUES ($1, $2, $3)
             ON CONFLICT (setting_key) 
             DO UPDATE SET setting_value = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP`,
            [key, JSON.stringify(value), req.user.id]
        );

        res.json({ message: 'Setting updated successfully' });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Get activity logs
router.get('/logs', authenticate, authorize('super_admin'), async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        
        const result = await query(`
            SELECT al.*, u.full_name, u.email
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        res.json({ logs: result.rows });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// Create activity log
router.post('/logs', authenticate, async (req, res) => {
    try {
        const { action, entity_type, entity_id, details } = req.body;

        await query(
            `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                req.user.id,
                action,
                entity_type,
                entity_id,
                details ? JSON.stringify(details) : null,
                req.ip,
                req.headers['user-agent']
            ]
        );

        res.status(201).json({ message: 'Log created' });
    } catch (error) {
        console.error('Create log error:', error);
        res.status(500).json({ error: 'Failed to create log' });
    }
});

export default router;
