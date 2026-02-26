import { query } from '../config/database.js';

export class Pharmacy {
    static async findAll(filters = {}) {
        let sql = 'SELECT * FROM pharmacies WHERE is_active = true';
        const params = [];
        let paramIndex = 1;

        if (filters.district) {
            sql += ` AND district = $${paramIndex}`;
            params.push(filters.district);
            paramIndex++;
        }

        if (filters.onDuty) {
            sql += ` AND on_duty_status = true`;
        }

        if (filters.search) {
            sql += ` AND (name ILIKE $${paramIndex} OR address ILIKE $${paramIndex} OR pharmacist ILIKE $${paramIndex})`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }

        sql += ' ORDER BY name ASC';

        const result = await query(sql, params);
        return result.rows;
    }

    static async findById(id) {
        const result = await query(
            'SELECT * FROM pharmacies WHERE id = $1 AND is_active = true',
            [id]
        );
        return result.rows[0] || null;
    }

    static async findNearby(lat, lng, radiusKm = 10) {
        const result = await query(
            `SELECT *, 
                (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * 
                cos(radians(longitude) - radians($2)) + sin(radians($1)) * 
                sin(radians(latitude)))) AS distance
            FROM pharmacies 
            WHERE is_active = true
            HAVING (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * 
                cos(radians(longitude) - radians($2)) + sin(radians($1)) * 
                sin(radians(latitude)))) <= $3
            ORDER BY distance`,
            [lat, lng, radiusKm]
        );
        return result.rows;
    }

    static async findOnDuty(district = null) {
        let sql = `
            SELECT p.*, ds.duty_date, ds.start_time, ds.end_time
            FROM pharmacies p
            LEFT JOIN duty_pharmacy_schedules ds ON p.id = ds.pharmacy_id 
                AND ds.duty_date = CURRENT_DATE
                AND ds.is_active = true
            WHERE p.on_duty_status = true 
            AND p.is_active = true
        `;
        const params = [];

        if (district) {
            sql += ' AND p.district = $1';
            params.push(district);
        }

        sql += ' ORDER BY p.district, p.name';

        const result = await query(sql, params);
        return result.rows;
    }

    static async create(data) {
        const result = await query(
            `INSERT INTO pharmacies (
                name, pharmacist, address, latitude, longitude,
                quartier, commune, district, department, phone, email, website
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *`,
            [
                data.name,
                data.pharmacist,
                data.address,
                data.latitude,
                data.longitude,
                data.quartier,
                data.commune,
                data.district,
                data.department,
                data.phone,
                data.email,
                data.website
            ]
        );
        return result.rows[0];
    }

    static async update(id, data) {
        const result = await query(
            `UPDATE pharmacies SET
                name = COALESCE($2, name),
                pharmacist = COALESCE($3, pharmacist),
                address = COALESCE($4, address),
                latitude = COALESCE($5, latitude),
                longitude = COALESCE($6, longitude),
                quartier = COALESCE($7, quartier),
                commune = COALESCE($8, commune),
                district = COALESCE($9, district),
                department = COALESCE($10, department),
                phone = COALESCE($11, phone),
                email = COALESCE($12, email),
                website = COALESCE($13, website),
                on_duty_status = COALESCE($14, on_duty_status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *`,
            [
                id,
                data.name,
                data.pharmacist,
                data.address,
                data.latitude,
                data.longitude,
                data.quartier,
                data.commune,
                data.district,
                data.department,
                data.phone,
                data.email,
                data.website,
                data.on_duty_status
            ]
        );
        return result.rows[0] || null;
    }

    static async delete(id) {
        const result = await query(
            'UPDATE pharmacies SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0] || null;
    }

    static async getDistricts() {
        const result = await query(
            'SELECT DISTINCT district FROM pharmacies WHERE is_active = true AND district IS NOT NULL ORDER BY district'
        );
        return result.rows.map(row => row.district);
    }

    static async updateDutyStatus(pharmacyId, isOnDuty) {
        const result = await query(
            'UPDATE pharmacies SET on_duty_status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [pharmacyId, isOnDuty]
        );
        return result.rows[0] || null;
    }
}

export default Pharmacy;
