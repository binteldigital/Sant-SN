import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

export class User {
    static async findAll(filters = {}) {
        let sql = 'SELECT id, email, role, full_name, phone, avatar_url, is_active, email_verified, created_at FROM users WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (filters.role) {
            sql += ` AND role = $${paramIndex}`;
            params.push(filters.role);
            paramIndex++;
        }

        if (filters.isActive !== undefined) {
            sql += ` AND is_active = $${paramIndex}`;
            params.push(filters.isActive);
            paramIndex++;
        }

        if (filters.search) {
            sql += ` AND (email ILIKE $${paramIndex} OR full_name ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }

        sql += ' ORDER BY created_at DESC';

        const result = await query(sql, params);
        return result.rows;
    }

    static async findById(id) {
        const result = await query(
            'SELECT id, email, role, full_name, phone, avatar_url, is_active, email_verified, phone_verified, last_login_at, created_at FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    static async findByEmail(email) {
        const result = await query(
            'SELECT * FROM users WHERE email = $1',
            [email.toLowerCase()]
        );
        return result.rows[0] || null;
    }

    static async create(data) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        
        const result = await query(
            `INSERT INTO users (email, password_hash, role, full_name, phone, avatar_url)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, email, role, full_name, phone, avatar_url, is_active, created_at`,
            [
                data.email.toLowerCase(),
                hashedPassword,
                data.role || 'patient',
                data.full_name,
                data.phone,
                data.avatar_url
            ]
        );
        return result.rows[0];
    }

    static async update(id, data) {
        const updates = [];
        const params = [id];
        let paramIndex = 2;

        if (data.full_name !== undefined) {
            updates.push(`full_name = $${paramIndex}`);
            params.push(data.full_name);
            paramIndex++;
        }

        if (data.phone !== undefined) {
            updates.push(`phone = $${paramIndex}`);
            params.push(data.phone);
            paramIndex++;
        }

        if (data.avatar_url !== undefined) {
            updates.push(`avatar_url = $${paramIndex}`);
            params.push(data.avatar_url);
            paramIndex++;
        }

        if (data.role !== undefined) {
            updates.push(`role = $${paramIndex}`);
            params.push(data.role);
            paramIndex++;
        }

        if (data.is_active !== undefined) {
            updates.push(`is_active = $${paramIndex}`);
            params.push(data.is_active);
            paramIndex++;
        }

        if (updates.length === 0) {
            return await this.findById(id);
        }

        const result = await query(
            `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, email, role, full_name, phone, avatar_url, is_active, updated_at`,
            params
        );
        return result.rows[0] || null;
    }

    static async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await query(
            'UPDATE users SET password_hash = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
            [id, hashedPassword]
        );
        return result.rows[0] || null;
    }

    static async verifyPassword(email, password) {
        const user = await query(
            'SELECT * FROM users WHERE email = $1 AND is_active = true',
            [email.toLowerCase()]
        );

        if (!user.rows[0]) {
            return null;
        }

        const isValid = await bcrypt.compare(password, user.rows[0].password_hash);
        
        if (isValid) {
            // Update last login
            await query(
                'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
                [user.rows[0].id]
            );
            
            const { password_hash, ...userWithoutPassword } = user.rows[0];
            return userWithoutPassword;
        }

        return null;
    }

    static async delete(id) {
        // Soft delete
        const result = await query(
            'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0] || null;
    }

    static async verifyEmail(id) {
        const result = await query(
            'UPDATE users SET email_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0] || null;
    }

    static async verifyPhone(id) {
        const result = await query(
            'UPDATE users SET phone_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0] || null;
    }

    static async countByRole() {
        const result = await query(
            'SELECT role, COUNT(*) as count FROM users WHERE is_active = true GROUP BY role'
        );
        return result.rows;
    }
}

export default User;
