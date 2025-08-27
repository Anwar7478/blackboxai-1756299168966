const db = require('../config/db');

class Product {
  static async getAll(limit = null, offset = 0) {
    try {
      let query = `
        SELECT p.*, c.name as category_name, b.name as brand_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN brands b ON p.brand_id = b.id 
        WHERE p.is_active = 1
        ORDER BY p.created_at DESC
      `;
      
      if (limit) {
        query += ` LIMIT ${limit} OFFSET ${offset}`;
      }
      
      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query(`
        SELECT p.*, c.name as category_name, b.name as brand_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN brands b ON p.brand_id = b.id 
        WHERE p.id = ? AND p.is_active = 1
      `, [id]);
      return rows[0];
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  }

  static async getFeatured(limit = 8) {
    try {
      const [rows] = await db.query(`
        SELECT p.*, c.name as category_name, b.name as brand_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN brands b ON p.brand_id = b.id 
        WHERE p.is_featured = 1 AND p.is_active = 1
        ORDER BY p.created_at DESC
        LIMIT ?
      `, [limit]);
      return rows;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }

  static async getNew(limit = 8) {
    try {
      const [rows] = await db.query(`
        SELECT p.*, c.name as category_name, b.name as brand_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN brands b ON p.brand_id = b.id 
        WHERE p.is_new = 1 AND p.is_active = 1
        ORDER BY p.created_at DESC
        LIMIT ?
      `, [limit]);
      return rows;
    } catch (error) {
      console.error('Error fetching new products:', error);
      throw error;
    }
  }

  static async getByCategory(categoryId, limit = null, offset = 0) {
    try {
      let query = `
        SELECT p.*, c.name as category_name, b.name as brand_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN brands b ON p.brand_id = b.id 
        WHERE p.category_id = ? AND p.is_active = 1
        ORDER BY p.created_at DESC
      `;
      
      if (limit) {
        query += ` LIMIT ${limit} OFFSET ${offset}`;
      }
      
      const [rows] = await db.query(query, [categoryId]);
      return rows;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  static async getByBrand(brandId, limit = null, offset = 0) {
    try {
      let query = `
        SELECT p.*, c.name as category_name, b.name as brand_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN brands b ON p.brand_id = b.id 
        WHERE p.brand_id = ? AND p.is_active = 1
        ORDER BY p.created_at DESC
      `;
      
      if (limit) {
        query += ` LIMIT ${limit} OFFSET ${offset}`;
      }
      
      const [rows] = await db.query(query, [brandId]);
      return rows;
    } catch (error) {
      console.error('Error fetching products by brand:', error);
      throw error;
    }
  }

  static async search(searchTerm, limit = null, offset = 0) {
    try {
      let query = `
        SELECT p.*, c.name as category_name, b.name as brand_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN brands b ON p.brand_id = b.id 
        WHERE (p.name LIKE ? OR p.description LIKE ?) AND p.is_active = 1
        ORDER BY p.created_at DESC
      `;
      
      if (limit) {
        query += ` LIMIT ${limit} OFFSET ${offset}`;
      }
      
      const searchPattern = `%${searchTerm}%`;
      const [rows] = await db.query(query, [searchPattern, searchPattern]);
      return rows;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
}

module.exports = Product;
