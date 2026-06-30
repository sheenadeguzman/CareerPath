/**
 * @file ChairpersonDashboard.jsx
 * @description Dashboard view na limitado para sa mga Department Chairperson. Nililimitahan nito ang lahat ng records
 * (alumni registries, employment percentages, feedback comments) sa academic program department ng chairperson.
 * Naglalaman din ito ng mga interactive SVG graphs, status legends, at logs.
 */

import React, { useState } from 'react';
import { 
  GraduationCap, 
  BarChart, 
  Briefcase, 
  Award, 
  ChevronRight, 
  ArrowUpRight, 
  PlusCircle, 
  FileText,
  Printer
} from 'lucide-react';
import { DEPARTMENT_TO_PROGRAMS } from '../../../bscData';

export default function ChairpersonDashboard({ 
  alumni = [], 
  activeUser, 
  jobPostings = [], 
  feedbacks = [], 
  onNavigate 
}) {
  // Nililimitahan ang criteria ng departamento base sa program profile ng aktibong chairperson.
  // Gagamit ng dynamic mapping (DEPARTMENT_TO_PROGRAMS) para masakop ang maramihang programs ng kaniyang department.
  const chairProgram = activeUser?.program || 'Information and Communication Technology Department';
  
  // Sinasala ang global list ng alumni para isama LANG ang mga graduate sa ilalim ng department ng chairperson
  const deptAlumni = alumni.filter(a => {
    if (!a.program) return false;
    const normalizedAl = a.program.toLowerCase();
    const normalizedChair = chairProgram.toLowerCase();
    if (normalizedAl === normalizedChair || normalizedAl.includes(normalizedChair) || normalizedChair.includes(normalizedAl)) {
      return true;
    }
    const allowed = DEPARTMENT_TO_PROGRAMS[chairProgram] || [];
    return allowed.some(allowedProg => {
      const normalizedAllowed = allowedProg.toLowerCase();
      return normalizedAl.includes(normalizedAllowed) || normalizedAllowed.includes(normalizedAl);
    });
  });

  // Mga state hooks para sa interactivity ng graphs at filters
  const [hoveredDeptSegment, setHoveredDeptSegment] = useState(null); // Aktibong segment sa SVG pie/donut chart kapag tinapatan ng cursor
  const [tooltip, setTooltip] = useState(null); // Mga coordinate para sa tooltip overlay
  const [selectedYear, setSelectedYear] = useState('All'); // Filter para sa taon ng pagtatapos (graduation cohort class year)


  // Dynamic na kinukuha ang mga natatanging graduation years mula sa listahan ng mga graduate ng departamento
  const graduationYears = Array.from(new Set(deptAlumni.map(a => a.yearGraduated.toString()))).sort();

  // Sinasala ang listahan ng alumni ng departamento base sa napiling taon ng pagtatapos
  const filteredDeptAlumni = selectedYear === 'All'
    ? deptAlumni
    : deptAlumni.filter(a => a.yearGraduated.toString() === selectedYear);

  // Kinakalkula ang mga istatistika para sa mga metric cards
  const totalDeptAlumni = filteredDeptAlumni.length;
  const registeredDeptAlumni = filteredDeptAlumni.filter(a => a.isRegistered);
  const totalRegisteredDept = registeredDeptAlumni.length;
  const deptRegistrationRate = totalDeptAlumni > 0 ? ((totalRegisteredDept / totalDeptAlumni) * 100).toFixed(1) : '0';
  const unregisteredDeptAlumni = totalDeptAlumni - totalRegisteredDept;
  
  // Breakdown ng bilang ng may trabaho para sa departamento
  const employedAlumni = registeredDeptAlumni.filter(a => a.employmentStatus === 'Employed').length;
  const freelanceAlumni = registeredDeptAlumni.filter(a => a.employmentStatus === 'Freelance').length;
  const selfEmployedAlumni = registeredDeptAlumni.filter(a => a.employmentStatus === 'Self-Employed').length;
  const furtherStudiesAlumni = registeredDeptAlumni.filter(a => a.employmentStatus === 'Further Studies').length;
  const unemployedAlumni = registeredDeptAlumni.filter(a => a.employmentStatus === 'Unemployed').length;
  
  const employedCount = employedAlumni + freelanceAlumni + selfEmployedAlumni;
  const employmentRate = totalDeptAlumni > 0 ? ((employedCount / totalDeptAlumni) * 100).toFixed(1) : '0';

  // Sinasala ang feedback ng employer na tumutugma sa mga graduate ng program na ito
  const deptFeedbacks = feedbacks.filter(fb => {
    const matchAlum = filteredDeptAlumni.find(a => 
      a.studentId === fb.alumniStudentId || 
      a.name.toLowerCase() === fb.alumniName?.toLowerCase()
    );
    return !!matchAlum;
  });

  const averageRatingVal = deptFeedbacks.length > 0
    ? (deptFeedbacks.reduce((acc, curr) => acc + (curr.rating || 5), 0) / deptFeedbacks.length).toFixed(1)
    : 'N/A';

  // Binibilang ang mga aktibong trabaho na tumutugma sa criteria ng program ng departamento
  const matchedJobs = jobPostings.filter(job => {
    if (job.status !== 'Open') return false;
    const titleLower = job.jobTitle.toLowerCase();
    const descLower = job.description.toLowerCase();
    
    const allowedPrograms = DEPARTMENT_TO_PROGRAMS[chairProgram] || [];
    const isIT = allowedPrograms.includes('Bachelor of Science in Information Technology') || chairProgram === 'BS Information Technology';
    const isHM = allowedPrograms.includes('Bachelor of Science in Hospitality Management') || chairProgram === 'BS Hospitality Management';
    const isEduc = allowedPrograms.includes('Bachelor of Elementary Education') || allowedPrograms.includes('Bachelor of Secondary Education') || chairProgram === 'BS Elementary Education';
    const isAgri = allowedPrograms.includes('Bachelor of Science in Agriculture') || chairProgram === 'BS Agriculture';
    const isTourism = allowedPrograms.includes('Bachelor of Science in Tourism Management') || chairProgram === 'BS Tourism Management';
    const isIndTech = allowedPrograms.includes('Bachelor of Science in Industrial Technology') || chairProgram === 'BS Industrial Technology';
    
    if (isIT && (titleLower.includes('tech') || titleLower.includes('it') || titleLower.includes('developer') || titleLower.includes('programmer') || titleLower.includes('network') || titleLower.includes('system') || descLower.includes('software') || descLower.includes('web'))) return true;
    if (isHM && (titleLower.includes('hotel') || titleLower.includes('hospitality') || titleLower.includes('chef') || titleLower.includes('restaurant') || titleLower.includes('service') || descLower.includes('hospitality') || titleLower.includes('kitchen') || titleLower.includes('cook'))) return true;
    if (isEduc && (titleLower.includes('teacher') || titleLower.includes('instructor') || titleLower.includes('school') || titleLower.includes('education') || titleLower.includes('tutor') || titleLower.includes('professor'))) return true;
    if (isAgri && (titleLower.includes('agri') || titleLower.includes('farm') || titleLower.includes('crop') || titleLower.includes('plant') || titleLower.includes('vet') || descLower.includes('agriculture') || titleLower.includes('soil') || titleLower.includes('livestock'))) return true;
    if (isTourism && (titleLower.includes('tour') || titleLower.includes('travel') || titleLower.includes('flight') || titleLower.includes('resort') || titleLower.includes('guide') || descLower.includes('tourism'))) return true;
    if (isIndTech && (titleLower.includes('industrial') || titleLower.includes('machine') || titleLower.includes('operator') || titleLower.includes('electric') || titleLower.includes('tech') || descLower.includes('factory') || titleLower.includes('welder') || titleLower.includes('mechanic'))) return true;
    
    return false;
  });

  // Kinakalkula ang mga porsyento para sa mga sector ng donut chart
  const pieSegments = (() => {
    const total = totalDeptAlumni || 1;
    const employedPct = Math.round((employedAlumni / total) * 100);
    const freelancePct = Math.round((freelanceAlumni / total) * 100);
    const selfPct = Math.round((selfEmployedAlumni / total) * 100);
    const furtherPct = Math.round((furtherStudiesAlumni / total) * 100);
    const unemployedPct = Math.round((unemployedAlumni / total) * 100);
    const unregisteredPct = Math.round((unregisteredDeptAlumni / total) * 100);

    return {
      employed: employedPct,
      freelance: freelancePct,
      self: selfPct,
      furtherStudies: furtherPct,
      unemployed: unemployedPct,
      unregistered: unregisteredPct
    };
  })();

  /**
   * Nag-ge-generate ng mga value para sa gitna ng Donut Chart base sa hover state.
   * @returns {Object}
   */
  const getCenterText = () => {
    const pluralGrad = totalDeptAlumni <= 1 ? 'grad' : 'grads';
    if (!hoveredDeptSegment) {
      return {
        label: 'Placed Rate',
        value: `${employmentRate}%`,
        sub: `${employedCount} / ${totalDeptAlumni} ${pluralGrad}`
      };
    }
    switch (hoveredDeptSegment) {
      case 'employed':
        return { label: 'Employed', value: `${pieSegments.employed}%`, sub: `${employedAlumni} / ${totalDeptAlumni} ${pluralGrad}` };
      case 'freelance':
        return { label: 'Freelance', value: `${pieSegments.freelance}%`, sub: `${freelanceAlumni} / ${totalDeptAlumni} ${pluralGrad}` };
      case 'self':
        return { label: 'Self-Employed', value: `${pieSegments.self}%`, sub: `${selfEmployedAlumni} / ${totalDeptAlumni} ${pluralGrad}` };
      case 'furtherStudies':
        return { label: 'Further Studies', value: `${pieSegments.furtherStudies}%`, sub: `${furtherStudiesAlumni} / ${totalDeptAlumni} ${pluralGrad}` };
      case 'unemployed':
        return { label: 'Unemployed', value: `${pieSegments.unemployed}%`, sub: `${unemployedAlumni} / ${totalDeptAlumni} ${pluralGrad}` };
      case 'unregistered':
        return { label: 'Unregistered', value: `${pieSegments.unregistered}%`, sub: `${unregisteredDeptAlumni} / ${totalDeptAlumni} ${pluralGrad}` };
      default:
        return { label: 'Placed Rate', value: `${employmentRate}%`, sub: '' };
    }
  };
  
  const centerText = getCenterText();

  return (
    <div className="space-y-6 font-sans">
      
      {/* Welcome Banner para sa Departamento */}
      <div className="bg-[#7c191e]/5 border border-[#7c191e]/15 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">

          </div>
          <h1 className="text-xl font-extrabold text-slate-800 mt-2">Mabuhay, {activeUser.name}! Welcome to your Department Portal</h1>
          <p className="text-xs text-slate-500 mt-1">
            BSC Tracer Analytics Platform specialized for <span className="text-[#7c191e] font-bold">{chairProgram}</span>. You have exclusive restricted access to your department's resources.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 no-print shrink-0">
          <div className="text-[10px] font-bold text-[#7c191e] bg-[#7c191e]/10 px-3.5 py-1.5 rounded-full border border-[#7c191e]/20 tracking-wider uppercase">
            {chairProgram.replace('BS ', '')}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Dropdown selector para sa Graduation Class Year */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-655 bg-white border border-slate-200 px-2 py-1.5 rounded-lg shadow-3xs">
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Class Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-[#7c191e] font-extrabold focus:outline-none cursor-pointer"
              >
                <option value="All">All Years</option>
                {graduationYears.map(yr => (
                  <option key={yr} value={yr}>Class of {yr}</option>
                ))}
              </select>
            </div>

            {/* Button para sa pag-print ng summary ng ulat */}
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-[#cca43b] hover:bg-[#cca43b]/90 text-slate-900 font-extrabold text-[11px] rounded-lg transition flex items-center gap-1.5 uppercase tracking-wider shadow-xs cursor-pointer select-none"
            >
              <Printer className="w-3.5 h-3.5" /> Print Summary
            </button>
          </div>
        </div>
      </div>

      {/* Row para sa mga Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric card para sa kabuuang rehistradong alumni ng departamento */}
        <div 
          onClick={() => onNavigate('Alumni')}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between cursor-pointer hover:border-[#7c191e]/20 transition-all"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Alumni Registration</span>
            <div className="text-xl font-extrabold text-slate-800">{totalRegisteredDept} / {totalDeptAlumni}</div>
            <span className="text-[10px] text-slate-505 font-semibold block mt-0.5">{deptRegistrationRate}% Registration Rate</span>
          </div>
          <div className="p-3 bg-[#7c191e]/10 text-[#7c191e] rounded-lg">
            <GraduationCap className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Metric card para sa employability rate ng program */}
        <div 
          onClick={() => onNavigate('Reports')}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between cursor-pointer hover:border-[#7c191e]/20 transition-all"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Program Employability</span>
            <div className="flex items-center gap-1">
              <div className="text-xl font-extrabold text-slate-800">{employmentRate}%</div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
                <ArrowUpRight className="w-3" />
              </span>
            </div>
          </div>
          <div className="p-3 bg-[#7c191e]/10 text-[#7c191e] rounded-lg">
            <BarChart className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Metric card para sa mga katugmang trabaho sa departamento */}
        <div 
          onClick={() => onNavigate('Job Postings')}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between cursor-pointer hover:border-[#7c191e]/20 transition-all"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Department Job Matches</span>
            <div className="text-xl font-extrabold text-slate-800">
              {matchedJobs.length} {matchedJobs.length <= 1 ? 'Position' : 'Positions'}
            </div>
          </div>
          <div className="p-3 bg-[#7c191e]/10 text-[#7c191e] rounded-lg">
            <Briefcase className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Metric card para sa average ng curriculum feedback rating ng graduates */}
        <div 
          onClick={() => onNavigate('Curriculum Feedback')}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between cursor-pointer hover:border-[#7c191e]/20 transition-all"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Curriculum Quality Rating</span>
            <div className="flex items-center gap-1">
              <div className="text-xl font-extrabold text-slate-800">{averageRatingVal} / 5.0</div>
              {averageRatingVal !== 'N/A' && <span className="text-xs text-amber-500 font-bold">&#10038;</span>}
            </div>
            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">{deptFeedbacks.length} Grad Reviews</span>
          </div>
          <div className="p-3 bg-[#7c191e]/10 text-[#7c191e] rounded-lg">
            <Award className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Kaliwang panel para sa mga Department Control links */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-4 shadow-sm">
            <span className="block text-xs font-bold text-[#7c191e] uppercase tracking-wider">Department Controls</span>
            
            <div className="grid grid-cols-1 gap-2.5">
              <button 
                onClick={() => onNavigate('Alumni')}
                className="w-full text-left p-3 rounded-lg border border-slate-105 hover:border-[#7c191e]/25 hover:bg-[#7c191e]/5 bg-slate-50/50 flex items-center justify-between group transition-all text-xs font-semibold text-slate-705 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[#7c191e]/10 text-[#7c191e] rounded">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">Manage Program Students</span>
                    <span className="text-[10px] text-slate-400 font-medium">View, update, or nudge graduates of your program</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={() => onNavigate('Curriculum Feedback')}
                className="w-full text-left p-3 rounded-lg border border-slate-105 hover:border-[#7c191e]/25 hover:bg-[#7c191e]/5 bg-slate-50/50 flex items-center justify-between group transition-all text-xs font-semibold text-slate-755 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[#7c191e]/10 text-[#7c191e] rounded">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">View Curricular Audits</span>
                    <span className="text-[10px] text-slate-400 font-medium">Check curriculum evaluation feedback from program graduates</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={() => onNavigate('Skills Match')}
                className="w-full text-left p-3 rounded-lg border border-slate-105 hover:border-[#7c191e]/25 hover:bg-[#7c191e]/5 bg-slate-50/50 flex items-center justify-between group transition-all text-xs font-semibold text-slate-705 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[#7c191e]/10 text-[#7c191e] rounded">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">Inspect Skills Alignments</span>
                    <span className="text-[10px] text-slate-400 font-medium">See direct alignments with corporate vacancies</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={() => onNavigate('Surveys')}
                className="w-full text-left p-3 rounded-lg border border-slate-105 hover:border-[#7c191e]/25 hover:bg-[#7c191e]/5 bg-slate-50/50 flex items-center justify-between group transition-all text-xs font-semibold text-slate-705 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[#7c191e]/10 text-[#7c191e] rounded">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">Department Questionnaires</span>
                    <span className="text-[10px] text-slate-400 font-medium">Check or deploy surveys for your courses</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Paalala o notice tungkol sa Faculty Mandate Compliance */}
          <div className="bg-[#7c191e]/5 rounded-xl border border-[#7c191e]/15 p-5 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-[#7c191e]" />
              <span className="text-xs font-extrabold text-[#7c191e] uppercase tracking-wider">Faculty Mandate Compliance</span>
            </div>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              As a Department Chairperson, you are designated to audit core curriculum relevance to actual career paths. Use the "Feedback" and "Skills Matrix" panels to analyze adjustments for next physical terms.
            </p>
          </div>
        </div>

        {/* Kanang bahagi para sa mga Chart at Table */}
        <div className="lg:col-span-3 space-y-6 select-none">
          
          {/* Interactive SVG Donut chart para sa pamamahagi ng employment status */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-6 shadow-sm">
            <div className="relative w-36 h-36 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f8fafc" strokeWidth="12" />
                
                {/* Segment para sa Employed */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" 
                  strokeWidth={hoveredDeptSegment === 'employed' ? 18 : 12}
                  strokeDasharray={`${(pieSegments.employed / 100) * 251.2} 251.2`} 
                  strokeDashoffset="0"
                  className="donut-chart-segment cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoveredDeptSegment('employed');
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      title: 'Employed',
                      value: `${employedAlumni} Graduates (${pieSegments.employed}%)`
                    });
                  }}
                  onMouseMove={(e) => {
                    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
                  }}
                  onMouseLeave={() => {
                    setHoveredDeptSegment(null);
                    setTooltip(null);
                  }}
                />

                {/* Segment para sa Freelance */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" 
                  strokeWidth={hoveredDeptSegment === 'freelance' ? 18 : 12}
                  strokeDasharray={`${(pieSegments.freelance / 100) * 251.2} 251.2`} 
                  strokeDashoffset={`-${(pieSegments.employed / 100) * 251.2}`}
                  className="donut-chart-segment cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoveredDeptSegment('freelance');
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      title: 'Freelance',
                      value: `${freelanceAlumni} Graduates (${pieSegments.freelance}%)`
                    });
                  }}
                  onMouseMove={(e) => {
                    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
                  }}
                  onMouseLeave={() => {
                    setHoveredDeptSegment(null);
                    setTooltip(null);
                  }}
                />

                {/* Segment para sa Self-Employed */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" 
                  strokeWidth={hoveredDeptSegment === 'self' ? 18 : 12}
                  strokeDasharray={`${(pieSegments.self / 100) * 251.2} 251.2`} 
                  strokeDashoffset={`-${((pieSegments.employed + pieSegments.freelance) / 100) * 251.2}`}
                  className="donut-chart-segment cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoveredDeptSegment('self');
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      title: 'Self-Employed',
                      value: `${selfEmployedAlumni} Graduates (${pieSegments.self}%)`
                    });
                  }}
                  onMouseMove={(e) => {
                    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
                  }}
                  onMouseLeave={() => {
                    setHoveredDeptSegment(null);
                    setTooltip(null);
                  }}
                />

                {/* Segment para sa Further Studies */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" 
                  strokeWidth={hoveredDeptSegment === 'furtherStudies' ? 18 : 12}
                  strokeDasharray={`${(pieSegments.furtherStudies / 100) * 251.2} 251.2`} 
                  strokeDashoffset={`-${((pieSegments.employed + pieSegments.freelance + pieSegments.self) / 100) * 251.2}`}
                  className="donut-chart-segment cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoveredDeptSegment('furtherStudies');
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      title: 'Further Studies',
                      value: `${furtherStudiesAlumni} Graduates (${pieSegments.furtherStudies}%)`
                    });
                  }}
                  onMouseMove={(e) => {
                    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
                  }}
                  onMouseLeave={() => {
                    setHoveredDeptSegment(null);
                    setTooltip(null);
                  }}
                />

                {/* Segment para sa Unemployed */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" 
                  strokeWidth={hoveredDeptSegment === 'unemployed' ? 18 : 12}
                  strokeDasharray={`${(pieSegments.unemployed / 100) * 251.2} 251.2`} 
                  strokeDashoffset={`-${((pieSegments.employed + pieSegments.freelance + pieSegments.self + pieSegments.furtherStudies) / 100) * 251.2}`}
                  className="donut-chart-segment cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoveredDeptSegment('unemployed');
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      title: 'Unemployed',
                      value: `${unemployedAlumni} Graduates (${pieSegments.unemployed}%)`
                    });
                  }}
                  onMouseMove={(e) => {
                    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
                  }}
                  onMouseLeave={() => {
                    setHoveredDeptSegment(null);
                    setTooltip(null);
                  }}
                />

                {/* Segment para sa Unregistered */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#94a3b8" 
                  strokeWidth={hoveredDeptSegment === 'unregistered' ? 18 : 12}
                  strokeDasharray={`${(pieSegments.unregistered / 100) * 251.2} 251.2`} 
                  strokeDashoffset={`-${((pieSegments.employed + pieSegments.freelance + pieSegments.self + pieSegments.furtherStudies + pieSegments.unemployed) / 100) * 251.2}`}
                  className="donut-chart-segment cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoveredDeptSegment('unregistered');
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      title: 'Unregistered',
                      value: `${unregisteredDeptAlumni} Graduates (${pieSegments.unregistered}%)`
                    });
                  }}
                  onMouseMove={(e) => {
                    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
                  }}
                  onMouseLeave={() => {
                    setHoveredDeptSegment(null);
                    setTooltip(null);
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full w-24 h-24 m-auto shadow-xs border border-slate-55 pointer-events-none select-none">
                <span className="text-[7px] text-slate-400 font-extrabold uppercase tracking-wider text-center px-1 leading-none">{centerText.label}</span>
                <span className="text-sm font-extrabold text-[#7c191e] mt-0.5 leading-none">{centerText.value}</span>
                <span className="text-[6.5px] text-slate-400 font-bold mt-1 text-center px-1 leading-tight">{centerText.sub}</span>
              </div>
            </div>

            {/* Paliwanag o legends para sa mga kulay sa donut chart */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Dept Status Share</span>
              <div className="grid grid-cols-1 gap-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="w-2 h-2 bg-emerald-500 rounded-xs block" />
                  <span className="text-slate-650">Employed: {employedAlumni} ({pieSegments.employed}%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="w-2 h-2 bg-violet-500 rounded-xs block" />
                  <span className="text-slate-650">Freelance: {freelanceAlumni} ({pieSegments.freelance}%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="w-2 h-2 bg-amber-500 rounded-xs block" />
                  <span className="text-slate-650">Self-Employed: {selfEmployedAlumni} ({pieSegments.self}%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="w-2 h-2 bg-blue-500 rounded-xs block" />
                  <span className="text-slate-650">Further Studies: {furtherStudiesAlumni} ({pieSegments.furtherStudies}%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="w-2 h-2 bg-rose-500 rounded-xs block" />
                  <span className="text-slate-650">Unemployed: {unemployedAlumni} ({pieSegments.unemployed}%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="w-2 h-2 bg-slate-400 rounded-xs block" />
                  <span className="text-slate-655">Unregistered: {unregisteredDeptAlumni} ({pieSegments.unregistered}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table o listahan ng mga kamakailang aktibidad ng mga graduate ng program */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 space-y-3.5 shadow-sm">
            <div className="flex justify-between items-center pb-2 border-b border-slate-55">
              <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider">Your Program Graduates Activity</span>
              <button 
                onClick={() => onNavigate('Alumni')}
                className="text-[10px] font-bold text-[#7c191e] hover:underline cursor-pointer select-none"
              >
                View All {totalDeptAlumni} {totalDeptAlumni <= 1 ? 'Grad' : 'Grads'}
              </button>
            </div>

            {filteredDeptAlumni.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No graduates registered under this program for the selected class year.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[180px] overflow-y-auto font-sans">
                {filteredDeptAlumni.slice(0, 4).map(al => (
                  <div key={al.studentId} className="py-2.5 flex items-center justify-between text-xs font-medium gap-2">
                    <div>
                      <span className="block text-slate-800 font-extrabold">{al.name}</span>
                      <span className="block text-[9px] text-slate-400 font-semibold mt-0.5">ID: {al.studentId} &middot; Graduated {al.yearGraduated}</span>
                    </div>

                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      al.employmentStatus === 'Employed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                      al.employmentStatus === 'Unemployed' ? 'bg-rose-50 text-rose-800 border border-rose-100' :
                      al.employmentStatus === 'Freelance' ? 'bg-violet-50 text-violet-800 border border-violet-100' :
                      al.employmentStatus === 'Self-Employed' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                      'bg-blue-50 text-blue-800 border border-blue-100'
                    }`}>
                      {al.employmentStatus}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tooltip layer na lumalabas kapag tinapatan ang donut segments */}
      {tooltip && (
        <div 
          className="fixed bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none z-50 border border-slate-800"
          style={{ left: `${tooltip.x + 10}px`, top: `${tooltip.y - 10}px`, transform: 'translate(-50%, -100%)' }}
        >
          <div className="text-[#cca43b] font-extrabold uppercase text-[9px] mb-0.5">{tooltip.title}</div>
          <div className="text-white font-bold">{tooltip.value}</div>
        </div>
      )}
    </div>
  );
}
