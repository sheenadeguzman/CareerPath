import { useState } from 'react';
import { Check, AlertTriangle, BookOpen, Printer, FileText, Download, ChevronDown, FileSpreadsheet, Mail, Phone, Copy, CheckCircle2, X } from 'lucide-react';
import { exportToPDF } from '../../utils/pdfExport';

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
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [contactCandidate, setContactCandidate] = useState(null);
  const [copiedStatus, setCopiedStatus] = useState(false);

  // Helper function para sa pag-export ng skills matching table patungong CSV
  const handleExportCSV = () => {
    if (!activeJob) return;
    let csvHeader = 'No.,Graduate_Name,Program,Year_Graduated,Skills_Overlap_Score,Program_Alignment_Score,Hybrid_Fit_Score\n';
    let csvContent = matchedAlumni.map((item, idx) => {
      return `${idx + 1},"${item.alumni.name}","${item.alumni.program}","${item.alumni.yearGraduated}",${item.skillsScore},${item.programAlignment},${item.hybridScore}`;
    }).join('\n');

    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BSC_Skills_Matching_Report_${activeJob.jobTitle.replace(/\s+/g, '_')}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Kung ang selectedJobID ay wala sa filtered na listahan (hal. kapag nagpalit ng role), gamitin ang una sa filtered list
  const hasSelectedJob = filteredJobPostings.some(j => j.id === selectedJobID);
  const activeJob = hasSelectedJob
    ? filteredJobPostings.find(j => j.id === selectedJobID)
    : filteredJobPostings[0];

  const reqSkills = activeJob ? activeJob.requirements : [];

  // Fina-filter ang mga alumni na may profile data o skills para sa gagawing pagtutugma
  const registeredAlumniList = alumniList.filter(al => (al.profileCompleteness || 0) > 0 || (al.skills && al.skills.length > 0) || al.isRegistered);

  // Helper function para sa Department / Course Compatibility Score (Academic Program Alignment)
  const calculateProgramAlignment = (alumniProgram, jobTitle, jobDescription, jobRequirements = []) => {
    const prog = (alumniProgram || '').toLowerCase();
    const title = (jobTitle || '').toLowerCase();
    const desc = (jobDescription || '').toLowerCase();
    const reqs = Array.isArray(jobRequirements) ? jobRequirements.join(' ').toLowerCase() : '';
    const combinedJobText = `${title} ${desc} ${reqs}`;

    // Helper para sa whole-word boundary matching (iwas sa false match tulad ng 'it' sa loob ng 'visitors')
    const hasWord = (text, term) => {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
    };

    // 1. Tiyak na Degree / Program Targeting (Specific Program Acronyms & Program Names)
    // Kapag tahasang binanggit ang kurso (tulad ng "BSTM Graduate", "BSIT", "BSHM", atbp.)
    const isTargetingBSTM = hasWord(combinedJobText, 'bstm') || combinedJobText.includes('tourism management');
    const isTargetingBSHM = hasWord(combinedJobText, 'bshm') || combinedJobText.includes('hospitality management');
    const isTargetingBSIT = hasWord(combinedJobText, 'bsit') || combinedJobText.includes('information technology');
    const isTargetingBSA = hasWord(combinedJobText, 'bsa') || combinedJobText.includes('bachelor of science in agriculture');
    const isTargetingBEED = hasWord(combinedJobText, 'beed') || combinedJobText.includes('elementary education');
    const isTargetingBSED = hasWord(combinedJobText, 'bsed') || combinedJobText.includes('secondary education');
    const isTargetingBSInT = combinedJobText.includes('industrial technology');

    // Katangian ng kurso ng nagtapos (Alumnus Course Mapping)
    const isGradTourism = prog.includes('tourism') || hasWord(prog, 'bstm');
    const isGradHospitality = prog.includes('hospitality') || prog.includes('hotel') || hasWord(prog, 'bshm');
    const isGradIT = prog.includes('information technology') || (hasWord(prog, 'ict') && !prog.includes('industrial')) || hasWord(prog, 'bsit');
    const isGradAgri = prog.includes('agriculture') || hasWord(prog, 'bsa');
    const isGradElemEduc = prog.includes('elementary education') || hasWord(prog, 'beed');
    const isGradSecEduc = prog.includes('secondary education') || hasWord(prog, 'bsed');
    const isGradEduc = isGradElemEduc || isGradSecEduc || prog.includes('education') || prog.includes('teacher');
    const isGradTech = prog.includes('industrial technology');

    // Kung may tiyak na kursong hinahanap sa job posting:
    if (isTargetingBSTM) {
      if (isGradTourism) return 100;
      if (isGradHospitality) return 70; // Katabing kurso sa iisang departamento (HTM)
      return 10;
    }
    if (isTargetingBSHM) {
      if (isGradHospitality) return 100;
      if (isGradTourism) return 70; // Katabing kurso sa iisang departamento (HTM)
      return 10;
    }
    if (isTargetingBSIT) {
      if (isGradIT) return 100;
      if (isGradTech) return 40; // Kaugnay na technical field
      return 10;
    }
    if (isTargetingBSA) {
      if (isGradAgri) return 100;
      return 10;
    }
    if (isTargetingBEED) {
      if (isGradElemEduc) return 100;
      if (isGradSecEduc) return 80; // Parehong Education
      return 10;
    }
    if (isTargetingBSED) {
      if (isGradSecEduc) return 100;
      if (isGradElemEduc) return 80; // Parehong Education
      return 10;
    }
    if (isTargetingBSInT) {
      if (isGradTech) return 100;
      if (isGradIT) return 40;
      return 10;
    }

    // 2. Department-level Keyword Frequency Analysis (Weighted Keyword Scoring)
    // Kapag walang tahasang acronym, sinusuri ang mga domain keywords gamit ang word boundary
    const deptKeywords = {
      htm: [
        'tourism', 'tourist', 'tour', 'tours', 'hotel', 'resort', 'travel',
        'hospitality', 'homestay', 'restaurant', 'dining', 'catering',
        'culinary', 'chef', 'barista', 'front desk', 'guest', 'visitors', 'lodging'
      ],
      ict: [
        'developer', 'programmer', 'software', 'web', 'database', 'coding',
        'network', 'systems', 'frontend', 'backend', 'fullstack', 'computer',
        'tech support', 'cybersecurity', 'cloud', 'application', 'hardware'
      ],
      educ: [
        'teacher', 'instructor', 'educator', 'school', 'teaching', 'pedagogy',
        'curriculum', 'classroom', 'lesson', 'academic'
      ],
      agri: [
        'farm', 'farming', 'crop', 'crops', 'pest', 'plant', 'organic',
        'soil', 'agriculture', 'livestock', 'agriculturist', 'harvest', 'agronomy'
      ],
      tech: [
        'circuit', 'electronic', 'electronics', 'technician', 'soldering',
        'machinery', 'repair', 'wiring', 'automotive', 'mechanic', 'maintenance', 'pneumatics'
      ]
    };

    const deptScores = { htm: 0, ict: 0, educ: 0, agri: 0, tech: 0 };
    Object.entries(deptKeywords).forEach(([dept, keywords]) => {
      keywords.forEach(kw => {
        if (hasWord(combinedJobText, kw)) {
          deptScores[dept] += 1;
        }
      });
    });

    let requiredDept = null;
    let maxScore = 0;
    Object.entries(deptScores).forEach(([dept, score]) => {
      if (score > maxScore) {
        maxScore = score;
        requiredDept = dept;
      }
    });

    // Kung walang tiyak na departamento o pantay sa lahat (hal. general job posting)
    if (!requiredDept || maxScore === 0) return 100;

    const isGradHTM = isGradTourism || isGradHospitality;

    if (requiredDept === 'ict' && isGradIT) return 100;
    if (requiredDept === 'educ' && isGradEduc) return 100;
    if (requiredDept === 'htm' && isGradHTM) return 100;
    if (requiredDept === 'agri' && isGradAgri) return 100;
    if (requiredDept === 'tech' && isGradTech) return 100;

    // Closely related departments
    if (requiredDept === 'ict' && isGradTech) return 40;
    if (requiredDept === 'tech' && isGradIT) return 40;
    if (requiredDept === 'htm' && isGradEduc) return 20;

    return 10; // Baseline fit score para sa magkaibang larangan
  };

  // Algoritmo sa Pagtutugma (Match Algorithm): tinitingnan kung gaano karaming kasanayan ng alumni ang tumutugma sa requirements ng activeJob
  const matchedAlumni = registeredAlumniList.map(al => {
    // Fina-filter ang mga overlapping skills gamit ang case-insensitive comparison
    const overlappingSkills = (al.skills || []).filter(skill => 
      reqSkills.some(req => req.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(req.toLowerCase()))
    );

    // 1. Skills Overlap Score (60% weight)
    const skillsScore = reqSkills.length > 0 
      ? Math.round((overlappingSkills.length / reqSkills.length) * 100) 
      : 0;

    // 2. Academic Program Alignment Score (40% weight)
    const programAlignment = activeJob 
      ? calculateProgramAlignment(al.program, activeJob.jobTitle, activeJob.description, activeJob.requirements) 
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
          <p className="text-[11px] text-slate-405 mt-0.5">Comparing graduate competencies and program specialization with vacancy credentials required by partner agencies.</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-3 shrink-0 w-full md:w-auto">
          {/* Print & Export PDF buttons */}
          <div className="flex items-center gap-2 no-print w-full md:w-auto justify-start md:justify-end">
            {/* Print button */}
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-[11px] rounded-lg transition inline-flex items-center gap-1.5 uppercase cursor-pointer shadow-3xs"
            >
              <Printer className="w-4 h-4 text-[#7c191e]" /> Print
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="px-3.5 py-2 bg-[#7c191e] hover:bg-[#7c191e]/90 text-white font-extrabold text-[11px] rounded-lg transition inline-flex items-center gap-1.5 uppercase shadow-3xs cursor-pointer select-none"
              >
                <Download className="w-4 h-4" /> Export <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${exportDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {exportDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setExportDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 animate-fade-in text-slate-750 text-xs font-extrabold font-sans">
                    <button
                      onClick={() => {
                        setExportDropdownOpen(false);
                        handleExportCSV();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 transition cursor-pointer text-slate-700 text-xs font-bold"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export as CSV
                    </button>

                    <button
                      onClick={() => {
                        setExportDropdownOpen(false);
                        exportToPDF('main-content-stage', 'BSC_Skills_Matching_Report.pdf');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 transition cursor-pointer text-slate-700 text-xs font-bold"
                    >
                      <FileText className="w-4 h-4 text-rose-600" /> Export as PDF
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">Select Target Vacancy:</label>
            <select
              value={selectedJobID}
              onChange={(e) => setSelectedJobID(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold p-2.5 rounded-lg text-slate-800 focus:bg-white cursor-pointer w-full sm:w-72 md:w-80 lg:w-96 truncate"
            >
              {filteredJobPostings.map(job => (
                <option key={job.id} value={job.id}>{job.jobTitle} ({job.employerName})</option>
              ))}
            </select>
          </div>
        </div>
    </div>

      {activeJob ? (
        <div className="space-y-6">
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
                              item.hybridScore >= 70 ? 'bg-emerald-600' : item.hybridScore >= 40 ? 'bg-amber-500' : 'bg-slate-400'
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
                          setContactCandidate({ alumni: item.alumni, hybridScore: item.hybridScore, overlappingSkills: item.overlappingSkills });
                          setCopiedStatus(false);
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
      </div>
    ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-100 p-6 text-slate-400 text-xs font-semibold">
          {isEmployer 
            ? "You have no active job vacancies. Please post a vacancy under 'Job Vacancies' first to run skills matching."
            : "Please add partner job bulletins and vacancies to calculate skills overlaps."}
        </div>
      )}

      {/* Opportunity Invitation / Contact Candidate Modal */}
      {contactCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1e4620]/10 flex items-center justify-center text-[#1e4620]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 leading-tight">Opportunity Invitation</h3>
                  <p className="text-[11px] text-slate-500">Contact candidate for target vacancy</p>
                </div>
              </div>
              <button 
                onClick={() => setContactCandidate(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Candidate Info Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{contactCandidate.alumni.name}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {contactCandidate.alumni.program} &bull; Class of {contactCandidate.alumni.yearGraduated}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    ID: {contactCandidate.alumni.studentId}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Match Score</span>
                  <span className="text-sm font-extrabold text-emerald-600">
                    {contactCandidate.hybridScore}%
                  </span>
                </div>
              </div>

              {/* Contact Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a 
                  href={contactCandidate.alumni.email ? `mailto:${contactCandidate.alumni.email}` : undefined}
                  className="p-2.5 rounded-lg border border-slate-200/70 hover:border-slate-300 flex items-center gap-2 text-slate-700 bg-white hover:bg-slate-50 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-[#1e4620] shrink-0" />
                  <span className="truncate text-[11px] font-medium select-all">
                    {contactCandidate.alumni.email || 'No email on record'}
                  </span>
                </a>
                <a 
                  href={contactCandidate.alumni.phone || contactCandidate.alumni.contactNumber ? `tel:${contactCandidate.alumni.phone || contactCandidate.alumni.contactNumber}` : undefined}
                  className="p-2.5 rounded-lg border border-slate-200/70 hover:border-slate-300 flex items-center gap-2 text-slate-700 bg-white hover:bg-slate-50 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-[#7c191e] shrink-0" />
                  <span className="truncate text-[11px] font-medium select-all">
                    {contactCandidate.alumni.phone || contactCandidate.alumni.contactNumber || 'No phone on record'}
                  </span>
                </a>
              </div>

              {/* Message Preview */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Invitation Message Preview
                </label>
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 text-slate-700 text-[11.5px] leading-relaxed whitespace-pre-wrap font-sans select-all max-h-48 overflow-y-auto">
{`Dear ${contactCandidate.alumni.name},

Greetings from Batanes State College!

Based on your academic profile and credentials recorded on the BSC CareerPath portal, your skills match the open vacancy for "${activeJob?.jobTitle}" at ${activeJob?.employerName}.

If you are open to discussing this employment opportunity, please respond to this email or update your profile on the BSC CareerPath portal.

Best regards,
${activeUser?.name || 'Career Placement Office'}
Batanes State College`}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2">
              <button
                onClick={() => {
                  const messageText = `Dear ${contactCandidate.alumni.name},\n\nGreetings from Batanes State College!\n\nBased on your academic profile and credentials recorded on the BSC CareerPath portal, your skills match the open vacancy for "${activeJob?.jobTitle}" at ${activeJob?.employerName}.\n\nIf you are open to discussing this employment opportunity, please respond to this email or update your profile on the BSC CareerPath portal.\n\nBest regards,\n${activeUser?.name || 'Career Placement Office'}\nBatanes State College`;
                  navigator.clipboard.writeText(messageText);
                  setCopiedStatus(true);
                  setTimeout(() => setCopiedStatus(false), 2500);
                }}
                className="w-full sm:w-auto px-4 py-2 border border-slate-200 hover:bg-white text-slate-700 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
              >
                {copiedStatus ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Message</span>
                  </>
                )}
              </button>

              {contactCandidate.alumni.email && (
                <a
                  href={`mailto:${contactCandidate.alumni.email}?subject=${encodeURIComponent(`Career Opportunity: ${activeJob?.jobTitle} at ${activeJob?.employerName}`)}&body=${encodeURIComponent(`Dear ${contactCandidate.alumni.name},\n\nGreetings from Batanes State College!\n\nBased on your academic profile and credentials recorded on the BSC CareerPath portal, your skills match the open vacancy for "${activeJob?.jobTitle}" at ${activeJob?.employerName}.\n\nIf you are open to discussing this employment opportunity, please respond to this email or update your profile on the BSC CareerPath portal.\n\nBest regards,\n${activeUser?.name || 'Career Placement Office'}\nBatanes State College`)}`}
                  className="w-full sm:w-auto px-4 py-2 bg-[#1e4620] hover:bg-[#1e4620]/90 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Open in Mail App</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
