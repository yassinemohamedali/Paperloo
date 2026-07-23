import fs from 'fs';

const code = fs.readFileSync('src/lib/compliance.ts', 'utf8');

const updated = code.replace(
  /const \{ error: scoreError \} = await \(supabase\s*\.from\('compliance_scores'\) as any\)\s*\/\/ First check if it exists/g,
  `// First check if it exists`
);

fs.writeFileSync('src/lib/compliance.ts', updated);
