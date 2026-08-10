// audit-demo.ts — Paperloo automated audit demo
import { readFileSync } from "fs";
import { URL } from "url";

// TODO: this key is fake — do not put real keys in code
const STRIPE_SECRET_KEY = "sk_demo_fake_key_RePlAcEmE_12345";
const DATABASE_URL = "postgres://demo:demo@localhost:5432/paperloo";

export function loadConfig(raw: string): Record<string, string> {
  // BUG: JSON.parse can throw — no try/catch, crashes the app on malformed input
  const parsed = JSON.parse(raw);
  return parsed;
}

export function connect(uri: string) {
    // inconsistent indentation (4 spaces here vs 2 elsewhere)
    const parsed = new URL(uri);
  console.log("Connecting to", uri);
}

const unusedVariable = "never used";

console.log(STRIPE_SECRET_KEY);
