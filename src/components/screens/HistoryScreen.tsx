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
    if (filtered.length === 0) {
      onShowToast('info', 'No Records to Export', 'There are no forensic log records to export yet.');
      return;
    }

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
      <div className="p-6 sm:p-8 rounded-3xl border border-sky-100 bg-white/85 backdrop-blur-xl shadow-soft-blue flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
              Voice Forensic Investigation History
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-sans mt-1">
            Immutable cryptographic audit trail of all screened incoming voice streams across corporate communication channels
          </p>
        </div>

        <LiquidButton
          onClick={handleExportCSV}
          size="default"
          primary={true}
          className="text-white font-semibold text-xs cursor-pointer shadow-xs"
        >
          <Download className="h-4 w-4 text-sky-100 mr-2" />
          <span>Export Audit Log (CSV)</span>
        </LiquidButton>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search incident case ID, title, or forensic keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-sky-200/80 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-xs"
          />
        </div>

        {/* Risk Filter */}
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl text-xs font-medium border border-slate-200/70 shadow-inner">
          <button
            onClick={() => setSelectedRiskFilter('all')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer transition-colors ${selectedRiskFilter === 'all' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'}`}
          >
            All Risk
          </button>
          <button
            onClick={() => setSelectedRiskFilter('high')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer transition-colors ${selectedRiskFilter === 'high' ? 'bg-rose-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'}`}
          >
            High Risk
          </button>
          <button
            onClick={() => setSelectedRiskFilter('uncertain')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer transition-colors ${selectedRiskFilter === 'uncertain' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'}`}
          >
            Uncertain
          </button>
          <button
            onClick={() => setSelectedRiskFilter('clean')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer transition-colors ${selectedRiskFilter === 'clean' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'}`}
          >
            Clean Human
          </button>
        </div>

        {/* Channel Source Filter */}
        <select
          value={selectedSourceFilter}
          onChange={(e) => setSelectedSourceFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-2xl border border-sky-200/80 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-xs cursor-pointer"
        >
          {sources.map((s) => (
            <option key={s} value={s} className="bg-white text-slate-900">
              {s === 'all' ? 'All Channels' : s}
            </option>
          ))}
        </select>
      </div>

      {/* History Table or Empty State */}
      <div className="rounded-3xl border border-sky-100 bg-white/85 backdrop-blur-xl p-6 shadow-soft-blue">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
            <div className="p-4 rounded-3xl bg-sky-50 border border-sky-200 text-blue-600 shadow-soft-blue">
              <FileAudio className="h-8 w-8 text-blue-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 font-display">
                No Forensic Investigation Logs
              </h3>
              <p className="text-xs text-slate-500 max-w-md">
                No voice forensic incidents recorded yet. New audit trails will automatically be logged here as incoming audio streams are analyzed in the Live Pipeline or Studio.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-sky-100 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Incident ID</th>
                  <th className="pb-3 font-semibold">Date & Timestamp</th>
                  <th className="pb-3 font-semibold">Incident Title & Details</th>
                  <th className="pb-3 font-semibold">Channel Source</th>
                  <th className="pb-3 font-semibold">Risk Verdict</th>
                  <th className="pb-3 font-semibold">Confidence</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100/80 text-slate-700">
                {filtered.map((inc) => (
                  <tr key={inc.id} className="hover:bg-sky-50/50 transition-colors">
                    <td className="py-4 font-mono font-bold text-blue-600">{inc.id}</td>
                    <td className="py-4 font-mono text-slate-500 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{inc.timestamp.split(' ')[0]}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{inc.timestamp.split(' ')[1]} UTC</span>
                    </td>
                    <td className="py-4 max-w-sm">
                      <div className="font-bold text-slate-900">{inc.title}</div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{inc.summaryReason}</p>
                    </td>
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-lg">
                        <FileAudio className="h-3.5 w-3.5 text-blue-600" />
                        {inc.source}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                        inc.riskCategory === 'synthetic_high'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : inc.riskCategory === 'human_verified'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {inc.riskCategory === 'synthetic_high' ? (
                          <ShieldAlert className="h-3 w-3 text-rose-600" />
                        ) : inc.riskCategory === 'human_verified' ? (
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <HelpCircle className="h-3 w-3 text-amber-600" />
                        )}
                        <span>{inc.riskScore.toFixed(0)}% • {inc.verdictLabel.split(' ')[0]}</span>
                      </span>
                    </td>
                    <td className="py-4 font-mono text-slate-600 text-[11px]">
                      {inc.confidenceInterval.value.toFixed(1)}% (±{inc.confidenceInterval.marginOfError}%)
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => {
                          onSelectIncident(inc);
                          onNavigate('results');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
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
        )}
      </div>
    </div>
  );
};
