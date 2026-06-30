/**
 * @file AlumniDashboard.jsx
 * @description Dashboard view para sa mga Alumni users. Nagpapakita ng customized profile metrics,
 * completeness indicators para sa career path, listahan ng recommended o matched job postings (naka-scope
 * sa academic program at skills catalog ng graduate), quality rating averages, action shortcuts, at survey alerts.
 */

import React from 'react';
import { 
  GraduationCap, 
  CheckSquare, 
  Briefcase, 
  Award, 
  ChevronRight, 
  Building, 
  MapPin 
} from 'lucide-react';

export default function AlumniDashboard({ 
  alumni = [], 
  activeUser, 
  jobPostings = [], 
  feedbacks = [], 
  onNavigate 
}) {
  
  // Hinahanap ang katugmang alumni profile record na konektado sa credentials ng naka-login na user
  const myAlumni = alumni.find(
    a => a.email.toLowerCase() === activeUser.email.toLowerCase() ||
         a.name.toLowerCase() === activeUser.name.toLowerCase()
  );

  const profileCompleteness = myAlumni?.profileCompleteness || 25;
  const currentStatus = myAlumni?.employmentStatus || 'Not Declared yet';

  /**
   * Sinasala ang mga job posting nang dynamic para tumugma sa college program ng graduate
   * o kaya naman ay sa mga partikular na skill competencies nito.
   */
  const matchedJobs = jobPostings.filter(job => {
    if (job.status !== 'Open') return false;
    const titleLower = job.jobTitle.toLowerCase();
    const descLower = job.description.toLowerCase();
    
    if (!myAlumni) return true; // I-default sa match all kapag pumalya ang profile check
    
    // Tinitingnan ang mga partikular na program affiliations ng alumnus gamit ang bagong opisyal na degree names at fallbacks
    const isIT = myAlumni.program === 'Bachelor of Science in Information Technology' || myAlumni.program === 'BS Information Technology';
    const isHM = myAlumni.program === 'Bachelor of Science in Hospitality Management' || myAlumni.program === 'BS Hospitality Management';
    const isEduc = myAlumni.program === 'Bachelor of Elementary Education' || myAlumni.program === 'Bachelor of Secondary Education' || myAlumni.program === 'BS Elementary Education';
    const isAgri = myAlumni.program === 'Bachelor of Science in Agriculture' || myAlumni.program === 'BS Agriculture';
    const isTourism = myAlumni.program === 'Bachelor of Science in Tourism Management' || myAlumni.program === 'BS Tourism Management';
    const isIndTech = myAlumni.program === 'Bachelor of Science in Industrial Technology' || myAlumni.program === 'BS Industrial Technology';
    
    if (isIT && (titleLower.includes('tech') || titleLower.includes('it') || titleLower.includes('developer') || titleLower.includes('programmer') || titleLower.includes('network') || titleLower.includes('system') || descLower.includes('software') || descLower.includes('web'))) return true;
    if (isHM && (titleLower.includes('hotel') || titleLower.includes('hospitality') || titleLower.includes('chef') || titleLower.includes('restaurant') || titleLower.includes('service') || descLower.includes('hospitality') || titleLower.includes('kitchen') || titleLower.includes('cook'))) return true;
    if (isEduc && (titleLower.includes('teacher') || titleLower.includes('instructor') || titleLower.includes('school') || titleLower.includes('education') || titleLower.includes('tutor') || titleLower.includes('professor'))) return true;
    if (isAgri && (titleLower.includes('agri') || titleLower.includes('farm') || titleLower.includes('crop') || titleLower.includes('plant') || titleLower.includes('vet') || descLower.includes('agriculture') || titleLower.includes('soil') || titleLower.includes('livestock'))) return true;
    if (isTourism && (titleLower.includes('tour') || titleLower.includes('travel') || titleLower.includes('flight') || titleLower.includes('resort') || titleLower.includes('guide') || descLower.includes('tourism'))) return true;
    if (isIndTech && (titleLower.includes('industrial') || titleLower.includes('machine') || titleLower.includes('operator') || titleLower.includes('electric') || titleLower.includes('tech') || descLower.includes('factory') || titleLower.includes('welder') || titleLower.includes('mechanic'))) return true;
    
    // Fallback matching logic gamit ang mga skill tags
    const hasSkillMatch = (myAlumni.skills || []).some(skill => 
      titleLower.includes(skill.toLowerCase()) || descLower.includes(skill.toLowerCase())
    );
    return hasSkillMatch;
  });

  // Bilang ng mga feedback submissions ng alumnus para sa kurikulum
  const myStudentId = myAlumni?.studentId || '';
  const myFeedbacksCount = feedbacks.filter(fb => fb.alumniStudentId === myStudentId).length;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Welcome Banner block para sa pagbati sa user */}
      <div className="bg-[#7c191e]/5 border border-[#7c191e]/15 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Mabuhay, {activeUser.name.split(' ')[0]}! Welcome to your Career Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Batanes State College Tracer Portal &mdash; Let's monitor your employment progress and match your skill sets.
          </p>
        </div>
      </div>

      {/* Row para sa mga pangunahing metric cards ng alumnus */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card para sa kasalukuyang dineklarang Tracer Career Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Tracer Career Status</span>
            <div className="text-lg font-bold text-slate-800 truncate max-w-[150px]" title={currentStatus}>{currentStatus}</div>
          </div>
          <div className="p-3 bg-[#7c191e]/10 text-[#7c191e] rounded-lg">
            <GraduationCap className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Indicators at progress bar para sa Profile Completeness */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between shadow-xs">
          <div className="space-y-1 w-full mr-2">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Profile Completeness</span>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-slate-800">{profileCompleteness}%</div>
              <div className="flex-1 max-w-[80px] bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/40">
                <div className="bg-[#7c191e] h-full rounded-full transition-all duration-500" style={{ width: `${profileCompleteness}%` }} />
              </div>
            </div>
          </div>
          <div className="p-3 bg-[#7c191e]/10 text-[#7c191e] rounded-lg shrink-0">
            <CheckSquare className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Bilang ng mga natagpuang katugmang Career Vacancy */}
        {/* NOTE: Ginawa nating <= 1 para maging singular din ang 0 vacancies alinsunod sa bagong requirement ng user. */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Matched Careers</span>
            <div className="text-2xl font-bold text-slate-800">
              {matchedJobs.length} {matchedJobs.length <= 1 ? 'Vacancy' : 'Vacancies'}
            </div>
          </div>
          <div className="p-3 bg-[#7c191e]/10 text-[#7c191e] rounded-lg">
            <Briefcase className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Bilang ng Curriculum Feedback submissions */}
        <div 
          onClick={() => onNavigate('Curriculum Feedback')}
          className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between shadow-xs cursor-pointer hover:border-[#7c191e]/20 transition-all"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">My Curriculum Reviews</span>
            <div className="text-2xl font-bold text-slate-800">{myFeedbacksCount} Submitted</div>
          </div>
          <div className="p-3 bg-[#7c191e]/10 text-[#7c191e] rounded-lg">
            <Award className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Kaliwang column para sa Quick Actions Portal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-4 shadow-xs">
            <span className="block text-xs font-bold text-[#7c191e] uppercase tracking-wider">Quick Actions Portal</span>
            
            <div className="grid grid-cols-1 gap-2.5">
              
              {/* Shortcut papunta sa Intake Tracer Sheet / Profile */}
              <button 
                onClick={() => onNavigate('My Profile')}
                className="w-full text-left p-3 rounded-lg border border-slate-105 hover:border-[#7c191e]/25 hover:bg-[#7c191e]/5 bg-slate-50/50 flex items-center justify-between group transition-all text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[#7c191e]/10 text-[#7c191e] rounded">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">Update My Intake Tracer Sheet</span>
                    <span className="text-[10px] text-slate-400 font-medium">Keep coordinates and employment records fresh</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-455 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Shortcut papunta sa Job Postings / Vacancies */}
              <button 
                onClick={() => onNavigate('Job Postings')}
                className="w-full text-left p-3 rounded-lg border border-slate-105 hover:border-[#7c191e]/25 hover:bg-[#7c191e]/5 bg-slate-50/50 flex items-center justify-between group transition-all text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[#7c191e]/10 text-[#7c191e] rounded">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">Search Active Career Vacancies</span>
                    <span className="text-[10px] text-slate-400 font-medium">Apply to jobs that fit your preferences</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-455 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Shortcut papunta sa Skills Matching module */}
              <button 
                onClick={() => onNavigate('Skills Match')}
                className="w-full text-left p-3 rounded-lg border border-slate-105 hover:border-[#7c191e]/25 hover:bg-[#7c191e]/5 bg-slate-50/50 flex items-center justify-between group transition-all text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[#7c191e]/10 text-[#7c191e] rounded">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">Compare Core Skills Match</span>
                    <span className="text-[10px] text-slate-400 font-medium">See direct alignments with corporate demand</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-455 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Shortcut papunta sa Curriculum Feedback page */}
              <button 
                onClick={() => onNavigate('Curriculum Feedback')}
                className="w-full text-left p-3 rounded-lg border border-slate-105 hover:border-[#7c191e]/25 hover:bg-[#7c191e]/5 bg-slate-50/50 flex items-center justify-between group transition-all text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[#7c191e]/10 text-[#7c191e] rounded">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">Submit Curriculum Feedback</span>
                    <span className="text-[10px] text-slate-400 font-medium">Evaluate curriculum relevance and suggest updates</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-455 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Impormasyon at shortcut para sa institutional tracer surveys */}
          <div className="bg-[#7c191e]/5 rounded-xl border border-[#7c191e]/15 p-5 space-y-3.5">
            <div className="flex items-center gap-2">
              <Building className="w-4.5 h-4.5 text-[#7c191e]" />
              <span className="text-xs font-extrabold text-[#7c191e] uppercase tracking-wider">Academic Tracer Inquiries</span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              BSC conducts yearly institutional tracer surveys to assess curriculum compliance, course design, and post-grad career paths. Your answers directly shape standard class models!
            </p>
            <button 
              onClick={() => onNavigate('Surveys')}
              className="w-full py-2.5 bg-[#7c191e] text-white hover:bg-[#7c191e]/90 transition-all rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1 cursor-pointer select-none"
            >
              Go to Surveys Center <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Kanang column para sa listahan ng mga katugmang Job Positions */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-100 p-5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-slate-50 pb-2">
            <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider">Curated Job Positions for You</span>
            <button 
              onClick={() => onNavigate('Job Postings')}
              className="text-[10px] font-bold text-[#7c191e] hover:underline cursor-pointer"
            >
              View Career Board
            </button>
          </div>

          {matchedJobs.length === 0 ? (
            <div className="text-center py-20 text-slate-400 space-y-2">
              <Briefcase className="w-10 h-10 text-slate-200 mx-auto" />
              <p className="text-xs font-bold uppercase text-slate-500">No active postings matching {myAlumni?.program || 'your degree'}</p>
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Explore all active entries on our job vacancy boards under Job Vacancies!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {matchedJobs.slice(0, 3).map(job => (
                <div key={job.id} className="p-3.5 bg-slate-50 hover:bg-slate-50/80 border border-slate-100 rounded-lg group transition-all text-xs font-semibold space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-extrabold text-slate-800 group-hover:text-[#7c191e] transition-colors block text-xs">{job.jobTitle}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold mt-0.5">
                        <Building className="w-3.5 h-3.5 inline text-[#cca43b]" /> {job.employerName}
                      </span>
                    </div>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase tracking-wide shrink-0">
                      {job.slots} Slots Left
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {job.location}
                    </span>
                    <span>&bull;</span>
                    <span className="bg-slate-100 px-1.5 py-0.2 rounded font-mono text-slate-600 font-bold">
                      {job.salaryRange}
                    </span>
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
