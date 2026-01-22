const http = require('http');

const data = JSON.stringify({
    amount: 100,
    currency: 'brl'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/create-payment-intent',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    },
    timeout: 5000
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);

    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('Response:', responseData);
    });
});

req.on('error', (error) => {
    console.error('Error:', error.message);
});

req.on('timeout', () => {
    console.error('Request timeout');
    req.destroy();
});

req.write(data);
req.end();
