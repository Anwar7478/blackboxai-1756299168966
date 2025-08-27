const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    try {
      const { name, email, password, phone } = userData;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await db.query(`
        INSERT INTO users (name, email, password, phone, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `, [name, email, hashedPassword, phone]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query(`
        SELECT id, name, email, phone, role, created_at, updated_at
        FROM users 
        WHERE id = ? AND is_active = 1
      `, [id]);
      return rows[0];
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  static async getByEmail(email) {
    try {
      const [rows] = await db.query(`
        SELECT * FROM users 
        WHERE email = ? AND is_active = 1
      `, [email]);
      return rows[0];
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  static async validatePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error validating password:', error);
      throw error;
    }
  }

  static async updateProfile(id, userData) {
    try {
      const { name, phone } = userData;
      const [result] = await db.query(`
        UPDATE users 
        SET name = ?, phone = ?, updated_at = NOW()
        WHERE id = ?
      `, [name, phone, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  static async changePassword(id, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const [result] = await db.query(`
        UPDATE users 
        SET password = ?, updated_at = NOW()
        WHERE id = ?
      `, [hashedPassword, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}

module.exports = User;
