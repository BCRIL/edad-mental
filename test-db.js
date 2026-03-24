const https = require('https');

const url = 'https://owfppbdauqmghpmqrgse.supabase.co/rest/v1/rankings';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93ZnBwYmRhdXFtZ2hwbXFyZ3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjYyNDEsImV4cCI6MjA4OTk0MjI0MX0.AiW5Pmc8mSqa0Rx-EmWk5nzSrTDqCl99eKLnQg7v9Fw';

const body = JSON.stringify({
    player_name: 'test',
    difficulty: 'normal',
    brain_age: 25,
    reaction_score: 90,
    numbers_score: 80,
    patterns_score: 70,
    math_score: 60,
    sequence_score: 50
});

const req = https.request(url, {
    method: 'POST',
    headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
}, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(`BODY: ${data}`));
});

req.on('error', (e) => {
    console.error(`ERROR: ${e.message}`);
});

req.write(body);
req.end();
