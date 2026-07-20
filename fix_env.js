const fs = require('fs');
const glob = require('glob');

const files = [
  'src/pages/Documents.tsx',
  'src/pages/Sites.tsx',
  'src/pages/Login.tsx',
  'src/pages/Signup.tsx',
  'src/pages/AuthCallback.tsx',
  'src/components/sites/DSARInbox.tsx',
  'src/components/sites/CookieBanner.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('window.location.origin')) {
    content = `import { config } from '@/src/config/env';\n` + content;
    content = content.replace(/window\.location\.origin/g, 'config.appUrl');
    fs.writeFileSync(file, content);
  }
}
