import React from 'react';
import { 
  Briefcase, 
  Building, 
  Users 
} from 'lucide-react';

export default function EmploymentDirectory({ filteredAlumni = [] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-4 shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
        <div className="flex items-center gap-1.5">
          <Users className="w-4.5 h-4.5 text-[#7c191e]" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Filtered Graduates Directory</span>
        </div>
        <span className="text-[10px] bg-slate-100 text-slate-655 px-2 py-0.5 rounded font-extrabold uppercase">
          Showing {filteredAlumni.length} {filteredAlumni.length <= 1 ? 'Result' : 'Results'}
        </span>
      </div>

      {filteredAlumni.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-xs font-semibold space-y-2">
          <Briefcase className="w-10 h-10 text-slate-200 mx-auto animate-pulse" />
          <p className="uppercase tracking-widest text-[10px] text-slate-500">No matching tracer entries found</p>
          <p className="text-[9.5px] text-slate-400 font-medium">Try adjusting your filters or search keywords above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlumni.map(al => {
            const isEmp = al.isRegistered && ['Employed', 'Freelance', 'Self-Employed'].includes(al.employmentStatus);
            const initials = `${al.firstName?.[0] || ''}${al.lastName?.[0] || ''}`.toUpperCase();
            
            return (
              <div 
                key={al.studentId}
                className="p-4 rounded-xl border border-slate-200/60 bg-slate-50/40 flex gap-3.5 items-start hover:border-[#7c191e]/20 transition-all duration-300 shadow-3xs"
              >
                {/* Initial Avatar circle */}
                <div className="w-10 h-10 rounded-xl bg-[#7c191e]/10 border border-[#7c191e]/15 flex items-center justify-center shrink-0 text-xs font-extrabold text-[#7c191e] select-none uppercase">
                  {initials || 'GR'}
                </div>

                {/* Graduate Details */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-extrabold text-slate-800 text-xs block truncate leading-tight">
                        {al.lastName}, {al.firstName} {al.middleName || ''} {al.suffix || ''}
                      </span>
                      
                      {/* Alignment Badge */}
                      {isEmp && (
                        <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-extrabold uppercase shrink-0 border ${
                          al.jobRelatedToCourse === 'Yes' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                            : al.jobRelatedToCourse === 'Partially'
                            ? 'bg-amber-50 text-amber-900 border-amber-100'
                            : 'bg-rose-50 text-rose-800 border-rose-100'
                        }`}>
                          {al.jobRelatedToCourse === 'Yes' ? 'Course Related' : al.jobRelatedToCourse === 'Partially' ? 'Partially Aligned' : 'Non-Related'}
                        </span>
                      )}
                    </div>
                    <span className="block text-[9.5px] text-slate-400 font-bold uppercase mt-0.5">
                      {al.program} &middot; Class of {al.yearGraduated}
                    </span>
                  </div>

                  {/* Employment block info */}
                  {isEmp ? (
                    <div className="bg-white border border-slate-100 rounded-lg p-2 text-[10.5px] font-semibold text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-800 font-bold">{al.jobTitle}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{al.employerName}</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 pt-1 border-t border-slate-50/50 mt-1">
                        <span>WAGE: <strong className="text-slate-700">{al.monthlyIncome || 'N/A'}</strong></span>
                        <span>LANDED: <strong className="text-slate-700 uppercase">{al.timeToFirstJob || 'N/A'}</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-100/60 border border-slate-200/40 rounded-lg p-2 text-[9.5px] font-extrabold text-slate-400 uppercase text-center py-2.5">
                      {al.isRegistered && al.employmentStatus === 'Further Studies' 
                        ? 'Further Studies / Grad School Program'
                        : 'Currently Seeking Employment / No Active Records'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
