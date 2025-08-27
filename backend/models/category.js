const db = require('../config/db');

class Category {
  static async getAll() {
    try {
      const [rows] = await db.query(`
        SELECT * FROM categories 
        WHERE is_active = 1 
        ORDER BY name ASC
      `);
      return rows;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query(`
        SELECT * FROM categories 
        WHERE id = ? AND is_active = 1
      `, [id]);
      return rows[0];
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      throw error;
    }
  }

  static async getBySlug(slug) {
    try {
      const [rows] = await db.query(`
        SELECT * FROM categories 
        WHERE slug = ? AND is_active = 1
      `, [slug]);
      return rows[0];
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      throw error;
    }
  }

  static async getTopCategories(limit = 8) {
    try {
      const [rows] = await db.query(`
        SELECT c.*, COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
        WHERE c.is_active = 1
        GROUP BY c.id
        ORDER BY product_count DESC, c.name ASC
        LIMIT ?
      `, [limit]);
      return rows;
    } catch (error) {
      console.error('Error fetching top categories:', error);
      throw error;
    }
  }

  static async getWithProductCount() {
    try {
      const [rows] = await db.query(`
        SELECT c.*, COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
        WHERE c.is_active = 1
        GROUP BY c.id
        ORDER BY c.name ASC
      `);
      return rows;
    } catch (error) {
      console.error('Error fetching categories with product count:', error);
      throw error;
    }
  }
}

module.exports = Category;
