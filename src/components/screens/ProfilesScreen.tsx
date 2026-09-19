import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  X, 
  ChevronRight,
  ShieldCheck,
  Fingerprint,
  Sparkles
} from 'lucide-react';
import { VoiceProfile, AnalysisIncident } from '../../types';
import { ScreenId } from '../layout/Navbar';
import { LiquidButton } from '../ui/liquid-glass-button';

interface ProfilesScreenProps {
  profiles: VoiceProfile[];
  onNavigate: (screen: ScreenId) => void;
  activeIncident: AnalysisIncident;
  onShowToast: (type: 'success' | 'warning' | 'info', title: string, message: string) => void;
  onOpenAccountSetup?: () => void;
}

export const ProfilesScreen: React.FC<ProfilesScreenProps> = ({
  profiles,
  onNavigate,
  activeIncident,
  onShowToast,
  onOpenAccountSetup,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedProfile, setSelectedProfile] = useState<VoiceProfile | null>(null);

  const availableDepts = Array.from(new Set(profiles.map((p) => p.department).filter(Boolean)));
  const departments = ['all', ...availableDepts];

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch = p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'all' || p.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleTestVerification = (profile: VoiceProfile) => {
    onShowToast(
      'info',
      'Comparing Biometric Voiceprint',
      `Comparing ${profile.fullName} against current incident "${activeIncident.title}"...`
    );
    onNavigate('results');
  };

  const handleEnrollClick = () => {
    if (onOpenAccountSetup) {
      onOpenAccountSetup();
    } else {
      onNavigate('enrollment');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl border border-sky-100 bg-white/85 backdrop-blur-xl shadow-soft-blue flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
              Organizational Identity Directory
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-sans mt-1">
            Cryptographic voiceprints and verified biometric identity registry for executive financial & operational approval
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <LiquidButton
            onClick={handleEnrollClick}
            size="default"
            primary={true}
            className="cursor-pointer"
          >
            <UserPlus className="h-4 w-4 text-white mr-1.5" />
            <span>Enroll New Voiceprint</span>
          </LiquidButton>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, executive role, or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-sky-200/80 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-medium transition-colors cursor-pointer ${
                selectedDept === dept
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-white border border-sky-100 text-slate-600 hover:text-slate-900 hover:bg-sky-50'
              }`}
            >
              {dept === 'all' ? 'All Departments' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Profiles Grid or Empty State */}
      {filteredProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-sky-200 bg-white/70 shadow-soft-blue space-y-4">
          <div className="p-4 rounded-3xl bg-sky-50 border border-sky-200 text-blue-600 shadow-soft-blue">
            <Fingerprint className="h-8 w-8 text-blue-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 font-display">
              No Enrolled Voiceprint Identities
            </h3>
            <p className="text-xs text-slate-500 max-w-md">
              No caller or executive voiceprints are enrolled yet. Click below to register an authorized voiceprint for biometric verification.
            </p>
          </div>
          <LiquidButton
            onClick={handleEnrollClick}
            size="default"
            primary={true}
            className="cursor-pointer shadow-xs"
          >
            <UserPlus className="h-4 w-4 mr-1.5" />
            <span>Enroll First Voiceprint</span>
          </LiquidButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProfiles.map((prof) => (
            <div
              key={prof.id}
              className="p-5 rounded-3xl border border-sky-100/90 bg-white/90 backdrop-blur-xl shadow-soft-blue hover:shadow-lg hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={prof.avatarUrl}
                      alt={prof.fullName}
                      className="w-12 h-12 rounded-2xl object-cover border border-sky-100 shadow-xs"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {prof.fullName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{prof.role}</p>
                      <span className="text-[10px] font-mono text-slate-400">{prof.employeeId}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    prof.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {prof.status === 'active' ? 'ACTIVE' : 'UPDATE REQ'}
                  </span>
                </div>

                {/* Department and Voiceprint Clearance */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-50 text-[10px] font-medium text-slate-600 border border-slate-200/60">
                    {prof.department}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-[10px] font-mono font-semibold text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Verified Voiceprint
                  </span>
                </div>

                {/* Quality & Fingerprint Details */}
                <div className="mt-4 pt-3 border-t border-sky-100 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Voiceprint Health:</span>
                    <span className="font-bold text-emerald-600">{prof.voiceprintQuality}% Match</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Enrolled Samples:</span>
                    <span className="text-slate-700 font-semibold">{prof.voiceSamplesCount} ({prof.sampleDurationSec}s total)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Embedding Hash:</span>
                    <span className="text-blue-600 truncate max-w-[130px] font-mono">{prof.embeddingHash}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-sky-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedProfile(prof)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
                >
                  Inspect Details
                </button>

                <button
                  onClick={() => handleTestVerification(prof)}
                  className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-blue-700 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <span>Verify Caller</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl border border-sky-100 max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-5 text-slate-900">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProfile.avatarUrl}
                  alt={selectedProfile.fullName}
                  className="w-14 h-14 rounded-2xl object-cover border border-sky-100 shadow-sm"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">{selectedProfile.fullName}</h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedProfile.role}</p>
                  <span className="text-[11px] font-mono text-slate-400">{selectedProfile.employeeId}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Authorization Scope:</span>
                <span className="font-bold text-slate-800">{selectedProfile.securityTier.replace(/^Tier \d+ - /, '')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Enrollment Date:</span>
                <span className="text-slate-700">{selectedProfile.enrollmentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Verified Call:</span>
                <span className="text-slate-700">{selectedProfile.lastVerifiedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Voiceprint Health:</span>
                <span className="text-emerald-600 font-bold">{selectedProfile.voiceprintQuality}% Nominal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">512-Dim Hash:</span>
                <span className="text-blue-600 truncate max-w-[200px]">{selectedProfile.embeddingHash}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedProfile(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const prof = selectedProfile;
                  setSelectedProfile(null);
                  handleTestVerification(prof);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-soft-blue cursor-pointer transition-all"
              >
                Run Verification Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
