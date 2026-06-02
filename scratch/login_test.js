const fetch = require('node-fetch');
(async () => {
  try {
    const res = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'anira@taskflow.app', password: 'password123' })
    });
    const data = await res.json();
    console.log('Response:', data);
  } catch (e) {
    console.error('Error:', e);
  }
})();
