import { query } from './config/database';

async function test() {
  try {
    const res = await query('SELECT * FROM users LIMIT 1');
    const user = res.rows[0];
    if (!user) {
      console.log('No user found');
      return;
    }
    console.log('User ID:', user.id);
    console.log('Shop ID:', user.shop_id);
    
    // Attempt to insert a customer config with a user ID (which is not a customer)
    console.log('Attempting insert with user ID as customer_id...');
    await query(
      `INSERT INTO customer_configs (shop_id, customer_id, services) 
       VALUES ($1, $2, $3)`,
      [user.shop_id, user.id, '{}']
    );
    console.log('Success (No FK constraint!)');
  } catch (err) {
    console.error('Error occurred:', err);
  } finally {
    process.exit(0);
  }
}

test();
