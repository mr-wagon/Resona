import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BarChart3, 
  Layers, 
  Users, 
  History, 
  Volume2, 
  VolumeX, 
  Lock, 
  Plus, 
  Menu, 
  X, 
  Fingerprint 
} from 'lucide-react';
import { AnalysisIncident } from '../../types';
import { LiquidButton } from '../ui/liquid-glass-button';

export type ScreenId = 
  | 'overview' 
  | 'pipeline' 
  | 'workspace' 
  | 'results' 
  | 'enrollment' 
  | 'profiles' 
  | 'history' 
  | 'privacy';

interface NavbarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  activeIncident?: AnalysisIncident;
  allIncidents?: AnalysisIncident[];
  onSelectIncident?: (incident: AnalysisIncident) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAccountSetup?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onSelectScreen,
  soundEnabled,
  onToggleSound,
  onOpenAccountSetup,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: ScreenId; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'pipeline', label: 'Pipeline', icon: Layers },
    { id: 'workspace', label: 'Studio', icon: BarChart3 },
    { id: 'profiles', label: 'Identities', icon: Users },
    { id: 'history', label: 'History', icon: History },
    { id: 'privacy', label: 'Privacy', icon: Lock },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-3.5 pointer-events-none transition-all duration-300">
      <div 
        className={`max-w-7xl mx-auto rounded-2xl sm:rounded-full pointer-events-auto transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-2xl border border-sky-100 shadow-[0_14px_40px_rgba(2,132,199,0.12),inset_0_1px_1px_rgba(255,255,255,1)] py-2 px-4 sm:px-6 lg:pl-7 lg:pr-9'
            : 'bg-white/80 backdrop-blur-xl border border-sky-100/90 shadow-[0_10px_35px_rgba(2,132,199,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] py-2.5 px-4 sm:px-6 lg:pl-8 lg:pr-10'
        }`}
      >
        <div className="flex items-center justify-between gap-4 sm:gap-6 min-h-[50px]">
          {/* Left Group: Logo & Desktop Navigation Links */}
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-7 xl:gap-8">
            {/* Resona Minimal Vector Logo & Wordmark */}
            <div 
              onClick={() => onSelectScreen('overview')}
              className="flex items-center gap-3.5 cursor-pointer group select-none shrink-0"
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)] group-hover:scale-105 transition-transform">
                <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
                  <rect x="12" y="12" width="5" height="24" rx="2.5" fill="white"/>
                  <path d="M17 14.5C17 14.5 22 13 26 15C29.5 16.7 31 20 29.5 23.5C28 27 23.5 27.5 17 27.5" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 26.5L31 35.5" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
                  <circle cx="34.5" cy="15.5" r="2.5" fill="#38BDF8"/>
                </svg>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold tracking-tight font-display text-slate-900 group-hover:text-blue-600 transition-colors">
                  RESONA
                </span>
                <span className="hidden 2xl:inline text-[10px] font-mono text-slate-400 font-semibold tracking-wider">
                  VOICE INTELLIGENCE
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 bg-slate-100/90 p-1.5 rounded-full border border-slate-200/70 shadow-inner">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectScreen(item.id)}
                    className={`flex items-center gap-1.5 px-3.5 xl:px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-white/80'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Controls: Sound Toggle, Enrollment, CTA */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 pr-2 sm:pr-3 lg:pr-4">

            {/* Sound Feedback Toggle */}
            <button
              onClick={onToggleSound}
              className="p-2.5 rounded-full border border-sky-100 hover:border-blue-200 bg-white/80 text-slate-600 hover:text-blue-600 transition-all cursor-pointer shadow-xs"
              title={soundEnabled ? 'Acoustic Feedback Enabled' : 'Acoustic Feedback Muted'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Account Setup / Voice Enrollment Trigger */}
            {onOpenAccountSetup && (
              <button
                onClick={onOpenAccountSetup}
                className="hidden xl:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-sky-50 hover:bg-sky-100 text-blue-700 border border-sky-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                <Fingerprint className="h-4 w-4 text-blue-600" />
                <span>Enroll Voiceprint</span>
              </button>
            )}

            {/* High-Impact Liquid Glass Action */}
            <LiquidButton
              size="sm"
              primary={true}
              onClick={() => onSelectScreen('pipeline')}
              className="hidden sm:inline-flex cursor-pointer shadow-xs text-xs font-semibold h-10 px-5"
            >
              <Plus className="h-4 w-4 mr-1 text-white" />
              <span>New Analysis</span>
            </LiquidButton>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-full border border-sky-100 bg-white text-slate-700 cursor-pointer shadow-xs"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Flyout Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden pt-3 pb-2 border-t border-sky-100 mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectScreen(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
