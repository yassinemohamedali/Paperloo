import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Globe, 
  Bell, 
  Settings, 
  CreditCard, 
  LogOut,
  Shield,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/src/store/authStore';
import { cn } from '@/src/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Globe, label: 'Sites', path: '/sites' },
  { icon: Bell, label: 'Alerts', path: '/alerts' },
  { icon: Shield, label: 'Regulations', path: '/regulations' },
  { icon: CreditCard, label: 'Billing', path: '/billing' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function DashboardLayout() {
  const { signOut, user } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] flex-shrink-0 bg-surface border-r border-border-custom flex flex-col">
        <div className="p-8 flex items-center gap-2">
          <Shield className="h-6 w-6 text-accent" />
          <span className="logo text-xl">Paperloo</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={{ 
                animationDelay: `${index * 50}ms`,
                opacity: 0,
                animation: 'fadeInLeft 0.5s ease-out forwards'
              }}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all relative group",
                isActive ? "text-text-custom" : "text-muted-custom hover:text-text-custom"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-accent" 
                      style={{ 
                        viewTransitionName: 'active-indicator',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    />
                  )}
                  <item.icon className={cn("h-4 w-4 transition-colors duration-300", isActive ? "text-accent" : "text-muted-custom group-hover:text-text-custom")} />
                  <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border-custom">
          <div className="px-4 py-3 mb-2">
            <p className="text-xs font-medium text-muted-custom truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-muted-custom hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header with Grid Dots */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-10 relative overflow-hidden border-b border-border-custom">
          <div className="absolute inset-0 grid-dots-animated opacity-20" />
          <div className="absolute inset-0 radial-fade" />
          
          <div className="relative z-10">
            <h2 className="text-lg font-sans font-extrabold tracking-[0.04em]">
              {navItems.find(item => window.location.pathname.startsWith(item.path))?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-surface--2 border border-border-custom flex items-center justify-center text-xs font-bold text-accent">
              {user?.email?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-10 flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>

          {/* Persistent Legal Safety Footer */}
          <footer className="mt-12 py-8 border-t border-border-custom bg-surface/50 rounded-t-[20px] px-8">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Mandatory Legal Disclosure</h4>
              </div>
              <p className="text-[10px] leading-relaxed text-muted-custom uppercase tracking-wider">
                Paperloo.com is an automated AI platform and is not a law firm. We do not provide legal advice, 
                opinion or recommendations about your legal rights, remedies, defenses, options, selection of forms, 
                or strategies. The creator of this platform is not a licensed attorney. Use of this service 
                does not create an attorney-client relationship. All generated documents must be reviewed by 
                qualified legal counsel prior to use in a production environment.
              </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
