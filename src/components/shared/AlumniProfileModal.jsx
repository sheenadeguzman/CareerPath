/**
 * @file AlumniProfileModal.jsx
 * @description Modal component na nagpapakita ng komprehensibong detalye ng profile ng napiling graduate.
 * Nagpapakita ng personal details, academic metrics (honors, certificates), CHED-aligned employment parameters
 * (employer, job title, description, monthly income, sector), skills tag inventory, at export trigger.
 */

import React from 'react';
import { X, User as UserIcon, Calendar, Mail, Phone, Home, GraduationCap, Briefcase, Award, FileText, CheckCircle2 } from 'lucide-react';

export default function AlumniProfileModal({ alumni, onClose }) {
  
  /**
   * Helper function para mag-render ng custom styled badge na kumakatawan sa kasalukuyang employment status.
   * @param {string} status - Katayuan ng trabaho (Employment status).
   * @returns {JSX.Element}
   */
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Employed':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-200">Employed</span>;
      case 'Self-Employed':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-200">Self-Employed</span>;
      case 'Freelance':
        return <span className="bg-violet-100 text-violet-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-violet-200">Freelance</span>;
      case 'Further Studies':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-200">Further Studies</span>;
      case 'Unemployed':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-rose-200">Unemployed</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in font-sans">
      
      {/* Container Panel ng Modal */}
      <div className="bg-white w-full max-w-3xl h-full max-h-[90vh] md:h-[650px] shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-slate-100 relative">
        
        {/* ========================================================== */}
        {/* FIXED HEADER: Nakapako sa itaas na may Title at Close button */}
        {/* ========================================================== */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1e4620]/10 rounded-full flex items-center justify-center text-[#1e4620]">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 tracking-wide uppercase">Alumni Credentials</h2>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Tracer reference: {alumni.studentId}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition cursor-pointer"
            title="Dismiss detail pane"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================== */}
        {/* SCROLLABLE BODY: Mga detalye ng Profile (pwedeng i-scroll)  */}
        {/* ========================================================== */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quick View Card sa Header ng Profile */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {alumni.avatar ? (
                <img 
                  src={alumni.avatar} 
                  alt="Alumnus Profile" 
                  className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-emerald-500/50 shrink-0" 
                />
              ) : (
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center text-2xl font-bold font-sans uppercase">
                  {alumni.firstName.charAt(0)}{alumni.lastName.charAt(0)}
                </div>
              )}
              <div className="space-y-1">
                <div className="text-base font-extrabold text-slate-800">{alumni.name}</div>
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#1e4620]" />
                  {alumni.program} &bull; Class {alumni.yearGraduated}
                </div>
              </div>
            </div>
            <div className="space-y-1.5 self-start sm:self-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-left sm:text-right">Employment Coordinate</div>
              <div className="sm:text-right">{renderStatusBadge(alumni.employmentStatus)}</div>
            </div>
          </div>

          {/* Tracker bar para sa Profile Completeness */}
          <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/50 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-[#1e4620] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />Profile Completeness
              </span>
              <span className="text-emerald-700">{alumni.profileCompleteness}% Verified</span>
            </div>
            <div className="h-2.5 w-full bg-slate-105 rounded-full overflow-hidden border border-slate-200/50">
              <div 
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${alumni.profileCompleteness}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">Complete profiles help Batanes State College satisfy its tracer evaluation standards.</p>
          </div>

          {/* Breakdown ng mga pangunahing demographic variables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Kaliwang Column: Pangkalahatan at Personal na Impormasyon */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-[#1e4620] uppercase tracking-wider border-b border-light pb-1 flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5" /> Personal Information
              </h3>
              
              <div className="space-y-2.5 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400 w-20 shrink-0">Email:</span>
                  <span className="text-slate-800 truncate select-all">{alumni.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400 w-20 shrink-0">Phone:</span>
                  <span className="text-slate-800">{alumni.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400 w-20 shrink-0">Birth Date:</span>
                  <span className="text-slate-800">{alumni.dateOfBirth || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400 w-20 shrink-0">Gender:</span>
                  <span className="text-slate-800">{alumni.gender}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400 w-20 shrink-0">Civil Status:</span>
                  <span className="text-slate-800">{alumni.civilStatus}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Home className="w-4 h-4 text-slate-400 mt-0.5" />
                  <span className="text-slate-400 w-20 shrink-0">Home Address:</span>
                  <span className="text-slate-800">{alumni.address || 'Basco, Batanes'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-20 shrink-0">Location:</span>
                  <span className="text-slate-800 font-bold">{alumni.locationRegion || 'Local (Batanes)'}</span>
                </div>
              </div>
            </div>

            {/* Kanang Column: Impormasyon sa Edukasyon */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-[#1e4620] uppercase tracking-wider border-b border-light pb-1 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> Educational Background
              </h3>
              
              <div className="space-y-2.5 text-xs text-slate-600 font-medium">
                <div>
                  <span className="block text-[#1e4620] font-bold">College Program:</span>
                  <span className="block text-slate-800 font-semibold">{alumni.program}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-2 border border-slate-100 rounded-lg">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Batch Year</span>
                    <span className="block text-slate-800 font-semibold">{alumni.yearGraduated}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Honors Distinction</span>
                    <span className="block text-amber-600 font-bold">{alumni.honors || 'None'}</span>
                  </div>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" /> Professional Certification / Board Exams:
                  </span>
                  <span className="block text-slate-800 bg-amber-50 border border-amber-200/50 p-2 rounded-lg mt-1 font-semibold">
                    {alumni.professionalExamPassed || 'None Listed'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          <hr className="border-slate-100" />

          {/* Ibabang section: Employment Parameters (Mga detalye ng Trabaho) */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-[#1e4620] uppercase tracking-wider border-b border-light pb-2 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" /> Tracer Employment Parameters (Standard Aligned)
            </h3>

            {alumni.employmentStatus === 'Unemployed' ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500 font-medium border border-slate-100">
                This graduate is currently listed as <span className="font-bold text-rose-600">Unemployed</span>. 
                Keep updating profile details upon employment transitions.
              </div>
            ) : (
              <div className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-bold block mb-1">Company / Institution</span>
                    <span className="text-slate-800 font-bold flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {alumni.employerName || 'N/A'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-bold block mb-1">Official Job Title</span>
                    <span className="text-slate-800 font-bold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-slate-400" /> {alumni.jobTitle || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="block font-bold text-slate-400 text-xs mb-1.5">Official Job Description</span>
                  <p className="text-slate-700 text-xs leading-relaxed font-semibold">
                     {alumni.jobDescription || 'None provided. Ask graduate to submit update.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
                  <div className="p-2 border border-slate-100 rounded bg-white">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Employment Type</span>
                    <span className="font-semibold text-slate-800">{alumni.employmentType || 'Permanent'}</span>
                  </div>
                  <div className="p-2 border border-slate-100 rounded bg-white">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Sector Category</span>
                    <span className="font-semibold text-slate-800">{alumni.sector || 'Private'}</span>
                  </div>
                  <div className="p-2 border border-slate-100 rounded bg-white">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Monthly Income</span>
                    <span className="font-semibold text-[#1e4620]">{alumni.monthlyIncome || 'M 20,000-30,000'}</span>
                  </div>
                  <div className="p-2 border border-slate-100 rounded bg-white">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Industry / Field</span>
                    <span className="font-semibold text-slate-800">{alumni.jobIndustry || 'N/A'}</span>
                  </div>
                  <div className="p-2 border border-slate-100 rounded bg-white">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Is related to Degree</span>
                    <span className="font-semibold text-slate-800">{alumni.jobRelatedToCourse || 'Yes'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Career Path Timeline History */}
          <div className="space-y-3 font-sans">
            <span className="block text-xs font-bold text-[#1e4620] uppercase tracking-wider">Career Path Timeline History</span>
            <div className="space-y-2">
              {alumni.careerHistory && alumni.careerHistory.length > 0 ? (
                alumni.careerHistory.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs font-sans">
                    <div>
                      <span className="block font-bold text-slate-800">{item.title}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{item.company}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold font-mono">{item.years}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No historical career timeline events recorded.</span>
              )}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Listahan ng mga Skill Tags */}
          <div className="space-y-3">
            <span className="block text-xs font-bold text-[#1e4620] uppercase tracking-wider">Skills Inventory Tag Pack</span>
            <div className="flex flex-wrap gap-1.5">
              {alumni.skills && alumni.skills.length > 0 ? (
                alumni.skills.map((skill) => (
                  <span key={skill} className="px-2.5 py-1 bg-amber-500/10 text-amber-800 border border-amber-300 rounded-full font-bold text-[10px]">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No skills registered on the tracer index.</span>
              )}
            </div>
          </div>

        </div>

        {/* ========================================================== */}
        {/* FIXED FOOTER: Action bar na nakapako sa ibaba ng modal      */}
        {/* ========================================================== */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between z-10 font-sans">
          <span className="text-[10px] text-slate-400 font-bold">
            Last Updated Tracer Index: {new Date(alumni.lastUpdated).toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-350 text-slate-700 font-bold text-xs rounded-lg transition cursor-pointer"
            >
              Close
            </button>
            <button 
              onClick={() => {
                alert('Downloading BSC standard tracer analytics report...');
              }}
              className="px-4 py-2 bg-[#1e4620] hover:bg-emerald-950 text-white font-bold text-xs rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" /> Export PDF Summary
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
