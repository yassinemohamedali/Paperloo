import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Globe, 
  Bell, 
  Settings, 
  CreditCard, 
  LogOut,
  Shield,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '@/src/store/authStore';
import { cn } from '@/src/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'System Overview', path: '/dashboard' },
  { icon: Globe, label: 'Deployment Hub', path: '/sites' },
  { icon: Bell, label: 'Risk Monitor', path: '/alerts' },
  { icon: Shield, label: 'Governance Library', path: '/regulations' },
  { icon: CreditCard, label: 'Revenue Governance', path: '/billing' },
  { icon: Settings, label: 'System Config', path: '/settings' },
];

export default function DashboardLayout() {
  const { signOut, user } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-bg overflow-hidden relative">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[70] w-[280px] md:w-[240px] bg-surface border-r border-border-custom flex flex-col transition-transform duration-300 md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex-shrink-0 bg-accent rounded-[6px] flex items-center justify-center p-1">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-black">
                <path d="M35 25h15c10 0 15 5 15 12.5S60 50 50 50H35v25h-5V25zm5 20h10c7 0 10-3 10-7.5S57 30 50 30H40v15z" />
              </svg>
            </div>
            <span className="logo text-lg tracking-widest whitespace-nowrap">PAPERLOO INF</span>
          </div>
          <button 
            className="md:hidden p-2 text-muted"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto uppercase">
          {navItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              style={{ 
                animationDelay: `${index * 50}ms`,
                opacity: 0,
                animation: 'fadeInLeft 0.5s ease-out forwards'
              }}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-4 md:py-3 text-sm font-medium transition-all relative group",
                isActive ? "text-text-custom" : "text-muted-custom hover:text-text-custom"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-accent" 
                    />
                  )}
                  <item.icon className={cn("h-5 w-5 md:h-4 md:w-4 transition-colors duration-300", isActive ? "text-accent" : "text-muted-custom group-hover:text-text-custom")} />
                  <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1 text-base md:text-sm">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-border-custom bg-surface-2/50">
          <div className="px-4 py-2 mb-4 bg-black/20 rounded-lg">
            <p className="text-xs font-mono text-accent truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-muted-custom hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5 md:h-4 md:w-4" />
            <span className="text-base md:text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 md:h-20 flex-shrink-0 flex items-center justify-between px-6 md:px-10 relative overflow-hidden border-b border-border-custom bg-black/50 backdrop-blur-md">
          <div className="absolute inset-0 grid-dots-animated opacity-10" />
          
          <div className="flex items-center gap-4 relative z-10">
            <button 
              className="md:hidden p-2 -ml-2 text-white hover:text-accent transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-sans font-extrabold tracking-[0.04em] truncate">
              {navItems.find(item => window.location.pathname.startsWith(item.path))?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <Link 
              to="/settings"
              className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-surface-2 border border-border-custom flex items-center justify-center text-xs font-bold text-accent hover:border-accent transition-all hover:scale-105"
            >
              {user?.email?.[0].toUpperCase()}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto px-4 py-8 md:p-10 flex flex-col">
          <div className="flex-1 max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>

          {/* Persistent Legal Safety Footer */}
          <footer className="mt-16 py-8 border-t border-border-custom bg-surface-2/30 rounded-2xl px-6 md:px-10">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center gap-3 text-red-500/80">
                <AlertCircle className="h-4 w-4" />
                <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Mandatory Legal Disclosure</h4>
              </div>
              <p className="text-[9px] md:text-[10px] leading-relaxed text-muted-custom uppercase tracking-wider opacity-60">
                Paperloo.com is an automated AI platform and is not a law firm. We do not provide legal advice, 
                opinion or recommendations. Use of this service does not create an attorney-client relationship. 
                All generated documents must be reviewed by qualified legal counsel.
              </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
