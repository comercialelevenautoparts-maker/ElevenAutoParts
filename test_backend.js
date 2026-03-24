const axios = require('axios');

async function testRoutes() {
  const baseUrl = 'http://localhost:3000';
  const routes = [
    { method: 'get', url: '/' },
    { method: 'get', url: '/api/produtos' },
    { method: 'get', url: '/api/reviews' },
    { method: 'post', url: '/api/create-payment-intent', data: { amount: 100 } }
  ];

  for (const route of routes) {
    try {
      const response = await axios({
        method: route.method,
        url: `${baseUrl}${route.url}`,
        data: route.data
      });
      console.log(`✅ ${route.method.toUpperCase()} ${route.url}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${route.method.toUpperCase()} ${route.url}: ${error.response ? error.response.status : error.message}`);
      if (error.response && error.response.data) {
        console.log('   Data:', JSON.stringify(error.response.data));
      }
    }
  }
}

testRoutes();
