const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function testSuperadminAccess() {
  try {
    await client.connect();
    console.log('Connected to database.');

    // Get superadmin user to login
    const superadmin = await client.query('SELECT email FROM auth.users WHERE email = $1', ['superadmin@example.com']);
    if (superadmin.rows.length === 0) {
      console.log('Superadmin user not found');
      return;
    }

    // Login to get JWT token using native fetch
    console.log('Attempting to login as superadmin...');
    const loginResponse = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'superadmin@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.log('Login failed:', loginResponse.status, await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('Login successful, got token');

    // Test the endpoints that were failing
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('\nTesting /api/telekom-data endpoint...');
    try {
      const telekomResponse = await fetch('http://localhost:4000/api/telekom-data?page=1&pageSize=10&date_from=2025-01-01&date_to=2025-12-31', {
        headers
      });
      
      if (telekomResponse.ok) {
        const telekomData = await telekomResponse.json();
        console.log('✓ /api/telekom-data: SUCCESS - Status', telekomResponse.status);
        console.log(' Data count:', telekomData.data?.length || 0);
      } else {
        console.log('✗ /api/telekom-data: FAILED -', telekomResponse.status, await telekomResponse.text());
      }
    } catch (error) {
      console.log('✗ /api/telekom-data: ERROR -', error.message);
    }

    console.log('\nTesting /api/admin/users endpoint...');
    try {
      const usersResponse = await fetch('http://localhost:4000/api/admin/users', {
        headers
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('✓ /api/admin/users: SUCCESS - Status', usersResponse.status);
        console.log(' Users count:', usersData.users?.length || 0);
      } else {
        console.log('✗ /api/admin/users: FAILED -', usersResponse.status, await usersResponse.text());
      }
    } catch (error) {
      console.log('✗ /api/admin/users: ERROR -', error.message);
    }

    console.log('\nTesting /api/admin/users/admins endpoint...');
    try {
      const adminsResponse = await fetch('http://localhost:4000/api/admin/users/admins', {
        headers
      });
      
      if (adminsResponse.ok) {
        const adminsData = await adminsResponse.json();
        console.log('✓ /api/admin/users/admins: SUCCESS - Status', adminsResponse.status);
        console.log('  Admins count:', adminsData?.length || 0);
      } else {
        console.log('✗ /api/admin/users/admins: FAILED -', adminsResponse.status, await adminsResponse.text());
      }
    } catch (error) {
      console.log('✗ /api/admin/users/admins: ERROR -', error.message);
    }

    console.log('\nAll tests completed!');

  } catch (err) {
    console.error('Error during testing:', err.message);
  } finally {
    await client.end();
  }
}

testSuperadminAccess();