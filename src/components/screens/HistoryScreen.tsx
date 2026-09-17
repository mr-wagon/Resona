import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  ShieldAlert, 
  ShieldCheck, 
  HelpCircle, 
  FileAudio, 
  Clock, 
  Calendar,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AnalysisIncident } from '../../types';
import { DemoBadge } from '../common/DemoBadge';
import { ScreenId } from '../layout/Navbar';

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
      <div className="p-6 rounded-2xl border border-sky-100 bg-white shadow-soft-blue flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 font-display">
              Voice Forensic Investigation History
            </h2>
            <DemoBadge type="demo" />
          </div>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Immutable cryptographic audit trail of all screened incoming voice streams across corporate communication channels
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sky-800 hover:bg-sky-50 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
        >
          <Download className="h-4 w-4" />
          <span>Export Audit Log (CSV)</span>
        </button>
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
          />
        </div>

        {/* Risk Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
          <button
            onClick={() => setSelectedRiskFilter('all')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${selectedRiskFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-2xs' : ''}`}
          >
            All Risk
          </button>
          <button
            onClick={() => setSelectedRiskFilter('high')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${selectedRiskFilter === 'high' ? 'bg-red-50 text-red-700 font-bold shadow-2xs' : ''}`}
          >
            High Risk
          </button>
          <button
            onClick={() => setSelectedRiskFilter('uncertain')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${selectedRiskFilter === 'uncertain' ? 'bg-amber-50 text-amber-700 font-bold shadow-2xs' : ''}`}
          >
            Uncertain
          </button>
          <button
            onClick={() => setSelectedRiskFilter('clean')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${selectedRiskFilter === 'clean' ? 'bg-emerald-50 text-emerald-700 font-bold shadow-2xs' : ''}`}
          >
            Clean Human
          </button>
        </div>

        {/* Channel Source Filter */}
        <select
          value={selectedSourceFilter}
          onChange={(e) => setSelectedSourceFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
        >
          {sources.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All Channels' : s}
            </option>
          ))}
        </select>
      </div>

      {/* History Table */}
      <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-soft-blue">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Incident ID</th>
                <th className="pb-3 font-semibold">Date & Timestamp</th>
                <th className="pb-3 font-semibold">Incident Title & Details</th>
                <th className="pb-3 font-semibold">Channel Source</th>
                <th className="pb-3 font-semibold">Risk Verdict</th>
                <th className="pb-3 font-semibold">Confidence</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((inc) => (
                <tr key={inc.id} className="hover:bg-sky-50/40 transition-colors">
                  <td className="py-4 font-mono font-bold text-slate-600">{inc.id}</td>
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
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                      <FileAudio className="h-3 w-3 text-sky-600" />
                      {inc.source}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                      inc.riskCategory === 'synthetic_high'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : inc.riskCategory === 'human_verified'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
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
                  <td className="py-4 font-mono text-slate-600 text-[11px]">
                    {inc.confidenceInterval.value.toFixed(1)}% (±{inc.confidenceInterval.marginOfError}%)
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => {
                        onSelectIncident(inc);
                        onNavigate('results');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
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
