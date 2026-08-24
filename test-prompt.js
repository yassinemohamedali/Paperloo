const prompt = `Generate a professional, strictly GDPR-compliant Privacy Policy in HTML format for:
    Website Name: Test Site
    Website URL: https://test.com
    Jurisdictions: EU
    Company Context (Answers from wizard): {"dataTypes":["Location Data","Full Names","Social Logins"],"analytics":true,"retention":"12 months","dpo":"dpo@test.com"}
    Target Language: en
    
    CRITICAL INSTRUCTIONS FOR COMPLIANCE:
    You MUST dynamically inject the specifics from the Company Context into the document:
    1. Data Types Collected: Explicitly list ALL data types from the context (e.g., Location Data, Full Names, Social Logins). Do not omit any.
    2. Legal Bases (Art. 6): Create a specific table or list mapping EACH collected data type to a strict GDPR legal basis (Consent, Contractual Necessity, or Legitimate Interest).
    3. Third-Party Disclosures: If the context indicates Analytics, Ads, or Social Logins, you MUST explicitly name them (e.g., Google Analytics) and describe their tracking.
    4. Cookie Consent (ePrivacy): If Analytics or Ads are used, include a strict Cookie & Tracking section detailing how they work and how to opt out.
    5. Data Retention: Do NOT use vague terms like "as long as necessary". Use the EXACT numerical retention period provided in the context (e.g., "maximum of 12 months").
    6. DPO Contact: If the context specifies a Data Protection Officer (DPO) and their contact info, dedicate a section to it in accordance with Art. 37-39.
    7. Data Subject Rights: Clearly list all GDPR user rights (Access, Erasure, Portability, Rectification). Include a statement informing users of their right to lodge a complaint with a local Supervisory Authority (DPA).
    8. International Transfers: If applicable based on the context, include Standard Contractual Clauses (SCCs) or cross-border transfer disclosures.

    FORMATTING: Return ONLY valid HTML content inside the body (excluding <html>, <head>, or <body> tags). Use headings (<h2>, <h3>), paragraphs (<p>), and unordered lists (<ul>).`;

fetch("http://localhost:3000/api/generate-content", {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt, model: "gemini-2.0-flash", systemInstruction: "You are a legal specialist. Return ONLY HTML.", temperature: 0.2 })
}).then(res => res.json()).then(data => console.log(data.text)).catch(console.error);
