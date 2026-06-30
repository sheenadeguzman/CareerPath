import React from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Award, 
  Building 
} from 'lucide-react';

export default function EmploymentAnalytics({ filteredAlumni = [] }) {
  const totalInScope = filteredAlumni.length;
  const registeredInScope = filteredAlumni.filter(a => a.isRegistered);
  const totalRegisteredCount = registeredInScope.length;

  // Employed base sets
  const employedList = registeredInScope.filter(a => 
    ['Employed', 'Freelance', 'Self-Employed'].includes(a.employmentStatus)
  );
  const employedCount = employedList.length;

  // Employment placement rate calculation
  const employmentRate = totalInScope > 0 
    ? Math.round((employedCount / totalInScope) * 100) 
    : 0;

  // Average Monthly Income ng mga employed (gumagamit ng tinantyang numerical average base sa bracket string)
  const getSalaryNumeric = (bracket) => {
    if (bracket === '10,000 - 20,000') return 15000;
    if (bracket === '20,001 - 30,000') return 25000;
    if (bracket === '30,001 - 40,000') return 35000;
    if (bracket === 'Above 40,000') return 45000;
    return 0;
  };
  const validSalaries = employedList.map(a => getSalaryNumeric(a.monthlyIncome)).filter(val => val > 0);
  const averageSalaryNumeric = validSalaries.length > 0 
    ? Math.round(validSalaries.reduce((acc, curr) => acc + curr, 0) / validSalaries.length) 
    : 0;

  // Time to First Job representation (mga nakahanap ng trabaho sa loob ng 6 na buwan)
  const fastLandingCount = employedList.filter(a => 
    a.timeToFirstJob === 'Less than 6 months' || a.timeToFirstJob === '1-3 months' || a.timeToFirstJob === '3-6 months'
  ).length;
  const fastLandingPct = employedCount > 0 
    ? Math.round((fastLandingCount / employedCount) * 100) 
    : 0;

  // Course Relatedness distribution
  const courseAlignedCount = employedList.filter(a => a.jobRelatedToCourse === 'Yes').length;
  const courseAlignedPart = employedList.filter(a => a.jobRelatedToCourse === 'Partially').length;
  const courseAlignedNo = employedList.filter(a => a.jobRelatedToCourse === 'No').length;
  const alignedPct = employedCount > 0 
    ? Math.round((courseAlignedCount / employedCount) * 100) 
    : 0;

  // Status distributions
  const fullTimeCount = employedList.filter(a => a.employmentStatus === 'Employed').length;
  const freelanceCount = employedList.filter(a => a.employmentStatus === 'Freelance').length;
  const selfCount = employedList.filter(a => a.employmentStatus === 'Self-Employed').length;
  const studyCount = registeredInScope.filter(a => a.employmentStatus === 'Further Studies').length;
  const unemployedCount = registeredInScope.filter(a => a.employmentStatus === 'Unemployed').length + (totalInScope - totalRegisteredCount);

  // Salary brackets distributions
  const salaryBrackets = {
    '10k - 20k': employedList.filter(a => a.monthlyIncome === '10,000 - 20,000').length,
    '20k - 30k': employedList.filter(a => a.monthlyIncome === '20,001 - 30,000').length,
    '30k - 40k': employedList.filter(a => a.monthlyIncome === '30,001 - 40,000').length,
    'Above 40k': employedList.filter(a => a.monthlyIncome === 'Above 40,000').length,
  };

  // Industry distributions
  const industryCounts = {
    'Information Technology': employedList.filter(a => a.jobIndustry === 'Information Technology').length,
    'Education / Academia': employedList.filter(a => a.jobIndustry === 'Education / Academia').length,
    'Agriculture / Forestry / Fisheries': employedList.filter(a => a.jobIndustry === 'Agriculture / Forestry / Fisheries').length,
    'Hospitality / Tourism / Food Service': employedList.filter(a => a.jobIndustry === 'Hospitality / Tourism / Food Service').length,
    'Government / Public Administration': employedList.filter(a => a.jobIndustry === 'Government / Public Administration').length,
    'Business / Finance / Administration': employedList.filter(a => a.jobIndustry === 'Business / Finance / Administration').length,
    'Healthcare / Medical': employedList.filter(a => a.jobIndustry === 'Healthcare / Medical').length,
    'Engineering / Construction': employedList.filter(a => a.jobIndustry === 'Engineering / Construction').length,
    'Others': employedList.filter(a => a.jobIndustry === 'Others' || (!a.jobIndustry && ['Employed', 'Freelance', 'Self-Employed'].includes(a.employmentStatus))).length,
  };

  const industryDistribution = Object.entries(industryCounts)
    .map(([industry, count]) => ({ industry, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      {/* 3. KPI Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* KPI 1: Employment Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Placement Rate</span>
            <div className="text-2xl font-extrabold text-[#7c191e]">{employmentRate}%</div>
            <span className="text-[9px] font-bold text-slate-400 block mt-0.5">
              {employedCount} out of {totalInScope} total {totalInScope <= 1 ? 'grad' : 'grads'}
            </span>
          </div>
          <div className="p-3 bg-[#7c191e]/10 text-[#7c191e] rounded-lg">
            <Briefcase className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* KPI 2: Estimated Average Monthly Salary */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Salary</span>
            <div className="text-2xl font-extrabold text-slate-800">
              {averageSalaryNumeric > 0 ? `₱${averageSalaryNumeric.toLocaleString()}` : 'N/A'}
            </div>
            <span className="text-[9px] font-bold text-slate-400 block mt-0.5">
              Calculated from reported brackets
            </span>
          </div>
          <div className="p-3 bg-[#7c191e]/10 text-[#7c191e] rounded-lg">
            <DollarSign className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* KPI 3: Time To First Job (Fast landing rate) */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fast Landing Index</span>
            <div className="text-2xl font-extrabold text-slate-800">{fastLandingPct}%</div>
            <span className="text-[9px] font-bold text-slate-400 block mt-0.5">
              Hired in less than 6 months
            </span>
          </div>
          <div className="p-3 bg-[#7c191e]/10 text-[#7c191e] rounded-lg">
            <Clock className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* KPI 4: Curriculum Alignment index */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Course Alignment</span>
            <div className="text-2xl font-extrabold text-slate-800">{alignedPct}%</div>
            <span className="text-[9px] font-bold text-slate-400 block mt-0.5">
              Graduates in course-related jobs
            </span>
          </div>
          <div className="p-3 bg-[#7c191e]/10 text-[#7c191e] rounded-lg">
            <Award className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      {/* 4. Graphical and Progress Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Distribution progress bars */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <TrendingUp className="w-4 h-4 text-[#7c191e]" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Placement Distributions</span>
          </div>

          <div className="space-y-3.5 pt-1 text-xs">
            {/* Employed Full-time */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-705 text-[11px]">
                <span>Full-time Employed</span>
                <span>{fullTimeCount} {fullTimeCount <= 1 ? 'grad' : 'grads'}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-[#7c191e] h-full" style={{ width: `${totalInScope > 0 ? (fullTimeCount / totalInScope) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Freelancers */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-705 text-[11px]">
                <span>Freelance Contractual</span>
                <span>{freelanceCount} {freelanceCount <= 1 ? 'grad' : 'grads'}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-[#cca43b] h-full" style={{ width: `${totalInScope > 0 ? (freelanceCount / totalInScope) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Self-Employed */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-705 text-[11px]">
                <span>Self-Employed (Entrepreneurs)</span>
                <span>{selfCount} {selfCount <= 1 ? 'grad' : 'grads'}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full" style={{ width: `${totalInScope > 0 ? (selfCount / totalInScope) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Further Studies */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-705 text-[11px]">
                <span>Further Studies</span>
                <span>{studyCount} {studyCount <= 1 ? 'grad' : 'grads'}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-sky-600 h-full" style={{ width: `${totalInScope > 0 ? (studyCount / totalInScope) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Unemployed */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-705 text-[11px]">
                <span>Unemployed / Unresponsive</span>
                <span>{unemployedCount} {unemployedCount <= 1 ? 'grad' : 'grads'}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-slate-350 h-full" style={{ width: `${totalInScope > 0 ? (unemployedCount / totalInScope) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Salary Bracket Distributions */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <DollarSign className="w-4 h-4 text-[#cca43b]" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Salary Bracket Distribution</span>
          </div>

          <div className="space-y-4 pt-2 text-xs">
            {Object.entries(salaryBrackets).map(([bracket, count]) => {
              const pct = employedCount > 0 ? Math.round((count / employedCount) * 100) : 0;
              return (
                <div key={bracket} className="space-y-1">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="font-extrabold text-slate-650">{bracket}</span>
                    <span className="font-mono text-slate-455 font-bold">{count} {count <= 1 ? 'grad' : 'grads'} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div className="h-full bg-slate-700 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Course Alignment Breakdown */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <Award className="w-4 h-4 text-[#7c191e]" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Syllabus-to-Career Alignment</span>
          </div>

          <div className="space-y-4 pt-2 text-xs">
            <p className="text-[10.5px] text-slate-455 font-medium leading-relaxed">
              Measures how well the graduates' active work profiles align with their degree programs at Batanes State College.
            </p>
            
            {/* Yes - Course Related */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full block" /> Course Related
                </span>
                <span>{courseAlignedCount} {courseAlignedCount <= 1 ? 'grad' : 'grads'} ({employedCount > 0 ? Math.round((courseAlignedCount / employedCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                <div className="h-full bg-emerald-500" style={{ width: `${employedCount > 0 ? (courseAlignedCount / employedCount) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Partially Aligned */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#cca43b] rounded-full block" /> Partially Aligned
                </span>
                <span>{courseAlignedPart} {courseAlignedPart <= 1 ? 'grad' : 'grads'} ({employedCount > 0 ? Math.round((courseAlignedPart / employedCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                <div className="h-full bg-[#cca43b]" style={{ width: `${employedCount > 0 ? (courseAlignedPart / employedCount) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Non-Related */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-rose-500 rounded-full block" /> Non-Related
                </span>
                <span>{courseAlignedNo} {courseAlignedNo <= 1 ? 'grad' : 'grads'} ({employedCount > 0 ? Math.round((courseAlignedNo / employedCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                <div className="h-full bg-rose-500" style={{ width: `${employedCount > 0 ? (courseAlignedNo / employedCount) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Industry / Field of Employment Distribution */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-1.5 border-b border-slate-50 pb-2">
          <Building className="w-4 h-4 text-[#7c191e]" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Field of Employment / Industry Distribution</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-1 text-xs">
          {industryDistribution.map(({ industry, count }) => {
            const pct = employedCount > 0 ? Math.round((count / employedCount) * 100) : 0;
            return (
              <div key={industry} className="space-y-1">
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="font-extrabold text-slate-655 truncate pr-2 w-3/4" title={industry}>{industry}</span>
                  <span className="font-mono text-slate-455 font-bold shrink-0">{count} {count <= 1 ? 'grad' : 'grads'} ({pct}%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1e4620]" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
