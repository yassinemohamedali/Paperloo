console.log("URL:", process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL);
console.log("ANON:", !!(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY));
console.log("SERVICE:", !!(process.env.SUPABASE_SERVICE_ROLE_KEY));
