let exportedApp: any;
try {
  const mod = require('../server');
  exportedApp = mod.default || mod;
} catch (e: any) {
  exportedApp = (req: any, res: any) => {
    res.status(500).json({ error: e.message, stack: e.stack });
  };
}
export default exportedApp;
