import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BarChart3, 
  Layers, 
  Users, 
  History, 
  ShieldAlert, 
  ChevronDown, 
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
  activeIncident: AnalysisIncident;
  allIncidents: AnalysisIncident[];
  onSelectIncident: (incident: AnalysisIncident) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAccountSetup?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onSelectScreen,
  activeIncident,
  allIncidents,
  onSelectIncident,
  soundEnabled,
  onToggleSound,
  onOpenAccountSetup,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
    { id: 'results', label: 'Verdict', icon: ShieldAlert },
    { id: 'profiles', label: 'Identities', icon: Users },
    { id: 'history', label: 'History', icon: History },
    { id: 'privacy', label: 'Privacy', icon: Lock },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-3 sm:px-6 pt-3 pointer-events-none transition-all duration-300">
      <div 
        className={`max-w-6xl mx-auto rounded-full pointer-events-auto transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 backdrop-blur-2xl border border-sky-100 shadow-[0_12px_40px_rgba(2,132,199,0.1),inset_0_1px_1px_rgba(255,255,255,1)] py-2 px-4 sm:px-5'
            : 'bg-white/75 backdrop-blur-xl border border-sky-100/80 shadow-[0_8px_30px_rgba(2,132,199,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] py-2.5 px-4 sm:px-6'
        }`}
      >
        <div className="flex items-center justify-between gap-3 h-11">
          {/* Resona Minimal Vector Logo & Wordmark */}
          <div 
            onClick={() => onSelectScreen('overview')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)] group-hover:scale-105 transition-transform">
              <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                <rect x="12" y="12" width="5" height="24" rx="2.5" fill="white"/>
                <path d="M17 14.5C17 14.5 22 13 26 15C29.5 16.7 31 20 29.5 23.5C28 27 23.5 27.5 17 27.5" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 26.5L31 35.5" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
                <circle cx="34.5" cy="15.5" r="2.5" fill="#38BDF8"/>
              </svg>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold tracking-tight font-display text-slate-900 group-hover:text-blue-600 transition-colors">
                RESONA
              </span>
              <span className="hidden xl:inline text-[10px] font-mono text-slate-400 tracking-wider">
                VOICE INTELLIGENCE
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectScreen(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Scenario Presets, Sound Toggle, CTA */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Active Incident Scenario Selector Pill */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-sky-200 hover:border-blue-400 text-xs text-slate-800 transition-all cursor-pointer shadow-xs"
              >
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Case:</span>
                <span className="font-semibold truncate max-w-[110px] text-slate-900 font-sans">
                  {activeIncident.title.split(':')[0]}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white/95 border border-sky-100 p-2 shadow-xl backdrop-blur-xl z-50 space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Preset Auditing Scenarios
                  </div>
                  {allIncidents.slice(0, 4).map((inc) => (
                    <button
                      key={inc.id}
                      onClick={() => {
                        onSelectIncident(inc);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer ${
                        activeIncident.id === inc.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                        inc.riskCategory === 'synthetic_high'
                          ? 'bg-rose-500'
                          : inc.riskCategory === 'human_verified'
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`} />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate font-sans">
                          {inc.title}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {inc.source} • {inc.riskScore}% risk
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sound Feedback Toggle */}
            <button
              onClick={onToggleSound}
              className="p-2 rounded-full border border-sky-100 hover:border-blue-200 bg-white/80 text-slate-500 hover:text-blue-600 transition-all cursor-pointer shadow-xs"
              title={soundEnabled ? 'Acoustic Feedback Enabled' : 'Acoustic Feedback Muted'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Account Setup / Voice Enrollment Trigger */}
            {onOpenAccountSetup && (
              <button
                onClick={onOpenAccountSetup}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-blue-700 border border-sky-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                <Fingerprint className="h-3.5 w-3.5 text-blue-600" />
                <span>Enroll Voiceprint</span>
              </button>
            )}

            {/* High-Impact Liquid Glass Action */}
            <LiquidButton
              size="default"
              primary={true}
              onClick={() => onSelectScreen('pipeline')}
              className="hidden sm:inline-flex cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1 text-white" />
              <span>New Analysis</span>
            </LiquidButton>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full border border-sky-100 bg-white text-slate-700 cursor-pointer shadow-xs"
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
