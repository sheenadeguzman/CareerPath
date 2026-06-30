/**
 * @file AdminAlumniListView.jsx
 * @description Nag-re-render ng search, filter, at table lists para sa lahat ng registered alumni.
 * Nag-o-offer ng quick action triggers para sa manu-manong registration, bulk file imports, nudge emails,
 * pagsusuri ng detalye ng profile, at limitadong pagbura ng profile.
 */

import React, { useState } from 'react';
import { Search, Eye, Upload, PlusCircle, GraduationCap, Trash2, X } from 'lucide-react';
import { BSC_PROGRAMS, DEPARTMENT_TO_PROGRAMS } from '../../../bscData';

export default function AdminAlumniListView({ 
  alumniList, 
  activeUser, 
  onTriggerEmail, 
  setViewingAlumni, 
  setShowImportModal, 
  setIsAddingAlumnus,
  onDeleteAlumni
}) {
  // Mga lokal na state para sa pagsala (filter) ng mga alumni records
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // State pointer para sa alumnus na kukumpirmahin ang pagbura sa modal
  const [deletingAlumni, setDeletingAlumni] = useState(null);

  // Logic para sa pagsala (filtering) ng alumni registries base sa search criteria
  const filteredAlumni = alumniList.filter(al => {
    if (!al.program) return false;
    const matchesSearch = al.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          al.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProgram = selectedProgram === 'All' || 
                           al.program.toLowerCase() === selectedProgram.toLowerCase() ||
                           al.program.toLowerCase().includes(selectedProgram.toLowerCase()) ||
                           selectedProgram.toLowerCase().includes(al.program.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || 
                          (selectedStatus === 'Unregistered' && !al.isRegistered) ||
                          (selectedStatus === 'Registered' && al.isRegistered) ||
                          (al.isRegistered && al.employmentStatus === selectedStatus);
    
    // Pagsuri sa role ng Chairperson: limitahan ang pagtingin sa mga graduate lang ng kaniyang program/department
    let matchesChair = true;
    if (activeUser.role === 'Department Chairperson' && activeUser.program) {
      const chairProg = activeUser.program;
      const normalizedAl = al.program.toLowerCase();
      const normalizedChair = chairProg.toLowerCase();
      if (normalizedAl === normalizedChair || normalizedAl.includes(normalizedChair) || normalizedChair.includes(normalizedAl)) {
        matchesChair = true;
      } else {
        const allowed = DEPARTMENT_TO_PROGRAMS[chairProg] || [];
        matchesChair = allowed.some(allowedProg => {
          const normalizedAllowed = allowedProg.toLowerCase();
          return normalizedAl.includes(normalizedAllowed) || normalizedAllowed.includes(normalizedAl);
        });
      }
    }

    return matchesSearch && matchesProgram && matchesStatus && matchesChair;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Bar para sa mga Filter Controls sa Itaas */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch gap-2">
          
          {/* Input box para sa paghahanap (search) */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              id="search-alumni"
              type="text"
              placeholder="Search graduates name, student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-55 focus:bg-white border border-slate-200 rounded-lg pl-9 p-2 text-xs font-semibold focus:outline-none focus:border-[#1e4620]"
            />
          </div>

          {/* Dropdown menu para sa tinapos na program */}
          <select
            id="filter-program"
            value={activeUser.role === 'Department Chairperson' ? (activeUser.program || 'BS Information Technology') : selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            disabled={activeUser.role === 'Department Chairperson'}
            className="bg-slate-55 border border-slate-200 rounded-lg p-2 text-xs font-semibold disabled:bg-slate-100 disabled:text-slate-550 disabled:cursor-not-allowed cursor-pointer focus:outline-none"
          >
            {activeUser.role === 'Department Chairperson' ? (
              <option value={activeUser.program}>{activeUser.program}</option>
            ) : (
              <>
                <option value="All">All Programs</option>
                {BSC_PROGRAMS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </>
            )}
          </select>

          {/* Dropdown menu para sa tracer employment status */}
          <select
            id="filter-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-55 border border-slate-200 rounded-lg p-2 text-xs font-semibold cursor-pointer focus:outline-none"
          >
            <option value="All">All Status</option>
            <option value="Registered">Registered</option>
            <option value="Unregistered">Unregistered</option>
            <option value="Employed">Employed</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Freelance">Freelance</option>
            <option value="Self-Employed">Self-Employed</option>
            <option value="Further Studies">Further Studies</option>
          </select>
        </div>

        {/* Mga quick action button na naa-access lamang ng mga Administrator */}
        {activeUser.role === 'Administrator' && (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            
            {/* Pag-import ng listahan (roster) */}
            <button
              id="btn-import-alumni-opener"
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-lg transition inline-flex items-center gap-1.5 uppercase shrink-0 cursor-pointer"
              title="Bulk register from CSV/Excel rosters"
            >
              <Upload className="w-4 h-4" /> Import CSV
            </button>
            
            {/* Manu-manong pagrehistro ng record */}
            <button
              id="btn-add-alumnus"
              onClick={() => setIsAddingAlumnus(true)}
              className="px-4 py-2 bg-[#1e4620] hover:bg-emerald-950 text-white font-extrabold text-xs rounded-lg transition inline-flex items-center gap-1.5 uppercase shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Register Graduate
            </button>
          </div>
        )}
      </div>

      {/* Table para sa listahan ng mga Alumni (Roster Registry Table) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden font-sans">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Showing {filteredAlumni.length} alumni coordinates
          </span>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 capitalize tracking-wider bg-slate-100/50">
                <th className="p-3.5 pl-6">Student ID / Name</th>
                <th className="p-3.5">Degree Program</th>
                <th className="p-3.5">Grad Year</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Progress</th>
                <th className="p-3.5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredAlumni.map((al) => (
                <tr key={al.studentId} className="hover:bg-slate-50/50 transition">
                  <td className="p-3.5 pl-6">
                    <div className="flex items-center gap-3">
                      {al.avatar ? (
                        <img 
                          src={al.avatar} 
                          alt="Avatar" 
                          className="w-8 h-8 rounded-full object-cover shrink-0" 
                        />
                      ) : (
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs text-[#1e4620] font-bold uppercase">
                          {al.firstName.charAt(0)}{al.lastName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <span className="block font-bold text-slate-800">{al.name}</span>
                        <span className="block text-[10px] text-slate-400 font-mono select-all">{al.studentId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 truncate max-w-[200px]" title={al.program}>{al.program}</td>
                  <td className="p-3.5 font-bold text-slate-600">{al.yearGraduated}</td>
                  <td className="p-3.5">
                    {!al.isRegistered ? (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-full font-bold text-[10px] uppercase">Unregistered</span>
                    ) : al.employmentStatus === 'Employed' ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px] uppercase">Employed</span>
                    ) : al.employmentStatus === 'Self-Employed' ? (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full font-bold text-[10px] uppercase">Self-Employed</span>
                    ) : al.employmentStatus === 'Freelance' ? (
                      <span className="px-2 py-0.5 bg-violet-100 text-violet-800 border border-violet-200 rounded-full font-bold text-[10px] uppercase">Freelance</span>
                    ) : al.employmentStatus === 'Further Studies' ? (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 rounded-full font-bold text-[10px] uppercase">Further Studies</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-850 border border-rose-200 rounded-full font-bold text-[10px] uppercase">Unemployed</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[10px]">{al.profileCompleteness}%</span>
                      <div className="w-16 h-2 bg-slate-105 rounded-full overflow-hidden inline-block shrink-0 border border-slate-200/50">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${al.profileCompleteness > 80 ? 'bg-emerald-600' : 'bg-amber-500'}`} 
                          style={{ width: `${al.profileCompleteness}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 pr-6 text-right space-x-1">
                    
                    {/* Nagpapadala ng mabilis na email notification kung mababa sa threshold ang profile completion */}
                    {al.profileCompleteness < 80 && onTriggerEmail && (
                      <button
                        onClick={() => onTriggerEmail(al.studentId)}
                        className="p-1 px-2.5 bg-amber-500/10 text-amber-700 rounded hover:bg-amber-500/20 text-[10px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                        title="Dispatch completeness nudge"
                      >
                        Nudge Email
                      </button>
                    )}
                    
                    {/* Trigger button para sa detalye ng modal */}
                    <button
                      onClick={() => setViewingAlumni(al)}
                      className="p-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition inline-flex items-center gap-1 opacity-90 cursor-pointer"
                      title="View all variables details"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    
                    {/* Button para sa limitadong pagbura ng profile */}
                    {onDeleteAlumni && (activeUser.role === 'Administrator' || activeUser.role === 'Department Chairperson') && (
                      <button
                        onClick={() => setDeletingAlumni(al)}
                        className="p-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition inline-flex items-center gap-1 opacity-90 cursor-pointer"
                        title="Delete alumnus profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAlumni.length === 0 && (
            <div className="text-center py-12 text-slate-400 font-medium text-xs">
              No matching alumni profiles found matching current trace query coordinates.
            </div>
          )}
        </div>
      </div>

      {/* Modal dialog para sa kumpirmasyon ng pagbura (Deletion Confirmation Modal) */}
      {deletingAlumni && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden transform scale-100 transition-all duration-300">
            
            {/* Header ng Modal */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/40">
              <div className="flex items-center gap-2.5 text-rose-700">
                <Trash2 className="w-5 h-5" />
                <h3 className="text-xs font-black uppercase tracking-wider">Confirm Deletion</h3>
              </div>
              <button 
                onClick={() => setDeletingAlumni(null)}
                className="text-slate-400 hover:text-slate-650 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Katawan ng Modal (Modal Body) */}
            <div className="p-5 space-y-4">
              <div className="text-xs font-medium text-slate-650 leading-relaxed space-y-2.5">
                <p>
                  You are about to permanently delete the alumnus profile of <span className="font-extrabold text-slate-800">{deletingAlumni.name}</span> (ID: <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-700">{deletingAlumni.studentId}</span>).
                </p>
                <p className="text-[10px] text-rose-705 font-bold bg-rose-50 p-3 rounded-xl border border-rose-100/70">
                  ⚠️ WARNING: This will also delete their login credentials. This action is irreversible.
                </p>
              </div>
            </div>

            {/* Footer para sa mga Aksyon ng Modal */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingAlumni(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-705 font-extrabold text-xs rounded-lg uppercase tracking-wide transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteAlumni(deletingAlumni.studentId);
                  setDeletingAlumni(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-lg uppercase tracking-wide transition cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
