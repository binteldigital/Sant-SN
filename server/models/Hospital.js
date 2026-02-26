import { query, withTransaction } from '../config/database.js';

export class Hospital {
    static async findAll(filters = {}) {
        let sql = 'SELECT * FROM hospitals WHERE is_active = true';
        const params = [];
        let paramIndex = 1;

        if (filters.type) {
            sql += ` AND type = $${paramIndex}`;
            params.push(filters.type);
            paramIndex++;
        }

        if (filters.district) {
            sql += ` AND district = $${paramIndex}`;
            params.push(filters.district);
            paramIndex++;
        }

        if (filters.search) {
            sql += ` AND (name ILIKE $${paramIndex} OR address ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }

        sql += ' ORDER BY name ASC';

        const result = await query(sql, params);
        return result.rows;
    }

    static async findById(id) {
        const result = await query(
            'SELECT * FROM hospitals WHERE id = $1 AND is_active = true',
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
            FROM hospitals 
            WHERE is_active = true
            HAVING (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * 
                cos(radians(longitude) - radians($2)) + sin(radians($1)) * 
                sin(radians(latitude)))) <= $3
            ORDER BY distance`,
            [lat, lng, radiusKm]
        );
        return result.rows;
    }

    static async create(data) {
        const result = await query(
            `INSERT INTO hospitals (
                name, type, category, address, latitude, longitude,
                location, district, department, phone, email, website,
                description, services, image_urls
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *`,
            [
                data.name,
                data.type,
                data.category,
                data.address,
                data.latitude,
                data.longitude,
                data.location,
                data.district,
                data.department,
                data.phone,
                data.email,
                data.website,
                data.description,
                JSON.stringify(data.services || []),
                JSON.stringify(data.image_urls || [])
            ]
        );
        return result.rows[0];
    }

    static async update(id, data) {
        const result = await query(
            `UPDATE hospitals SET
                name = COALESCE($2, name),
                type = COALESCE($3, type),
                category = COALESCE($4, category),
                address = COALESCE($5, address),
                latitude = COALESCE($6, latitude),
                longitude = COALESCE($7, longitude),
                location = COALESCE($8, location),
                district = COALESCE($9, district),
                department = COALESCE($10, department),
                phone = COALESCE($11, phone),
                email = COALESCE($12, email),
                website = COALESCE($13, website),
                description = COALESCE($14, description),
                services = COALESCE($15, services),
                image_urls = COALESCE($16, image_urls),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *`,
            [
                id,
                data.name,
                data.type,
                data.category,
                data.address,
                data.latitude,
                data.longitude,
                data.location,
                data.district,
                data.department,
                data.phone,
                data.email,
                data.website,
                data.description,
                data.services ? JSON.stringify(data.services) : null,
                data.image_urls ? JSON.stringify(data.image_urls) : null
            ]
        );
        return result.rows[0] || null;
    }

    static async delete(id) {
        // Soft delete
        const result = await query(
            'UPDATE hospitals SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0] || null;
    }

    static async getTypes() {
        const result = await query(
            'SELECT DISTINCT type FROM hospitals WHERE is_active = true ORDER BY type'
        );
        return result.rows.map(row => row.type);
    }

    static async getDistricts() {
        const result = await query(
            'SELECT DISTINCT district FROM hospitals WHERE is_active = true AND district IS NOT NULL ORDER BY district'
        );
        return result.rows.map(row => row.district);
    }
}

export default Hospital;
