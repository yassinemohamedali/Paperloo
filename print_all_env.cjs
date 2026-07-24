console.log(Object.keys(process.env).filter(k => k.includes('SUPA') || k.includes('POSTGRES') || k.includes('DB') || k.includes('DATA')));
