const db = require('../config/db');

class Order {
  static async create(orderData) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { userId, items, totalAmount, shippingAddress, paymentMethod } = orderData;
      
      // Create order
      const [orderResult] = await connection.query(`
        INSERT INTO orders (user_id, total_amount, status, payment_status, payment_method, 
                           shipping_name, shipping_phone, shipping_address, shipping_city, 
                           shipping_state, shipping_zip, shipping_country, created_at, updated_at)
        VALUES (?, ?, 'pending', 'pending', ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        userId, totalAmount, paymentMethod,
        shippingAddress.name, shippingAddress.phone, shippingAddress.address,
        shippingAddress.city, shippingAddress.state, shippingAddress.zip,
        shippingAddress.country
      ]);
      
      const orderId = orderResult.insertId;
      
      // Create order items
      for (const item of items) {
        await connection.query(`
          INSERT INTO order_items (order_id, product_id, quantity, price, created_at)
          VALUES (?, ?, ?, ?, NOW())
        `, [orderId, item.productId, item.quantity, item.price]);
      }
      
      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      console.error('Error creating order:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getById(id) {
    try {
      const [orderRows] = await db.query(`
        SELECT * FROM orders WHERE id = ?
      `, [id]);
      
      if (orderRows.length === 0) {
        return null;
      }
      
      const order = orderRows[0];
      
      // Get order items
      const [itemRows] = await db.query(`
        SELECT oi.*, p.name as product_name, p.image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [id]);
      
      order.items = itemRows;
      return order;
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      throw error;
    }
  }

  static async getByUserId(userId, limit = null, offset = 0) {
    try {
      let query = `
        SELECT o.*, COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
      
      if (limit) {
        query += ` LIMIT ${limit} OFFSET ${offset}`;
      }
      
      const [rows] = await db.query(query, [userId]);
      return rows;
    } catch (error) {
      console.error('Error fetching orders by user ID:', error);
      throw error;
    }
  }

  static async updateStatus(id, status) {
    try {
      const [result] = await db.query(`
        UPDATE orders 
        SET status = ?, updated_at = NOW()
        WHERE id = ?
      `, [status, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  static async updatePaymentStatus(id, paymentStatus) {
    try {
      const [result] = await db.query(`
        UPDATE orders 
        SET payment_status = ?, updated_at = NOW()
        WHERE id = ?
      `, [paymentStatus, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  static async getAll(limit = null, offset = 0) {
    try {
      let query = `
        SELECT o.*, u.name as user_name, u.email as user_email, COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
      
      if (limit) {
        query += ` LIMIT ${limit} OFFSET ${offset}`;
      }
      
      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  }
}

module.exports = Order;
