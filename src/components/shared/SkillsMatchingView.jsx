import { useState } from 'react';
import { Check, AlertTriangle, BookOpen } from 'lucide-react';

/**
 * SkillsMatchingView Component
 * @description View component na naghahambing ng mga kasanayan ng mga graduates (alumni skills) 
 laban sa mga kinakailangan ng mga trabaho (job posting requirements) upang makita ang skill gaps
 at magbigay ng dynamic na rekomendasyon para sa pagpapabuti ng kurikulum.
 */
export default function SkillsMatchingView({ jobPostings = [], alumniList = [], activeUser, employers = [] }) {
  const isEmployer = activeUser?.role === 'Employer';

  // NOTE: Hahanapin ang profile ng Employer para makuha ang kumpanya nila.
  const myEmployerProfile = isEmployer
    ? employers.find(e => e.email?.toLowerCase() === activeUser?.email?.toLowerCase())
    : null;
  const myCompanyName = myEmployerProfile?.companyName || '';

  // NOTE: Kapag Employer, sarili nilang job postings lang ang ipapakita para sa skills matching.
  const filteredJobPostings = isEmployer
    ? jobPostings.filter(job => job.employerName?.trim().toLowerCase() === myCompanyName.trim().toLowerCase())
    : jobPostings;

  // State hook para sa ID ng kasalukuyang piniling trabaho (job vacancy)
  const [selectedJobID, setSelectedJobID] = useState(filteredJobPostings[0]?.id || '');
  
  // Kung ang selectedJobID ay wala sa filtered na listahan (hal. kapag nagpalit ng role), gamitin ang una sa filtered list
  const hasSelectedJob = filteredJobPostings.some(j => j.id === selectedJobID);
  const activeJob = hasSelectedJob
    ? filteredJobPostings.find(j => j.id === selectedJobID)
    : filteredJobPostings[0];

  const reqSkills = activeJob ? activeJob.requirements : [];

  // Fina-filter lamang ang mga rehistradong alumni para sa gagawing pagtutugma
  const registeredAlumniList = alumniList.filter(al => al.isRegistered);

  // Helper function para sa Department / Course Compatibility Score (Academic Program Alignment)
  const calculateProgramAlignment = (alumniProgram, jobTitle, jobDescription) => {
    const title = (jobTitle || '').toLowerCase();
    const desc = (jobDescription || '').toLowerCase();
    const prog = (alumniProgram || '').toLowerCase();

    // Define department keywords
    const ictKeywords = ["developer", "programmer", "software", "web", "it", "net", "system", "database", "tech", "programming", "coding", "ict", "computer", "network"];
    const htmKeywords = ["hotel", "tourism", "food", "resort", "guide", "travel", "barista", "chef", "homestay", "restaurant", "hospitality", "cook", "dining", "tour"];
    const educKeywords = ["teacher", "instructor", "educator", "lesson", "school", "secondary", "elementary", "education", "academic", "teaching"];
    const agriKeywords = ["farm", "crop", "pest", "plant", "organic", "farming", "soil", "agriculture", "livestock", "agriculturist"];
    const techKeywords = ["circuit", "electronic", "technician", "soldering", "machinery", "repair", "wiring", "industrial", "automotive", "mechanic", "maintenance"];

    // Check which department keywords are matched in the job title/description
    const matchesICT = ictKeywords.some(kw => title.includes(kw) || desc.includes(kw));
    const matchesHTM = htmKeywords.some(kw => title.includes(kw) || desc.includes(kw));
    const matchesEduc = educKeywords.some(kw => title.includes(kw) || desc.includes(kw));
    const matchesAgri = agriKeywords.some(kw => title.includes(kw) || desc.includes(kw));
    const matchesTech = techKeywords.some(kw => title.includes(kw) || desc.includes(kw));

    // Determine the primary department required by the job
    let requiredDept = null;
    if (matchesICT) requiredDept = 'ict';
    else if (matchesEduc) requiredDept = 'educ';
    else if (matchesHTM) requiredDept = 'htm';
    else if (matchesAgri) requiredDept = 'agri';
    else if (matchesTech) requiredDept = 'tech';

    // If no specific department is matched, default to general compatibility (100%)
    if (!requiredDept) return 100;

    // Check alumnus program
    const isIT = prog.includes("information technology") || prog.includes("ict");
    const isEduc = prog.includes("education") || prog.includes("teacher");
    const isHTM = prog.includes("hospitality") || prog.includes("tourism") || prog.includes("htm");
    const isAgri = prog.includes("agriculture");
    const isTech = prog.includes("industrial technology") || prog.includes("technology");

    if (requiredDept === 'ict' && isIT) return 100;
    if (requiredDept === 'educ' && isEduc) return 100;
    if (requiredDept === 'htm' && isHTM) return 100;
    if (requiredDept === 'agri' && isAgri) return 100;
    if (requiredDept === 'tech' && isTech) return 100;

    // Closely related departments (e.g. BSIT and Industrial Tech)
    if (requiredDept === 'ict' && isTech) return 40;
    if (requiredDept === 'tech' && isIT) return 40;
    if (requiredDept === 'htm' && isEduc) return 20;

    return 10; // Baseline fit score
  };

  // Algoritmo sa Pagtutugma (Match Algorithm): tinitingnan kung gaano karaming kasanayan ng alumni ang tumutugma sa requirements ng activeJob
  const matchedAlumni = registeredAlumniList.map(al => {
    // Fina-filter ang mga overlapping skills gamit ang case-insensitive comparison
    const overlappingSkills = al.skills.filter(skill => 
      reqSkills.some(req => req.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(req.toLowerCase()))
    );

    // 1. Skills Overlap Score (60% weight)
    const skillsScore = reqSkills.length > 0 
      ? Math.round((overlappingSkills.length / reqSkills.length) * 100) 
      : 0;

    // 2. Academic Program Alignment Score (40% weight)
    const programAlignment = activeJob 
      ? calculateProgramAlignment(al.program, activeJob.jobTitle, activeJob.description) 
      : 100;

    // 3. Hybrid Fit Score
    const hybridScore = Math.round((skillsScore * 0.6) + (programAlignment * 0.4));

    return {
      alumni: al,
      overlappingSkills,
      skillsScore,
      programAlignment,
      hybridScore
    };
  }).filter(item => item.skillsScore > 0 || item.hybridScore >= 30) // Pinapakita lamang ang mga alumni na may kahit kaunting overlap o katuturan
    .sort((a, b) => b.hybridScore - a.hybridScore); // Pinagsusunod-sunod mula sa pinakamataas na hybrid score pababa

  // --- BAGONG DYNAMIC FEATURE: Pagsusuri sa Skill-Gap ng Kurikulum ---
  // Kinakalkula ang density o porsyento ng bawat kinakailangang kasanayan sa kabuuang listahan ng rehistradong alumni.
  const totalAlumniInScope = registeredAlumniList.length || 1;
  const skillGapMetrics = reqSkills.map(req => {
    const graduatesWithSkill = registeredAlumniList.filter(al => 
      al.skills && al.skills.some(skill => skill.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(skill.toLowerCase()))
    ).length;

    const representationRate = Math.round((graduatesWithSkill / totalAlumniInScope) * 100);
    const gap = 100 - representationRate;

    return {
      skillName: req,
      graduatesWithSkill,
      representationRate,
      gap,
      priority: gap >= 70 ? 'High Curriculum Priority' : gap >= 40 ? 'Moderate curriculum alignment' : 'Well-represented',
    };
  }).sort((a, b) => b.gap - a.gap); // Inilalabas muna ang may pinakamalalaking gaps sa kurikulum

  return (
    <div className="space-y-6">
      
      {/* Intro Banner ng pahina */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Interactive Hybrid Skills Overlap &amp; Talent Analytics</h2>
          <p className="text-[11px] text-slate-405 mt-0.5">Comparing graduate competencies and program specialization with vacancy credentials required by partner firms.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">Select Target Vacancy:</label>
          <select
            value={selectedJobID}
            onChange={(e) => setSelectedJobID(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold p-2.5 rounded-lg text-slate-800 focus:bg-white cursor-pointer"
          >
            {filteredJobPostings.map(job => (
              <option key={job.id} value={job.id}>{job.jobTitle} ({job.employerName})</option>
            ))}
          </select>
        </div>
      </div>

      {activeJob ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
          
          {/* Card na naglalaman ng deskripsyon ng napiling trabaho (target vacancy) */}
          <div className="space-y-6 lg:col-span-1">
            
            <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 space-y-4">
              <span className="block text-xs font-bold text-[#1e4620] uppercase tracking-wider">Vacancy Criteria</span>
              
              <div className="space-y-3 p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <h3 className="font-extrabold text-[#1e4620] text-sm">{activeJob.jobTitle}</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{activeJob.employerName}</span>
                </div>
                <p className="text-xs text-slate-550 font-medium leading-relaxed">{activeJob.description}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Prerequisite Competencies Required:</span>
                <div className="flex flex-wrap gap-1.5">
                  {reqSkills.map(req => (
                    <span key={req} className="px-2.5 py-1 bg-[#1e4620]/10 text-[#1e4620] rounded-md font-bold text-[10px] border border-[#1e4620]/20">
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card para sa pagsusuri ng Curriculum Skill-Gap base sa napiling bakanteng trabaho */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 space-y-4">
              <div className="flex items-center gap-1.5 border-b border-slate-50 pb-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Syllabus Competency Gaps</span>
              </div>
              <p className="text-[11.5px] text-slate-405 font-medium leading-relaxed">
                Highlights skills demanded by <strong>{activeJob.employerName}</strong> that are underrepresented in your active alumni pool:
              </p>

              <div className="space-y-3 pt-1">
                {skillGapMetrics.map(metric => (
                  <div key={metric.skillName} className="space-y-1">
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="font-extrabold text-[#1e4620]">{metric.skillName}</span>
                      <span className={`font-mono text-[9.5px] font-bold ${
                        metric.gap >= 70 ? 'text-rose-600' : 'text-slate-500'
                      }`}>
                        {metric.gap}% Syllabus Gap
                      </span>
                    </div>

                    <div className="h-2.5 w-full bg-slate-105 rounded-full overflow-hidden border border-slate-200/50 relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${metric.gap >= 70 ? 'bg-rose-500' : 'bg-amber-500'}`}
                        style={{ width: `${metric.gap}%` }}
                      />
                    </div>
                    
                    {/* NOTE: Dynamic pluralization ng grad/grads ( <= 1 ay 'grad' ) alinsunod sa bagong instruction ng user. */}
                    <span className="text-[8.5px] text-slate-405 block leading-none pt-0.5">
                      Only {metric.graduatesWithSkill} {metric.graduatesWithSkill <= 1 ? 'grad' : 'grads'} out of {totalAlumniInScope} {totalAlumniInScope <= 1 ? 'grad' : 'grads'} have this on record (Priority: <strong>{metric.priority}</strong>)
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100/50 flex gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-[9px] text-amber-800 font-semibold leading-snug">
                  <strong>Advice:</strong> Integrating these missing skills directly into Batanes State College courses will significantly align our curriculum with active industry requirements and enhance graduate employability.
                </span>
              </div>
            </div>

          </div>

          {/* Listahan ng mga katugmang talent o graduates na qualified sa trabaho base sa profile match */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-slate-100 p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Matching Graduates Profile Pool ({matchedAlumni.length})</span>
              <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-extrabold">Hybrid Match Score Engine</span>
            </div>

            {matchedAlumni.length === 0 ? (
              <div className="text-center py-12 text-slate-405 text-xs font-semibold leading-relaxed">
                No active graduates currently overlap with this specific skill-set sheet. <br />
                Try posting dynamic skill-set queries or update alumni profiles.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {matchedAlumni.map((item) => (
                  <div key={item.alumni.studentId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-50/20">
                    
                    <div className="flex items-start gap-4">
                      {item.alumni.avatar ? (
                        <img 
                          src={item.alumni.avatar} 
                          alt="Alumni Avatar" 
                          className="w-12 h-12 rounded-full object-cover shrink-0 mt-0.5" 
                        />
                      ) : (
                        <div className="w-12 h-12 bg-[#1e4620]/10 rounded-full flex items-center justify-center text-xs font-extrabold text-[#1e4620] uppercase shrink-0 mt-0.5">
                          {item.alumni.firstName.charAt(0)}{item.alumni.lastName.charAt(0)}
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <div>
                          <span className="block text-sm font-extrabold text-slate-800">{item.alumni.name}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-505 px-1.5 py-0.5 rounded font-mono select-all font-bold">
                            {item.alumni.studentId}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Graduated: <span className="font-bold text-[#7c191e]">{item.alumni.program}</span> &bull; {item.alumni.yearGraduated}
                        </p>
                        
                        {/* Pagpapakita ng mga katugmang kasanayan (overlapping skills) */}
                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {item.overlappingSkills.map(os => (
                            <span key={os} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-800 border border-emerald-300 rounded text-[9px] font-bold flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" /> {os}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Score metric sa kanang panig (Hybrid Placement Fit score at mabilisang aksyon) */}
                    <div className="text-left sm:text-right space-y-1 sm:self-center shrink-0 min-w-[120px]">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Hybrid Fit Score</div>
                      <div className="flex items-center gap-2 justify-start sm:justify-end">
                        <span className={`text-sm font-extrabold ${
                          item.hybridScore >= 70 ? 'text-emerald-600' : item.hybridScore >= 40 ? 'text-amber-500' : 'text-slate-500'
                        }`}>
                          {item.hybridScore}%
                        </span>
                        <div className="w-16 h-2 bg-slate-105 rounded-full overflow-hidden inline-block border border-slate-200/50">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.hybridScore >= 70 ? 'bg-emerald-650' : item.hybridScore >= 40 ? 'bg-amber-500' : 'bg-slate-400'
                            }`} 
                            style={{ width: `${item.hybridScore}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-[9px] text-slate-450 leading-tight">
                        Skills Overlap: <strong className="text-slate-700">{item.skillsScore}%</strong><br/>
                        Program Fit: <strong className="text-slate-700">{item.programAlignment}%</strong>
                      </div>
                      <button 
                        onClick={() => {
                          alert(`Initiating administrative contact invite with ${item.alumni.name} for ${activeJob.jobTitle}...`);
                        }}
                        className="text-[10px] text-[#1e4620] hover:underline block font-bold cursor-pointer mt-1 sm:ml-auto"
                      >
                        Contact Talented Grad &rarr;
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-100 p-6 text-slate-400 text-xs font-semibold">
          {isEmployer 
            ? "You have no active job vacancies. Please post a vacancy under 'Job Vacancies' first to run skills matching."
            : "Please add partner job bulletins and vacancies to calculate skills overlaps."}
        </div>
      )}
    </div>
  );
}
