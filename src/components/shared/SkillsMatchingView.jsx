import { useState } from 'react';
import { Check, AlertTriangle, BookOpen, Sparkles, Brain, Cpu, RefreshCw, Copy, CheckCheck } from 'lucide-react';
import { getGeminiMatch } from '../../services/api';

/**
 * SkillsMatchingView Component
 * @description View component na naghahambing ng mga kasanayan ng mga graduates (alumni skills) 
 laban sa mga kinakailangan ng mga trabaho (job posting requirements) upang makita ang skill gaps
 at magbigay ng dynamic na rekomendasyon para sa pagpapabuti ng kurikulum.
 */
export default function SkillsMatchingView({ jobPostings = [], alumniList = [], activeUser, employers = [] }) {
  const isEmployer = activeUser?.role === 'Employer';

  // AI-related states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiError, setAiError] = useState('');
  const [copied, setCopied] = useState(false);

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
  // Helper function para kalkulahin ang kabuuang taon ng karanasan ng alumni
  const calculateAlumniExperience = (al) => {
    let totalYears = 0;

    // 1. Kalkulahin mula sa careerHistory timeline
    if (al.careerHistory && Array.isArray(al.careerHistory)) {
      al.careerHistory.forEach(item => {
        const yearsStr = (item.years || '').toString().trim();
        if (!yearsStr) return;

        // Halimbawa: "2020 - 2022"
        const rangeMatch = yearsStr.match(/(\d{4})\s*-\s*(\d{4})/);
        if (rangeMatch) {
          const start = parseInt(rangeMatch[1]);
          const end = parseInt(rangeMatch[2]);
          totalYears += Math.max(1, end - start);
          return;
        }

        // Halimbawa: "2020 - Present" o "2020 - Kasalukuyan"
        const presentMatch = yearsStr.match(/(\d{4})\s*-\s*(Present|Kasalukuyan|Current)/i);
        if (presentMatch) {
          const start = parseInt(presentMatch[1]);
          const currentYear = new Date().getFullYear();
          totalYears += Math.max(1, currentYear - start);
          return;
        }

        // Halimbawa: "2 years", "3 taon", "1.5 yrs"
        const numYearsMatch = yearsStr.match(/(\d+(?:\.\d+)?)\s*(?:year|yr|taon|ann)/i);
        if (numYearsMatch) {
          totalYears += parseFloat(numYearsMatch[1]);
          return;
        }

        // Kung numero lang ang nilagay (hal. "3")
        const justNum = parseFloat(yearsStr);
        if (!isNaN(justNum) && justNum < 50) {
          totalYears += justNum;
          return;
        }
      });
    }

    // 2. Kalkulahin mula sa kasalukuyang trabaho
    if (al.employmentStatus === 'Employed' || al.employmentStatus === 'Self-Employed') {
      if (al.jobStartYear) {
        const start = parseInt(al.jobStartYear);
        if (!isNaN(start) && start > 1900) {
          const currentYear = new Date().getFullYear();
          totalYears += Math.max(1, currentYear - start);
        } else {
          totalYears += 1;
        }
      } else {
        totalYears += 1;
      }
    }

    return Math.round(totalYears * 10) / 10;
  };

  // Algoritmo sa Pagtutugma (Match Algorithm): tinitingnan kung gaano karaming kasanayan ng alumni ang tumutugma sa requirements ng activeJob
  const matchedAlumni = registeredAlumniList.map(al => {
    // 1. Required Skills Overlap & Score (60% weight)
    const overlappingSkills = al.skills.filter(skill => 
      reqSkills.some(req => req.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(req.toLowerCase()))
    );
    const skillsScore = reqSkills.length > 0 
      ? Math.round((overlappingSkills.length / reqSkills.length) * 100) 
      : 100;

    // 2. Preferred Skills Overlap & Score (20% weight)
    const prefSkills = activeJob?.preferredSkills || [];
    const overlappingPreferredSkills = al.skills.filter(skill =>
      prefSkills.some(pref => pref.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(pref.toLowerCase()))
    );
    const preferredSkillsScore = prefSkills.length > 0
      ? Math.round((overlappingPreferredSkills.length / prefSkills.length) * 100)
      : 100;

    // 3. Years of Experience Match & Score (20% weight)
    const alumnusExperience = calculateAlumniExperience(al);
    const experienceRequired = activeJob?.experienceRequired || 0;
    const experienceScore = experienceRequired > 0
      ? Math.min(100, Math.round((alumnusExperience / experienceRequired) * 100))
      : 100;

    // 4. Combined Weighted Fit Score
    const hybridScore = Math.round((skillsScore * 0.6) + (preferredSkillsScore * 0.2) + (experienceScore * 0.2));

    return {
      alumni: al,
      overlappingSkills,
      overlappingPreferredSkills,
      skillsScore,
      preferredSkillsScore,
      experienceScore,
      alumnusExperience,
      experienceRequired,
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

  // --- DYNAMIC AI FUNCTIONS FOR GEMINI INTEGRATION ---
  const formatBoldText = (inputText) => {
    if (!inputText) return '';
    const parts = inputText.split('**');
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} className="font-extrabold text-slate-900 bg-amber-50 px-0.5 rounded">{part}</strong>;
      }
      return part;
    });
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const cleanLine = line.trim();
      if (cleanLine.startsWith('### ')) {
        return <h4 key={idx} className="text-[11.5px] font-extrabold text-slate-800 uppercase tracking-wide mt-4 mb-2 flex items-center gap-1.5"><Brain className="w-3.5 h-3.5 text-[#1e4620]" /> {cleanLine.replace('### ', '')}</h4>;
      }
      if (cleanLine.startsWith('## ')) {
        return <h3 key={idx} className="text-xs font-extrabold text-[#1e4620] uppercase mt-5 mb-3 border-b border-slate-200 pb-1.5 flex items-center gap-2"><Cpu className="w-4 h-4 text-[#7c191e]" /> {cleanLine.replace('## ', '')}</h3>;
      }
      if (cleanLine.startsWith('# ')) {
        return <h2 key={idx} className="text-sm font-black text-[#7c191e] mt-6 mb-3 flex items-center gap-2 border-b-2 border-[#7c191e]/20 pb-2">{cleanLine.replace('# ', '')}</h2>;
      }
      if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
        return <li key={idx} className="text-[11px] text-slate-650 ml-5 list-disc mb-1.5 leading-relaxed">{formatBoldText(cleanLine.substring(2))}</li>;
      }
      if (cleanLine === '') {
        return <div key={idx} className="h-2.5" />;
      }
      return <p key={idx} className="text-[11px] text-slate-600 leading-relaxed mb-2.5">{formatBoldText(cleanLine)}</p>;
    });
  };

  const handleGenerateAiAnalysis = async () => {
    if (!activeJob) return;
    setAiLoading(true);
    setAiError('');
    setAiResult('');
    try {
      const token = sessionStorage.getItem('careerpath_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      // Ipasa ang kasalukuyang trabaho at ang top matching alumni
      const data = await getGeminiMatch(activeJob, matchedAlumni.slice(0, 5), headers);
      if (data.success) {
        setAiResult(data.analysis);
      } else {
        setAiError(data.message || 'Hindi nakabuo ng AI analysis ang server.');
      }
    } catch (err) {
      console.error(err);
      if (err.message && err.message.includes('API_KEY_MISSING')) {
        setAiError('API_KEY_MISSING');
      } else {
        setAiError(err.message || 'Hindi makakonekta sa AI server. Subukan muli mamaya.');
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Banner ng pahina */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Interactive Hybrid Skills Overlap &amp; Talent Analytics</h2>
          <p className="text-[11px] text-slate-405 mt-0.5">Comparing graduate competencies and program specialization with vacancy credentials required by partner firms.</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto shrink-0">
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

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Prerequisite Competencies Required:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {reqSkills.map(req => (
                      <span key={req} className="px-2.5 py-1 bg-[#1e4620]/10 text-[#1e4620] rounded-md font-bold text-[10px] border border-[#1e4620]/20">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                {activeJob.preferredSkills && activeJob.preferredSkills.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Preferred Competencies Required:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {activeJob.preferredSkills.map(pref => (
                        <span key={pref} className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-md font-bold text-[10px] border border-amber-200">
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Experience Required:</span>
                  <span className="text-xs font-bold text-slate-700 block mt-1">
                    {activeJob.experienceRequired && activeJob.experienceRequired > 0 
                      ? `${activeJob.experienceRequired} ${activeJob.experienceRequired <= 1 ? 'Year' : 'Years'} of Experience` 
                      : 'Entry-Level / No Experience Required'}
                  </span>
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
              <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-extrabold">Weighted Match Score Engine</span>
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
                          {item.overlappingPreferredSkills && item.overlappingPreferredSkills.map(ops => (
                            <span key={ops} className="px-2 py-0.5 bg-amber-500/10 text-amber-800 border border-amber-300 rounded text-[9px] font-bold flex items-center gap-1" title="Preferred Skill Match">
                              <Check className="w-2.5 h-2.5" /> {ops} (Pref)
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Score metric sa kanang panig (Hybrid Placement Fit score at mabilisang aksyon) */}
                    <div className="text-left sm:text-right space-y-1 sm:self-center shrink-0 min-w-[120px]">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Weighted Match Score</div>
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
                        Required Match: <strong className="text-slate-700">{item.skillsScore}%</strong><br/>
                        Preferred Match: <strong className="text-slate-700">{item.preferredSkillsScore}%</strong><br/>
                        Experience Match: <strong className="text-slate-700">{item.experienceScore}%</strong> <span className="text-[8px] text-slate-400">({item.alumnusExperience} yr{item.alumnusExperience === 1 ? '' : 's'} vs {item.experienceRequired} yr{item.experienceRequired === 1 ? '' : 's'} req)</span>
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

        {/* Gemini AI Match & Syllabus Analytics Card */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/60 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-800">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  Gemini AI Talent Match &amp; Curriculum Gap Optimizer
                </h3>
                <p className="text-[11px] text-slate-405 mt-0.5">
                  Advanced machine learning analysis of competencies, syllabus fit, and hiring readiness.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[9px] bg-emerald-600/10 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-500/20">
                Gemini 2.5 Flash
              </span>
            </div>
          </div>

          {!aiLoading && !aiResult && !aiError && (
            <div className="text-center py-6 space-y-4">
              <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed font-sans">
                Nais mo bang makita ang mas malalim na pagsusuri? Gamitin ang Gemini AI upang ma-optimize ang kurikulum ng Batanes State College at awtomatikong gumawa ng custom interview invites para sa mga alumni.
              </p>
              <button
                onClick={handleGenerateAiAnalysis}
                className="bg-[#1e4620] hover:bg-[#1e4620]/90 text-white font-extrabold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 mx-auto cursor-pointer shadow-sm hover:shadow transition"
              >
                <Sparkles className="w-4 h-4" /> Generate Gemini AI Match Analysis
              </button>
            </div>
          )}

          {aiLoading && (
            <div className="text-center py-10 space-y-3.5">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-semibold animate-pulse font-sans">
                Sinusuri ang profiles ng mga graduates at kinakalkula ang program alignment...
              </p>
            </div>
          )}

          {aiError && (
            <div className="p-4 bg-rose-50 border border-rose-200/50 rounded-lg space-y-3 font-sans">
              <div className="flex gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-800 uppercase">AI Execution Error</h4>
                  {aiError === 'API_KEY_MISSING' ? (
                    <div className="text-[11.5px] text-rose-700 leading-relaxed mt-1 space-y-2">
                      <p>
                        <strong>Nawawala ang Gemini API Key sa server.</strong> Upang paganahin ang Machine Learning features, kailangan mong maglagay ng libreng API key mula sa Google AI Studio.
                      </p>
                      <p className="font-bold text-slate-700">Paano Ayusin:</p>
                      <ol className="list-decimal list-inside text-slate-600 space-y-1">
                        <li>Pumunta sa <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="underline font-bold text-emerald-700 hover:text-emerald-800">Google AI Studio</a> at gumawa ng libreng API Key.</li>
                        <li>Buksan ang <code>.env</code> file sa root directory ng project.</li>
                        <li>Ilagay ang API key sa variable na ito: <code>GEMINI_API_KEY=iyong_api_key</code></li>
                        <li>I-restart ang Express server sa terminal.</li>
                      </ol>
                    </div>
                  ) : (
                    <p className="text-[11px] text-rose-700 leading-relaxed mt-0.5">
                      {aiError}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleGenerateAiAnalysis}
                  className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[10px] px-3.5 py-1.5 rounded-md cursor-pointer transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" /> Retry Generation
                </button>
              </div>
            </div>
          )}

          {aiResult && (
            <div className="space-y-4 font-sans text-left">
              <div className="p-5 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
                <div className="prose prose-slate max-w-none">
                  {renderMarkdown(aiResult)}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleGenerateAiAnalysis}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer font-bold transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-Analyze / Regenerate
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyText}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-1.5"
                  >
                    {copied ? (
                      <>
                        <CheckCheck className="w-4 h-4 text-emerald-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy Analysis Report
                      </>
                    )}
                  </button>
                </div>
              </div>
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
