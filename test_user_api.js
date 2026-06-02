// test_user_api.js
// This script creates a demo user (if not existing), logs in, obtains a JWT, then fetches the protected /api/users endpoint.
// Run with: node test_user_api.js

async function main() {
  const base = 'http://localhost:5000/api';

  // Helper to POST JSON
  async function post(path, body) {
    const res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  // 1️⃣ Create demo user (ignore duplicate error)
  const demo = { name: 'Demo User', email: 'demo@example.com', password: 'password123' };
  try {
    await post('/auth/signup', demo);
    console.log('✅ Demo user created (or already existed)');
  } catch (e) {
    console.log('⚠️ Signup error (likely already exists)');
  }

  // 2️⃣ Log in to obtain JWT
  const loginRes = await post('/auth/login', { email: demo.email, password: demo.password });
  const token = loginRes.token;
  console.log('🔑 JWT token obtained:', token?.slice(0, 20) + '...');

  // 3️⃣ Call protected GET /users
  const usersRes = await fetch(`${base}/users/`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const users = await usersRes.json();
  console.log('📋 Users response (status', usersRes.status, '):', JSON.stringify(users, null, 2));
}

main().catch((err) => console.error('❌ Unexpected error:', err));
