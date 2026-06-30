/**
 * @file EmployerDashboard.jsx
 * @description Dashboard view na customized para sa mga Partner Employer. Nagpapakita ng recruitment stats,
 * kabilang ang bilang ng mga aktibong vacancy, hiring slots na kailangan, bilang ng mga natanggap na BSC alumni,
 * naisumiteng corporate appraisals, at listahan ng mga inilathalang career profiles.
 */

import React from 'react';
import { 
  Building, 
  Briefcase, 
  UserCheck, 
  GraduationCap, 
  Award, 
  PlusCircle, 
  ChevronRight 
} from 'lucide-react';

export default function EmployerDashboard({ 
  employers = [], 
  activeUser, 
  jobPostings = [], 
  alumni = [], 
  feedbacks = [], 
  onNavigate 
}) {
  
  // Hinahanap ang katugmang corporate employer profile na tumutugma sa active login email
  const myEmployerProfile = employers.find(
    e => e.email.toLowerCase() === activeUser.email.toLowerCase()
  );
  const myCompanyName = myEmployerProfile?.companyName || 'Enterprise Partner';

  // Sinasala ang mga job posting na inilunsad ng partikular na kumpanyang ito
  const myJobs = jobPostings.filter(job => job.employerName.trim().toLowerCase() === myCompanyName.trim().toLowerCase());
  const myActiveJobsCount = myJobs.filter(job => job.status === 'Open').length;
  const myTotalPendingSlots = myJobs.filter(job => job.status === 'Open').reduce((acc, curr) => acc + curr.slots, 0);

  // Sinasala ang mga alumni graduates na nakalistang nagtatrabaho sa kumpanyang ito
  const myEmployedAlumni = alumni.filter(
    a => a.employerName.trim().toLowerCase() === myCompanyName.trim().toLowerCase() && a.employmentStatus === 'Employed'
  );

  // Sinasala ang kabuuang feedback reviews na isinumite ng employer na ito
  const myFeedbacksCount = feedbacks.filter(fb => {
    const fbCompany = (fb.companyName || '').trim().toLowerCase();
    const myComp = myCompanyName.toLowerCase().trim();
    return (myComp && fbCompany === myComp) || fb.submittedBy?.toLowerCase().includes(activeUser.name.toLowerCase());
  }).length;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Banner para sa pagbati sa Header ng employer */}
      <div className="bg-[#7c191e]/5 border border-[#7c191e]/15 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Welcome, Partner! &mdash; {myCompanyName}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Batanes State College Corporate Dashboard &mdash; Manage job positions and submit standard Tracer evaluations.
          </p>
        </div>
      </div>

      {/* Row para sa mga Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card para sa mga Aktibong Job Openings */}
        {/* NOTE: Ginawa nating <= 1 para maging singular din ang 0 open postings alinsunod sa bagong requirement ng user. */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">My Active Vacancies</span>
            <div className="text-2xl font-bold text-[#7c191e]">
              {myActiveJobsCount} open {myActiveJobsCount <= 1 ? 'posting' : 'postings'}
            </div>
          </div>
          <div className="p-3 bg-[#7c191e]/10 text-[#7c191e] rounded-lg">
            <Briefcase className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Card para sa kabuuang bilang ng kinakailangang recruits */}
        {/* NOTE: Ginawa nating <= 1 para maging singular din ang 0 slots alinsunod sa bagong requirement ng user. */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Total Recruits Needed</span>
            <div className="text-2xl font-bold text-slate-800">
              {myTotalPendingSlots} {myTotalPendingSlots <= 1 ? 'Slot' : 'Slots'}
            </div>
          </div>
          <div className="p-3 bg-[#7c191e]/10 text-[#7c191e] rounded-lg">
            <UserCheck className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Card para sa bilang ng mga natanggap na BSC Alumni */}
        {/* NOTE: Ginawa nating <= 1 para maging singular din ang 0 grads alinsunod sa bagong requirement ng user. */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">BSC Alumni Employed</span>
            <div className="text-2xl font-bold text-slate-800">
              {myEmployedAlumni.length} {myEmployedAlumni.length <= 1 ? 'Grad' : 'Grads'}
            </div>
          </div>
          <div className="p-3 bg-[#7c191e]/10 text-[#7c191e] rounded-lg">
            <GraduationCap className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Kaliwang column para sa mga shortcut at quick action triggers */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-4 shadow-xs">
            <span className="block text-xs font-bold text-[#7c191e] uppercase tracking-wider">Hiring &amp; Placement Center</span>

            <div className="grid grid-cols-1 gap-2.5">
              
              {/* Shortcut para mag-publish ng bagong vacancy */}
              <button 
                onClick={() => onNavigate('Job Postings')}
                className="w-full text-left p-3 rounded-lg border border-slate-105 hover:border-[#7c191e]/25 hover:bg-[#7c191e]/5 bg-slate-50/50 flex items-center justify-between group transition-all text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[#7c191e]/10 text-[#7c191e] rounded">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">Publish New Career Positions</span>
                    <span className="text-[10px] text-slate-400 font-medium">Launch vacancies on BSC board instantly</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-455 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Shortcut para i-audit o tingnan ang skills alignment ng mga graduates */}
              <button 
                onClick={() => onNavigate('Skills Match')}
                className="w-full text-left p-3 rounded-lg border border-slate-105 hover:border-[#7c191e]/25 hover:bg-[#7c191e]/5 bg-slate-50/50 flex items-center justify-between group transition-all text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[#7c191e]/10 text-[#7c191e] rounded">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">Audit Graduate Asset Skills</span>
                    <span className="text-[10px] text-slate-400 font-medium">Locate suitable candidates based on certifications</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-455 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Impormasyon o paalala para sa Employment Alignment Advocacy */}
          <div className="bg-[#7c191e]/5 rounded-xl border border-[#7c191e]/15 p-5 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <Building className="w-4.5 h-4.5 text-[#7c191e]" />
              <span className="text-xs font-extrabold text-[#7c191e] uppercase tracking-wider">Employment Alignment Advocacy</span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              As a registered partner enterprise of Batanes State College, you play a major role in employing BSC graduates and aligning job qualifications with academic programs. Thank you for your active partnership!
            </p>
          </div>
        </div>

        {/* Kanang column para sa spotlight ng mga inilathalang Job Vacancy ng kumpanya */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-100 p-5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-slate-50 pb-2">
            <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider">Our Published Job Profiles</span>
            <button 
              onClick={() => onNavigate('Job Postings')}
              className="text-[10px] font-bold text-[#7c191e] hover:underline cursor-pointer"
            >
              Go to Vacancies
            </button>
          </div>

          {myJobs.length === 0 ? (
            <div className="text-center py-20 text-slate-400 space-y-2">
              <Briefcase className="w-10 h-10 text-slate-200 mx-auto" />
              <p className="text-xs font-bold uppercase text-slate-500">No vacancies launched yet</p>
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Create and publish roles in the vacancies module to receive applications from BSC matching graduates!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myJobs.slice(0, 4).map(job => (
                <div key={job.id} className="p-3.5 bg-slate-55 border border-slate-105 rounded-lg text-xs font-semibold space-y-2">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="font-extrabold text-[#7c191e] text-xs block">{job.jobTitle}</span>
                      <span className="text-[10px] text-slate-400 inline-block mt-0.5">
                        Type &bull; <span className="text-slate-650 font-bold">{job.employmentType}</span>
                      </span>
                    </div>

                    <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase shrink-0 ${
                      job.status === 'Open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 pt-1 border-t border-slate-105">
                    <span>Slots: <span className="text-[#7c191e] font-bold">{job.slots} required</span></span>
                    <span>&bull;</span>
                    <span>Salary: <span className="text-slate-600 font-bold">{job.salaryRange}</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
