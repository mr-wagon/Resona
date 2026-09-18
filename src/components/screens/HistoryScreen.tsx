import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  ShieldAlert, 
  ShieldCheck, 
  HelpCircle, 
  FileAudio, 
  Clock, 
  ArrowRight
} from 'lucide-react';
import { AnalysisIncident } from '../../types';
import { DemoBadge } from '../common/DemoBadge';
import { ScreenId } from '../layout/Navbar';
import { LiquidButton } from '../ui/liquid-glass-button';

interface HistoryScreenProps {
  incidents: AnalysisIncident[];
  onSelectIncident: (incident: AnalysisIncident) => void;
  onNavigate: (screen: ScreenId) => void;
  onShowToast: (type: 'success' | 'warning' | 'info', title: string, message: string) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  incidents,
  onSelectIncident,
  onNavigate,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('all');

  const sources = [
    'all',
    'Wire Authorization Line',
    'VoIP Enterprise Call',
    'Call Center IVR',
    'Inbound Voicemail',
    'Zoom Executive Recording',
  ];

  const filtered = incidents.filter((inc) => {
    const matchesSearch =
      inc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.summaryReason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk =
      selectedRiskFilter === 'all' ||
      (selectedRiskFilter === 'high' && inc.riskCategory === 'synthetic_high') ||
      (selectedRiskFilter === 'uncertain' && inc.riskCategory === 'uncertain') ||
      (selectedRiskFilter === 'clean' && inc.riskCategory === 'human_verified');

    const matchesSource = selectedSourceFilter === 'all' || inc.source === selectedSourceFilter;

    return matchesSearch && matchesRisk && matchesSource;
  });

  const handleExportCSV = () => {
    const headers = ['CaseID', 'Title', 'Timestamp', 'Source', 'RiskScore', 'Verdict', 'Confidence', 'Uncertainty'];
    const rows = filtered.map((inc) => [
      inc.id,
      `"${inc.title}"`,
      `"${inc.timestamp}"`,
      `"${inc.source}"`,
      inc.riskScore,
      `"${inc.verdictLabel}"`,
      `${inc.confidenceInterval.value}%`,
      `${inc.uncertaintyScore}%`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RESONA_Forensic_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast('success', 'Audit Trail Exported', `Exported ${filtered.length} forensic log records.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#0C1222]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white font-display tracking-tight">
              Voice Forensic Investigation History
            </h2>
            <DemoBadge type="demo" />
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Immutable cryptographic audit trail of all screened incoming voice streams across corporate communication channels
          </p>
        </div>

        <LiquidButton
          onClick={handleExportCSV}
          size="default"
          className="text-white font-semibold text-xs cursor-pointer"
        >
          <Download className="h-4 w-4 text-cyan-300 mr-2" />
          <span>Export Audit Log (CSV)</span>
        </LiquidButton>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search incident case ID, title, or forensic keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#080D1A] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 shadow-xs"
          />
        </div>

        {/* Risk Filter */}
        <div className="flex items-center gap-1 bg-[#080D1A] p-1 rounded-xl text-xs font-medium border border-white/10">
          <button
            onClick={() => setSelectedRiskFilter('all')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${selectedRiskFilter === 'all' ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 font-bold shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            All Risk
          </button>
          <button
            onClick={() => setSelectedRiskFilter('high')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${selectedRiskFilter === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            High Risk
          </button>
          <button
            onClick={() => setSelectedRiskFilter('uncertain')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${selectedRiskFilter === 'uncertain' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            Uncertain
          </button>
          <button
            onClick={() => setSelectedRiskFilter('clean')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${selectedRiskFilter === 'clean' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            Clean Human
          </button>
        </div>

        {/* Channel Source Filter */}
        <select
          value={selectedSourceFilter}
          onChange={(e) => setSelectedSourceFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-white/10 bg-[#080D1A] text-xs text-slate-200 font-medium focus:outline-none focus:border-cyan-400 shadow-xs cursor-pointer"
        >
          {sources.map((s) => (
            <option key={s} value={s} className="bg-[#080D1A] text-white">
              {s === 'all' ? 'All Channels' : s}
            </option>
          ))}
        </select>
      </div>

      {/* History Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0C1222]/85 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Incident ID</th>
                <th className="pb-3 font-semibold">Date & Timestamp</th>
                <th className="pb-3 font-semibold">Incident Title & Details</th>
                <th className="pb-3 font-semibold">Channel Source</th>
                <th className="pb-3 font-semibold">Risk Verdict</th>
                <th className="pb-3 font-semibold">Confidence</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filtered.map((inc) => (
                <tr key={inc.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-4 font-mono font-bold text-cyan-300">{inc.id}</td>
                  <td className="py-4 font-mono text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span>{inc.timestamp.split(' ')[0]}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{inc.timestamp.split(' ')[1]} UTC</span>
                  </td>
                  <td className="py-4 max-w-sm">
                    <div className="font-bold text-white">{inc.title}</div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{inc.summaryReason}</p>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                      <FileAudio className="h-3 w-3 text-cyan-400" />
                      {inc.source}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                      inc.riskCategory === 'synthetic_high'
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        : inc.riskCategory === 'human_verified'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}>
                      {inc.riskCategory === 'synthetic_high' ? (
                        <ShieldAlert className="h-3 w-3" />
                      ) : inc.riskCategory === 'human_verified' ? (
                        <ShieldCheck className="h-3 w-3" />
                      ) : (
                        <HelpCircle className="h-3 w-3" />
                      )}
                      <span>{inc.riskScore.toFixed(0)}% • {inc.verdictLabel.split(' ')[0]}</span>
                    </span>
                  </td>
                  <td className="py-4 font-mono text-slate-400 text-[11px]">
                    {inc.confidenceInterval.value.toFixed(1)}% (±{inc.confidenceInterval.marginOfError}%)
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => {
                        onSelectIncident(inc);
                        onNavigate('results');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Review</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
