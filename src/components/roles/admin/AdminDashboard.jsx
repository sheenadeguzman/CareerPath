/**
 * @file AdminDashboard.jsx
 * @description Main dashboard view para sa mga Administrator. Nagpapakita ng institutional analytics,
 * kabilang ang registration rates, placement metrics, interactive SVG donut charts para sa employment segments,
 * program volume distribution charts, digest ng kamakailang activity logs, at pag-print ng mga ulat.
 */

import React, { useState } from 'react';
import { 
  GraduationCap, 
  BarChart, 
  Users, 
  Briefcase, 
  Clock, 
  ArrowUpRight,
  Printer
} from 'lucide-react';

export default function AdminDashboard({ 
  alumni = [], 
  employers = [], 
  jobPostings = [], 
  logs = [], 
  onNavigate, 
  userName 
}) {
  // Mga lokal na state para sa interactivity
  const [hoveredInstSegment, setHoveredInstSegment] = useState(null); // Aktibong segment sa donut chart kapag tinapatan ng cursor
  const [tooltip, setTooltip] = useState(null); // State para sa coordinates at data ng SVG hover tooltip
  const [selectedYear, setSelectedYear] = useState('All'); // State para sa filter ng graduation class year ng cohort

  // Dynamic na pagkuha ng mga unique graduation years mula sa listahan ng alumni
  const graduationYears = Array.from(new Set(alumni.map(a => a.yearGraduated.toString()))).sort();

  // Sinasala ang dataset ng alumni base sa napiling taon ng pagtatapos
  const filteredAlumni = selectedYear === 'All'
    ? alumni
    : alumni.filter(a => a.yearGraduated.toString() === selectedYear);

  // Mga kalkulasyon para sa metrics ng dashboard cards
  const totalAlumni = filteredAlumni.length;
  const registeredAlumni = filteredAlumni.filter(a => a.isRegistered);
  const totalRegistered = registeredAlumni.length;
  const registrationRate = totalAlumni > 0 ? ((totalRegistered / totalAlumni) * 100).toFixed(1) : '0';
  const unregisteredAlumni = totalAlumni - totalRegistered;
  
  // Breakdown ng bilang kada employment status ng mga graduate
  const employedAlumni = registeredAlumni.filter(a => a.employmentStatus === 'Employed').length;
  const freelanceAlumni = registeredAlumni.filter(a => a.employmentStatus === 'Freelance').length;
  const selfEmployedAlumni = registeredAlumni.filter(a => a.employmentStatus === 'Self-Employed').length;
  const furtherStudiesAlumni = registeredAlumni.filter(a => a.employmentStatus === 'Further Studies').length;
  const unemployedAlumni = registeredAlumni.filter(a => a.employmentStatus === 'Unemployed').length;
  
  // Pinagsasama ang mga may trabaho (Employed, Freelance, Self-Employed) para makuha ang porsyento ng employment rate
  const employedCount = employedAlumni + freelanceAlumni + selfEmployedAlumni;
  const employmentRate = totalAlumni > 0 ? ((employedCount / totalAlumni) * 100).toFixed(1) : '0';

  // Breakdown of registeredAlumni syllabus relevance
  const relevanceYes = registeredAlumni.filter(a => a.jobRelatedToCourse === 'Yes').length;
  const relevancePartially = registeredAlumni.filter(a => a.jobRelatedToCourse === 'Partially').length;
  const relevanceNo = registeredAlumni.filter(a => a.jobRelatedToCourse === 'No').length;
  const totalRelevance = relevanceYes + relevancePartially + relevanceNo || 1;
  const relevanceYesPct = Math.round((relevanceYes / totalRelevance) * 100);
  const relevancePartiallyPct = Math.round((relevancePartially / totalRelevance) * 100);
  const relevanceNoPct = Math.round((relevanceNo / totalRelevance) * 100);

  // Time to Land First Job
  const timeImmediate = registeredAlumni.filter(a => a.timeToFirstJob === 'Immediate').length;
  const time1to6 = registeredAlumni.filter(a => a.timeToFirstJob === '1 to 6 months').length;
  const time7to11 = registeredAlumni.filter(a => a.timeToFirstJob === '7 to 11 months').length;
  const time1YearPlus = registeredAlumni.filter(a => a.timeToFirstJob === '1 year or longer').length;
  const totalTime = timeImmediate + time1to6 + time7to11 + time1YearPlus || 1;
  const timeImmediatePct = Math.round((timeImmediate / totalTime) * 100);
  const time1to6Pct = Math.round((time1to6 / totalTime) * 100);
  const time7to11Pct = Math.round((time7to11 / totalTime) * 100);
  const time1YearPlusPct = Math.round((time1YearPlus / totalTime) * 100);

  // Monthly Salary Bracket (PHP)
  const salUnder10k = registeredAlumni.filter(a => a.monthlyIncome === 'Under 10,000').length;
  const sal10to20k = registeredAlumni.filter(a => a.monthlyIncome === '10,000 - 20,000').length;
  const sal20to30k = registeredAlumni.filter(a => a.monthlyIncome === '20,001 - 30,000').length;
  const sal30to40k = registeredAlumni.filter(a => a.monthlyIncome === '30,001 - 40,000').length;
  const salOver40k = registeredAlumni.filter(a => a.monthlyIncome === 'Above 40,000').length;
  const totalSal = salUnder10k + sal10to20k + sal20to30k + sal30to40k + salOver40k || 1;
  const salUnder10kPct = Math.round((salUnder10k / totalSal) * 100);
  const sal10to20kPct = Math.round((sal10to20k / totalSal) * 100);
  const sal20to30kPct = Math.round((sal20to30k / totalSal) * 100);
  const sal30to40kPct = Math.round((sal30to40k / totalSal) * 100);
  const salOver40kPct = Math.round((salOver40k / totalSal) * 100);

  // Sector and Location
  const sectorPrivate = registeredAlumni.filter(a => a.sector === 'Private').length;
  const sectorPublic = registeredAlumni.filter(a => a.sector === 'Public').length;
  const sectorNGO = registeredAlumni.filter(a => a.sector === 'NGO').length;
  const sectorNA = registeredAlumni.filter(a => a.sector === 'N/A' || !a.sector).length;

  const locLocal = registeredAlumni.filter(a => a.locationRegion === 'Local (Batanes)' || !a.locationRegion).length;
  const locNational = registeredAlumni.filter(a => a.locationRegion === 'National (Other Provinces)').length;
  const locInternational = registeredAlumni.filter(a => a.locationRegion === 'International (Overseas)').length;
  
  const totalEmployers = employers.length;
  const openPositions = jobPostings.filter(j => j.status === 'Open').reduce((acc, curr) => acc + curr.slots, 0);

  const getBaseProgram = (progName) => {
    if (!progName) return 'Bachelor of Science in Information Technology';
    const normalized = progName.toLowerCase();
    
    if (normalized.includes('information technology') || normalized.includes('bsit')) {
      return 'Bachelor of Science in Information Technology';
    }
    if (normalized.includes('hospitality management') || normalized.includes('bshm')) {
      return 'Bachelor of Science in Hospitality Management';
    }
    if (normalized.includes('tourism management') || normalized.includes('bstm')) {
      return 'Bachelor of Science in Tourism Management';
    }
    if (normalized.includes('industrial technology')) {
      return 'Bachelor of Science in Industrial Technology';
    }
    if (normalized.includes('agriculture') || normalized.includes('bsa')) {
      return 'Bachelor of Science in Agriculture';
    }
    if (normalized.includes('elementary education') || normalized.includes('beed')) {
      return 'Bachelor of Elementary Education';
    }
    if (normalized.includes('secondary education') || normalized.includes('bsed')) {
      return 'Bachelor of Secondary Education';
    }
    return progName;
  };

  // Pagpapangkat ng graduates count kada degree program
  const programCounts = {
    'Bachelor of Science in Information Technology': 0,
    'Bachelor of Science in Hospitality Management': 0,
    'Bachelor of Science in Tourism Management': 0,
    'Bachelor of Science in Industrial Technology': 0,
    'Bachelor of Science in Agriculture': 0,
    'Bachelor of Elementary Education': 0,
    'Bachelor of Secondary Education': 0,
  };

  const programRegisteredCounts = {
    'Bachelor of Science in Information Technology': 0,
    'Bachelor of Science in Hospitality Management': 0,
    'Bachelor of Science in Tourism Management': 0,
    'Bachelor of Science in Industrial Technology': 0,
    'Bachelor of Science in Agriculture': 0,
    'Bachelor of Elementary Education': 0,
    'Bachelor of Secondary Education': 0,
  };

  filteredAlumni.forEach(al => {
    const baseProg = getBaseProgram(al.program);
    if (programCounts[baseProg] !== undefined) {
      programCounts[baseProg]++;
    } else {
      programCounts[baseProg] = 1;
    }

    if (al.isRegistered) {
      if (programRegisteredCounts[baseProg] !== undefined) {
        programRegisteredCounts[baseProg]++;
      } else {
        programRegisteredCounts[baseProg] = 1;
      }
    }
  });

  // Pagkalkula ng porsyento para sa mga segment ng SVG donut chart
  const pieSegments = (() => {
    const total = totalAlumni || 1;
    const employedPct = Math.round((employedAlumni / total) * 100);
    const freelancePct = Math.round((freelanceAlumni / total) * 100);
    const selfPct = Math.round((selfEmployedAlumni / total) * 100);
    const furtherPct = Math.round((furtherStudiesAlumni / total) * 100);
    const unemployedPct = Math.round((unemployedAlumni / total) * 100);
    const unregisteredPct = Math.round((unregisteredAlumni / total) * 100);

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
   * Kumuha ng kaukulang labels at values para ipakita sa gitna ng Donut Chart.
   * NOTE: Ginawa nating dynamic ang pluralization ng grads ( <= 1 ay 'grad' ) alinsunod sa bagong hiling ng user.
   * @returns {Object} { label, value, sub }
   */
  const getCenterText = () => {
    const totalGradLabel = totalAlumni <= 1 ? 'grad' : 'grads';
    if (!hoveredInstSegment) {
      return {
        label: 'Placed Rate',
        value: `${employmentRate}%`,
        sub: `${employedCount} / ${totalAlumni} ${totalGradLabel}`
      };
    }
    switch (hoveredInstSegment) {
      case 'employed':
        return { label: 'Employed', value: `${pieSegments.employed}%`, sub: `${employedAlumni} / ${totalAlumni} ${totalGradLabel}` };
      case 'freelance':
        return { label: 'Freelance', value: `${pieSegments.freelance}%`, sub: `${freelanceAlumni} / ${totalAlumni} ${totalGradLabel}` };
      case 'self':
        return { label: 'Self-Employed', value: `${pieSegments.self}%`, sub: `${selfEmployedAlumni} / ${totalAlumni} ${totalGradLabel}` };
      case 'furtherStudies':
        return { label: 'Further Studies', value: `${pieSegments.furtherStudies}%`, sub: `${furtherStudiesAlumni} / ${totalAlumni} ${totalGradLabel}` };
      case 'unemployed':
        return { label: 'Unemployed', value: `${pieSegments.unemployed}%`, sub: `${unemployedAlumni} / ${totalAlumni} ${totalGradLabel}` };
      case 'unregistered':
        return { label: 'Unregistered', value: `${pieSegments.unregistered}%`, sub: `${unregisteredAlumni} / ${totalAlumni} ${totalGradLabel}` };
      default:
        return { label: 'Placed Rate', value: `${employmentRate}%`, sub: '' };
    }
  };
  const centerText = getCenterText();

  return (
    <div className="space-y-6 font-sans">
      
      {/* Banner para sa pagsalubong sa Admin */}
      <div className="bg-[#7c191e]/5 border border-[#7c191e]/15 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Welcome back, {userName.split(' ')[0].toLowerCase()}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Batanes State College &mdash; Graduate Tracer and Employability Analytics Program
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 no-print">
          
          {/* Selector para sa taon ng Pagtatapos */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-650 bg-white border border-slate-200 px-2 py-1.5 rounded-lg">
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
        </div>
      </div>

      {/* Hilera ng mga Dashboard Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Kard para sa Kabuuang Alumni Registry */}
        <div 
          onClick={() => onNavigate('Alumni')} 
          className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex items-center justify-between cursor-pointer hover:border-[#7c191e]/20 transition-all"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Alumni Registration</span>
            <div className="text-2xl font-bold text-slate-800">{totalRegistered} / {totalAlumni}</div>
            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">{registrationRate}% Registration Rate</span>
          </div>
          <div className="p-3 bg-[#7c191e]/10 text-[#7c191e] rounded-lg">
            <GraduationCap className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Kard para sa Pangkalahatang Placed Employment Rate */}
        <div 
          onClick={() => onNavigate('Reports')} 
          className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex items-center justify-between cursor-pointer hover:border-[#7c191e]/20 transition-all"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Employment Rate</span>
            <div className="flex items-center gap-1.5">
              <div className="text-2xl font-bold text-slate-800">{employmentRate}%</div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center">
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>
          <div className="p-3 bg-[#7c191e]/10 text-[#7c191e] rounded-lg">
            <BarChart className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Kard para sa mga Naka-register na Enterprise Partners */}
        <div 
          onClick={() => onNavigate('Employers')} 
          className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex items-center justify-between cursor-pointer hover:border-[#7c191e]/20 transition-all"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Enterprise Partners</span>
            <div className="text-2xl font-bold text-slate-800">{totalEmployers} Firms</div>
          </div>
          <div className="p-3 bg-[#7c191e]/10 text-[#7c191e] rounded-lg">
            <Users className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Kard para sa Kabuuang Bakanteng Trabaho o Career Opportunities */}
        <div 
          onClick={() => onNavigate('Job Postings')} 
          className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex items-center justify-between cursor-pointer hover:border-[#7c191e]/20 transition-all"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Open Careers</span>
            <div className="text-2xl font-bold text-slate-800">{openPositions} Slots</div>
          </div>
          <div className="p-3 bg-[#7c191e]/10 text-[#7c191e] rounded-lg">
            <Briefcase className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      {/* Visual Analytics at Distribution Charts gamit ang SVG at Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Seksyon para sa Employment Status Distribution - Donut Chart */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100 flex flex-col">
          <h2 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-55 uppercase tracking-wider">Employment Status Distribution</h2>
          
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
            
            {/* Interactive SVG Donut Chart */}
            <div className="relative w-40 h-40 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f8fafc" strokeWidth="12" />
                
                {/* May regular na Trabaho (Employed) */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" 
                  strokeWidth={hoveredInstSegment === 'employed' ? 18 : 12}
                  strokeDasharray={`${(pieSegments.employed / 100) * 251.2} 251.2`} 
                  strokeDashoffset="0"
                  className="donut-chart-segment cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoveredInstSegment('employed');
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
                    setHoveredInstSegment(null);
                    setTooltip(null);
                  }}
                />

                {/* Freelance o Project-based */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" 
                  strokeWidth={hoveredInstSegment === 'freelance' ? 18 : 12}
                  strokeDasharray={`${(pieSegments.freelance / 100) * 251.2} 251.2`} 
                  strokeDashoffset={`-${(pieSegments.employed / 100) * 251.2}`}
                  className="donut-chart-segment cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoveredInstSegment('freelance');
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
                    setHoveredInstSegment(null);
                    setTooltip(null);
                  }}
                />

                {/* Sariling Negosyo (Self-employed) */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" 
                  strokeWidth={hoveredInstSegment === 'self' ? 18 : 12}
                  strokeDasharray={`${(pieSegments.self / 100) * 251.2} 251.2`} 
                  strokeDashoffset={`-${((pieSegments.employed + pieSegments.freelance) / 100) * 251.2}`}
                  className="donut-chart-segment cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoveredInstSegment('self');
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
                    setHoveredInstSegment(null);
                    setTooltip(null);
                  }}
                />

                {/* Nagpapatuloy sa Pag-aaral (Further Studies) */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" 
                  strokeWidth={hoveredInstSegment === 'furtherStudies' ? 18 : 12}
                  strokeDasharray={`${(pieSegments.furtherStudies / 100) * 251.2} 251.2`} 
                  strokeDashoffset={`-${((pieSegments.employed + pieSegments.freelance + pieSegments.self) / 100) * 251.2}`}
                  className="donut-chart-segment cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoveredInstSegment('furtherStudies');
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
                    setHoveredInstSegment(null);
                    setTooltip(null);
                  }}
                />

                {/* Walang Trabaho (Unemployed) */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" 
                  strokeWidth={hoveredInstSegment === 'unemployed' ? 18 : 12}
                  strokeDasharray={`${(pieSegments.unemployed / 100) * 251.2} 251.2`} 
                  strokeDashoffset={`-${((pieSegments.employed + pieSegments.freelance + pieSegments.self + pieSegments.furtherStudies) / 100) * 251.2}`}
                  className="donut-chart-segment cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoveredInstSegment('unemployed');
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
                    setHoveredInstSegment(null);
                    setTooltip(null);
                  }}
                />

                {/* Hindi pa naka-register sa portal */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#94a3b8" 
                  strokeWidth={hoveredInstSegment === 'unregistered' ? 18 : 12}
                  strokeDasharray={`${(pieSegments.unregistered / 100) * 251.2} 251.2`} 
                  strokeDashoffset={`-${((pieSegments.employed + pieSegments.freelance + pieSegments.self + pieSegments.furtherStudies + pieSegments.unemployed) / 100) * 251.2}`}
                  className="donut-chart-segment cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoveredInstSegment('unregistered');
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      title: 'Unregistered',
                      value: `${unregisteredAlumni} Graduates (${pieSegments.unregistered}%)`
                    });
                  }}
                  onMouseMove={(e) => {
                    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
                  }}
                  onMouseLeave={() => {
                    setHoveredInstSegment(null);
                    setTooltip(null);
                  }}
                />
              </svg>
              
              {/* Dynamic na teksto sa gitna ng donut chart */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full w-28 h-28 m-auto shadow-xs border border-slate-55 pointer-events-none select-none">
                <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider text-center px-1 leading-none">{centerText.label}</span>
                <span className="text-base font-extrabold text-[#7c191e] mt-0.5 leading-none">{centerText.value}</span>
                <span className="text-[7.5px] text-slate-400 font-bold mt-1 text-center px-1 leading-tight">{centerText.sub}</span>
              </div>
            </div>

            {/* Listahan ng mga kulay at deskripsyon ng chart (Legends) */}
            <div className="space-y-2.5 font-sans">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-500 rounded-xs inline-block" />
                <div>
                  <span className="block text-xs font-bold text-slate-700 leading-none">Employed</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{employedAlumni} Graduates &bull; {pieSegments.employed}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-violet-500 rounded-xs inline-block" />
                <div>
                  <span className="block text-xs font-bold text-slate-700 leading-none">Freelance</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{freelanceAlumni} Graduates &bull; {pieSegments.freelance}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-500 rounded-xs inline-block" />
                <div>
                  <span className="block text-xs font-bold text-slate-700 leading-none">Self-Employed</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{selfEmployedAlumni} Graduates &bull; {pieSegments.self}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-xs inline-block" />
                <div>
                  <span className="block text-xs font-bold text-slate-700 leading-none">Further Studies</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{furtherStudiesAlumni} Graduates &bull; {pieSegments.furtherStudies}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-rose-500 rounded-xs inline-block" />
                <div>
                  <span className="block text-xs font-bold text-slate-700 leading-none">Unemployed</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{unemployedAlumni} Graduates &bull; {pieSegments.unemployed}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#cca43b]/40 rounded-xs inline-block" />
                <div>
                  <span className="block text-xs font-bold text-slate-700 leading-none">Unregistered</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{unregisteredAlumni} Graduates &bull; {pieSegments.unregistered}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kard na nagpapakita ng dami ng Alumni kada Degree Program */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100 flex flex-col">
          <h2 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-55 uppercase tracking-wider">Alumni by Program</h2>
          
          <div className="flex-1 py-4 space-y-3">
            {Object.keys(programCounts).map((prog) => {
              const totalInProg = programCounts[prog] || 0;
              const registeredInProg = programRegisteredCounts[prog] || 0;
              const percentage = totalInProg > 0 ? Math.round((registeredInProg / totalInProg) * 100) : 0;
              
              // Tagasalin ng opisyal na kurso para sa mas maikling pangalan
              const codeMap = {
                'Bachelor of Science in Information Technology': 'Information Technology',
                'Bachelor of Science in Hospitality Management': 'Hospitality Management',
                'Bachelor of Science in Tourism Management': 'Tourism Management',
                'Bachelor of Science in Industrial Technology': 'Industrial Technology',
                'Bachelor of Science in Agriculture': 'Agriculture',
                'Bachelor of Elementary Education': 'Elementary Education',
                'Bachelor of Secondary Education': 'Secondary Education',
              };

              return (
                <div key={prog} className="space-y-1 group/row">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-655 truncate max-w-[210px] group-hover/row:text-slate-900 transition-colors" title={prog}>{codeMap[prog] || prog}</span>
                    <span className="text-[#7c191e] font-extrabold">{registeredInProg} / {totalInProg} registered</span>
                  </div>
                  <div className="h-5.5 w-full bg-slate-100 rounded-md overflow-hidden relative border border-slate-205 group-hover/row:border-slate-300 transition-colors">
                    <div 
                      className={`h-full bg-[#7c191e] rounded-r-xs transition-all duration-500 flex items-center ${registeredInProg > 0 ? 'px-2' : 'px-0'}`}
                      style={{ width: `${registeredInProg > 0 ? (percentage || 4) : 0}%` }}
                    >
                      {percentage > 10 && (
                        <span className="text-[9px] font-bold text-[#cca43b]">{percentage}%</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION: ADVANCED TRACER ANALYTICS & GRADUATE METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Curricular Job Relevance & Time to Land First Job */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 uppercase tracking-wider">Curricular Relevance & Placement</h2>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Graduate job relevance metrics and employment transition speeds.</p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Syllabus-to-Career Alignment</h3>
            <div className="space-y-3">
              {/* Yes */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Directly Aligned (Yes)</span>
                  <span className="text-emerald-700 font-bold">{relevanceYes} ({relevanceYesPct}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${relevanceYesPct}%` }} />
                </div>
              </div>
              {/* Partially */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-655">Partially Aligned</span>
                  <span className="text-amber-700 font-bold">{relevancePartially} ({relevancePartiallyPct}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${relevancePartiallyPct}%` }} />
                </div>
              </div>
              {/* No */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-655">Unrelated Career (No)</span>
                  <span className="text-rose-700 font-bold">{relevanceNo} ({relevanceNoPct}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${relevanceNoPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Time to Land First Job</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Immediate</span>
                <div className="text-lg font-black text-slate-800">{timeImmediate}</div>
                <span className="text-[10px] text-emerald-600 font-bold block">{timeImmediatePct}% of cohort</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">1 to 6 Months</span>
                <div className="text-lg font-black text-slate-800">{time1to6}</div>
                <span className="text-[10px] text-slate-500 font-bold block">{time1to6Pct}% of cohort</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">7 to 11 Months</span>
                <div className="text-lg font-black text-slate-800">{time7to11}</div>
                <span className="text-[10px] text-slate-500 font-bold block">{time7to11Pct}% of cohort</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">1 Year or Longer</span>
                <div className="text-lg font-black text-slate-800">{time1YearPlus}</div>
                <span className="text-[10px] text-rose-500 font-bold block">{time1YearPlusPct}% of cohort</span>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Ranges & Geographic Location/Sector Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 uppercase tracking-wider">Salary Range & Geographic Layout</h2>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Monthly wage brackets, target sectors, and geographic reach.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Monthly Salary Bracket</h3>
            <div className="space-y-2.5">
              {/* Above 40k */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-655 w-24">Above 40,000</span>
                <div className="flex-1 mx-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-600 rounded-full" style={{ width: `${salOver40kPct}%` }} />
                </div>
                <span className="font-extrabold text-slate-700 w-12 text-right">{salOver40k} ({salOver40kPct}%)</span>
              </div>
              {/* 30k-40k */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-655 w-24">30,001 - 40,000</span>
                <div className="flex-1 mx-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${sal30to40kPct}%` }} />
                </div>
                <span className="font-extrabold text-slate-700 w-12 text-right">{sal30to40k} ({sal30to40kPct}%)</span>
              </div>
              {/* 20k-30k */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-655 w-24">20,001 - 30,000</span>
                <div className="flex-1 mx-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${sal20to30kPct}%` }} />
                </div>
                <span className="font-extrabold text-slate-700 w-12 text-right">{sal20to30k} ({sal20to30kPct}%)</span>
              </div>
              {/* 10k-20k */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-655 w-24">10,000 - 20,000</span>
                <div className="flex-1 mx-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${sal10to20kPct}%` }} />
                </div>
                <span className="font-extrabold text-slate-700 w-12 text-right">{sal10to20k} ({sal10to20kPct}%)</span>
              </div>
              {/* Under 10k */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-655 w-24">Under 10,000</span>
                <div className="flex-1 mx-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${salUnder10kPct}%` }} />
                </div>
                <span className="font-extrabold text-slate-700 w-12 text-right">{salUnder10k} ({salUnder10kPct}%)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
            {/* Sector */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Employment Sector</h3>
              <div className="space-y-1.5 text-[11px] font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Private Enterprise</span>
                  <span className="font-bold text-slate-800">{sectorPrivate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Public / Gov't</span>
                  <span className="font-bold text-slate-800">{sectorPublic}</span>
                </div>
                <div className="flex justify-between">
                  <span>NGO / Non-Profit</span>
                  <span className="font-bold text-slate-800">{sectorNGO}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Other / Unemployed</span>
                  <span>{sectorNA}</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2 border-l border-slate-100 pl-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Geographic Reach</h3>
              <div className="space-y-1.5 text-[11px] font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Local (Batanes)</span>
                  <span className="font-bold text-slate-800">{locLocal}</span>
                </div>
                <div className="flex justify-between">
                  <span>National (Provinces)</span>
                  <span className="font-bold text-slate-800">{locNational}</span>
                </div>
                <div className="flex justify-between">
                  <span>International (Overseas)</span>
                  <span className="font-bold text-slate-800">{locInternational}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Listahan ng kamakailang activity logs */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Recent System Activity</h2>
          <button 
            onClick={() => onNavigate('Activity Log')}
            className="text-xs font-semibold text-[#7c191e] hover:underline flex items-center gap-1 cursor-pointer select-none"
          >
            Audit Log Dashboard &rarr;
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No system logging interactions cataloged yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.slice(0, 4).map((log) => (
              <div key={log.id} className="py-3 flex items-start gap-3 text-xs">
                <div className="p-1.5 bg-slate-100 text-slate-500 rounded-md shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-slate-700">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-500 leading-relaxed font-medium">{log.details}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-2 py-0.5 bg-[#7c191e]/10 text-[#7c191e] text-[9px] rounded-xs font-bold uppercase tracking-wider border border-[#7c191e]/20">
                      Mod: {log.module}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      By &bull; {log.userName} ({log.userRole})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Tooltip layer kapag tinapatan ang donut chart segments */}
      {tooltip && (
        <div 
          className="fixed bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none z-50 border border-slate-805"
          style={{ left: `${tooltip.x + 10}px`, top: `${tooltip.y - 10}px`, transform: 'translate(-50%, -100%)' }}
        >
          <div className="text-[#cca43b] font-extrabold uppercase text-[9px] mb-0.5">{tooltip.title}</div>
          <div className="text-white font-bold">{tooltip.value}</div>
        </div>
      )}
    </div>
  );
}
