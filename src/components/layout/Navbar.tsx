import React, { useState } from 'react';
import { 
  Activity, 
  BarChart3, 
  Layers, 
  UserCheck, 
  Users, 
  History, 
  ShieldAlert, 
  ChevronDown, 
  Volume2, 
  VolumeX, 
  SlidersHorizontal,
  Lock,
  Radio
} from 'lucide-react';
import { AnalysisIncident } from '../../types';
import { DemoBadge } from '../common/DemoBadge';

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
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onSelectScreen,
  activeIncident,
  allIncidents,
  onSelectIncident,
  soundEnabled,
  onToggleSound,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems: { id: ScreenId; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'overview', label: 'Command Center', icon: Activity },
    { id: 'pipeline', label: 'Live Pipeline', icon: Layers, badge: '5 Stages' },
    { id: 'workspace', label: 'Audio Intelligence', icon: BarChart3 },
    { id: 'results', label: 'Forensic Verdict', icon: ShieldAlert, badge: `${activeIncident.riskScore.toFixed(0)}% Risk` },
    { id: 'enrollment', label: 'Enroll Voice', icon: UserCheck },
    { id: 'profiles', label: 'Identities', icon: Users },
    { id: 'history', label: 'Investigations', icon: History },
    { id: 'privacy', label: 'Privacy & Models', icon: Lock },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sky-100/90 bg-white/85 backdrop-blur-xl shadow-xs">
      {/* Top Telemetry Strip */}
      <div className="border-b border-sky-100/60 bg-gradient-to-r from-sky-50/70 via-blue-50/50 to-indigo-50/60 px-4 py-1.5 text-[11px] font-mono text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
            </span>
            <span className="font-semibold text-slate-800">RESONA-CORE v2.4</span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-600 font-medium">OPERATIONAL</span>
          </div>
          <span className="hidden sm:inline text-slate-400">|</span>
          <div className="hidden sm:flex items-center gap-1 text-slate-500">
            <span>Latency:</span>
            <span className="font-semibold text-slate-700">142ms</span>
          </div>
          <span className="hidden md:inline text-slate-400">|</span>
          <div className="hidden md:flex items-center gap-1 text-slate-500">
            <span>Memory:</span>
            <span className="font-semibold text-sky-700">Ephemeral (Zero-Disk)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Preset Scenario Selector */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/90 border border-sky-200 text-[11px] font-medium text-slate-700 hover:bg-sky-50 transition-colors shadow-2xs"
            >
              <Radio className="h-3 w-3 text-sky-600 animate-pulse" />
              <span className="hidden lg:inline text-slate-500">Active Preset:</span>
              <span className="font-bold text-sky-800 truncate max-w-[140px] sm:max-w-[190px]">
                {activeIncident.title}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-80 rounded-xl bg-white border border-sky-200 shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Incident Scenario
                </div>
                {allIncidents.slice(0, 4).map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => {
                      onSelectIncident(inc);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex flex-col gap-0.5 ${
                      inc.id === activeIncident.id
                        ? 'bg-sky-50 text-sky-900 font-semibold border border-sky-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{inc.title}</span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        inc.riskCategory === 'synthetic_high'
                          ? 'bg-red-100 text-red-700'
                          : inc.riskCategory === 'human_verified'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {inc.riskScore.toFixed(0)}%
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 truncate">{inc.summaryReason}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Disable UI sound feedback' : 'Enable UI sound feedback'}
            className="p-1 rounded-md text-slate-500 hover:text-sky-600 hover:bg-white/80 transition-colors"
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-sky-600" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>

          <DemoBadge type="demo" showTooltip={true} />
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            onClick={() => onSelectScreen('overview')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-white via-sky-50 to-blue-50 border border-sky-200 shadow-soft-blue group-hover:border-sky-400 group-hover:shadow-glow-blue transition-all">
              {/* Logo icon SVG */}
              <div className="relative w-7 h-7 flex items-center justify-center">
                <span className="absolute w-6 h-6 rounded-full border border-sky-400/40 animate-ping" style={{ animationDuration: '3s' }} />
                <span className="absolute w-4 h-4 rounded-full border border-blue-500/60" />
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 shadow-xs" />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight font-display text-slate-900 group-hover:text-blue-600 transition-colors">
                  RESONA
                </span>
                <span className="rounded bg-sky-100/80 px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider text-sky-700 uppercase border border-sky-200">
                  SIH Prototype
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 tracking-wide font-sans">
                Hear Beyond the Surface.
              </span>
            </div>
          </div>

          {/* Navigation Screens Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectScreen(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-soft-blue'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/70'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Action Button for Mobile or Desktop */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectScreen('workspace')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-semibold shadow-soft-blue hover:from-sky-600 hover:to-blue-700 hover:shadow-glow-blue transition-all cursor-pointer active:scale-95"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Launch Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Screen Navigation Strip */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-sky-100/60 bg-sky-50/30 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-white bg-white/60 border border-slate-200/50'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
