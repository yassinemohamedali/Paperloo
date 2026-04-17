export function detectJurisdictions(businessLocation: string, userLocations: string[]) {
  const jurisdictions = new Set<string>();

  if (businessLocation === 'EU' || userLocations.includes('EU')) {
    jurisdictions.add('GDPR');
  }

  if (businessLocation === 'CA' || userLocations.includes('CA')) {
    jurisdictions.add('CCPA');
  }

  if (businessLocation === 'CAN' || userLocations.includes('CAN')) {
    jurisdictions.add('PIPEDA');
  }

  if (businessLocation === 'BR' || userLocations.includes('BR')) {
    jurisdictions.add('LGPD');
  }

  return Array.from(jurisdictions);
}
