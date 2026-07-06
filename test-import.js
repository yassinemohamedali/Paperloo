import 'dotenv/config';

async function test() {
  const userId = 'd4026732-ee99-4193-a6dd-80c5d7047635'; // valid agency_id
  const repos = [{ name: 'another-test', url: 'https://test-import-repo.com' }];
  
  const res = await fetch('http://localhost:3000/api/github/bulk-import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, repos })
  });
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Response:', data);
}
test();
