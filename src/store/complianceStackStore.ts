import { create } from 'zustand';

export interface StackModule {
  id: string;
  name: string;
  tagline: string;
  jurisdiction: string;
  spec: string;
  latency: string;
  iconType: 'shield' | 'cookie' | 'scale' | 'zap' | 'file';
}

export const ALL_STACK_MODULES: StackModule[] = [
  {
    id: 'privacy',
    name: 'Autonomous Privacy Policy Engine',
    tagline: 'Multi-jurisdiction disclosures mapped to continuous third-party telemetry',
    jurisdiction: 'GDPR / CCPA / PIPEDA / APPs',
    spec: 'Lawyer-vetted v4.2.1',
    latency: '1.2ms edge delivery',
    iconType: 'shield'
  },
  {
    id: 'cookie',
    name: 'Zero-Code Consent & Tracker Blocker',
    tagline: 'Autonomous script interception with geo-aware opt-out banners',
    jurisdiction: 'ePrivacy Directive / CPRA',
    spec: 'IAB TCF v2.2 Compatible',
    latency: '0.8ms DOM injection',
    iconType: 'cookie'
  },
  {
    id: 'terms',
    name: 'SaaS Terms of Service & EULA Generator',
    tagline: 'Ironclad arbitration, liability caps, SLA commitments, and usage rights',
    jurisdiction: 'US / UK / EU Commercial Code',
    spec: 'Standard SaaS v3.8',
    latency: 'Real-time CDN sync',
    iconType: 'scale'
  },
  {
    id: 'dpa',
    name: 'Data Processing Agreement (DPA + SCCs)',
    tagline: 'Standard Contractual Clauses with sub-processor registry and audit rights',
    jurisdiction: 'EU-US Data Privacy Framework',
    spec: 'Article 28 GDPR compliant',
    latency: 'Instant PDF / JSON export',
    iconType: 'file'
  }
];

interface ComplianceStackState {
  selectedModuleIds: string[];
  isDrawerOpen: boolean;
  activePack: 'starter' | 'growth' | 'enterprise';
  toggleModule: (id: string) => void;
  addModule: (id: string) => void;
  removeModule: (id: string) => void;
  setDrawerOpen: (open: boolean) => void;
  setActivePack: (pack: 'starter' | 'growth' | 'enterprise') => void;
  clearStack: () => void;
}

export const useComplianceStackStore = create<ComplianceStackState>((set) => ({
  selectedModuleIds: ['privacy', 'cookie'], // Default 2 items active
  isDrawerOpen: false,
  activePack: 'growth',
  toggleModule: (id) =>
    set((state) => {
      const exists = state.selectedModuleIds.includes(id);
      return {
        selectedModuleIds: exists
          ? state.selectedModuleIds.filter((m) => m !== id)
          : [...state.selectedModuleIds, id]
      };
    }),
  addModule: (id) =>
    set((state) => ({
      selectedModuleIds: state.selectedModuleIds.includes(id)
        ? state.selectedModuleIds
        : [...state.selectedModuleIds, id]
    })),
  removeModule: (id) =>
    set((state) => ({
      selectedModuleIds: state.selectedModuleIds.filter((m) => m !== id)
    })),
  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  setActivePack: (pack) => set({ activePack: pack }),
  clearStack: () => set({ selectedModuleIds: [] })
}));
