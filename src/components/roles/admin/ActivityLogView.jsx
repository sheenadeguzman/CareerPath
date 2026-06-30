import React, { useState } from 'react';
import { Clock, ShieldCheck, Database, RefreshCw, FileText } from 'lucide-react';

export default function ActivityLogView({ logs = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 15;

  const getIcon = (mod) => {
    switch (mod) {
      case 'Authentication':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'Import/Export':
        return <Database className="w-4 h-4 text-[#cca43b]" />;
      default:
        return <FileText className="w-4 h-4 text-[#7c191e]" />;
    }
  };

  // Dynamic na kinukuha ang listahan ng mga natatanging module at role para sa mga opsyon sa filter
  const modules = ['All', ...new Set(logs.map(log => log.module).filter(Boolean))];
  const roles = ['All', ...new Set(logs.map(log => log.userRole).filter(Boolean))];

  // Paglalapat ng mga filter sa listahan ng logs
  const filteredLogs = logs.filter(log => {
    const text = (log.action + ' ' + log.details + ' ' + log.userName + ' ' + log.module + ' ' + log.userRole).toLowerCase();
    const matchesSearch = text.includes(searchQuery.toLowerCase());
    const matchesModule = selectedModule === 'All' || log.module === selectedModule;
    const matchesRole = selectedRole === 'All' || log.userRole === selectedRole;
    return matchesSearch && matchesModule && matchesRole;
  });

  // Kinakalkula ang mga detalye ng pagination (mga pahina)
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6 font-sans">
      
      <div className="border-b border-slate-100 pb-3 mb-4 flex justify-between items-center bg-slate-50/10">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">System Audits and Security Activity Log</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Continuous runtime telemetry capture tracking user changes, logins, and excel imports.</p>
        </div>
      </div>

      {/* Mga Filter para sa Paghahanap (Query Filters) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Search Audit Logs</label>
          <input
            type="text"
            placeholder="Search details, user, action..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#7c191e]"
          />
        </div>

        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Filter by Module</label>
          <select
            value={selectedModule}
            onChange={(e) => { setSelectedModule(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs font-bold text-slate-750 focus:outline-none"
          >
            {modules.map(mod => (
              <option key={mod} value={mod}>{mod === 'All' ? 'All Modules' : mod}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Filter by Role</label>
          <select
            value={selectedRole}
            onChange={(e) => { setSelectedRole(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs font-bold text-slate-750 focus:outline-none"
          >
            {roles.map(r => (
              <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row para sa katayuan ng filter (Filter status row) */}
      {(searchQuery || selectedModule !== 'All' || selectedRole !== 'All') && (
        <div className="flex justify-between items-center bg-slate-50 border border-slate-150 p-2.5 rounded-lg mb-4 text-xs font-semibold">
          <span className="text-slate-500">
            Filtered: Found <strong className="text-slate-800">{filteredLogs.length}</strong> matching entries.
          </span>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedModule('All');
              setSelectedRole('All');
              setCurrentPage(1);
            }}
            className="text-[10px] text-[#7c191e] hover:underline font-bold uppercase"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Listahan ng mga Logs */}
      <div className="space-y-4">
        {paginatedLogs.map(log => (
          <div key={log.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition flex items-start gap-4 animate-fade-in">
            
            {/* Visual Icon na kumakatawan sa kategorya ng module */}
            <div className="p-2 bg-white rounded-lg border border-slate-100 shrink-0 mt-0.5 shadow-xs">
              {getIcon(log.module)}
            </div>

            <div className="flex-1 space-y-1 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 font-sans">
                <span className="font-extrabold text-slate-800">{log.action}</span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              
              <p className="text-slate-600 leading-relaxed font-semibold font-sans">{log.details}</p>

              {/* Mga tag label para sa karagdagang impormasyon */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-2 py-0.5 bg-[#7c191e]/10 text-[#7c191e] border border-[#7c191e]/5 text-[9px] font-bold uppercase tracking-widest rounded">
                  {log.module}
                </span>
                <span className="text-slate-400 font-medium">
                  Triggered by &bull; <span className="font-bold text-slate-700">{log.userName}</span> &bull; <span className="text-slate-600">{log.userRole}</span>
                </span>
              </div>
            </div>

          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">
            No system logging logs recorded matching selected filter query options.
          </div>
        )}
      </div>

      {/* Controls para sa Pagination (Pahina) */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4 mt-6 gap-3">
          <span className="text-xs text-slate-450 font-semibold">
            Showing <strong className="text-slate-750">{startIndex + 1}</strong> to{' '}
            <strong className="text-slate-750">{Math.min(startIndex + ITEMS_PER_PAGE, filteredLogs.length)}</strong> of{' '}
            <strong className="text-slate-750">{filteredLogs.length}</strong> logs
          </span>

          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <button
              disabled={activePage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-md transition ${
                activePage === 1 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700 shadow-sm'
              }`}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pNum = idx + 1;
              return (
                <button
                  key={pNum}
                  onClick={() => setCurrentPage(pNum)}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-md transition ${
                    activePage === pNum
                      ? 'bg-[#7c191e] text-white shadow-md'
                      : 'bg-slate-105 hover:bg-slate-200 text-slate-700 border border-slate-200/50'
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              disabled={activePage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-md transition ${
                activePage === totalPages 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700 shadow-sm'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
